import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { disputeEscrow } from '@/lib/escrow';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contract_id, reason } = await request.json();

  if (!contract_id) {
    return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
  }

  if (!reason || reason.trim().length < 10) {
    return NextResponse.json({ error: 'Please provide a detailed reason (min 10 characters)' }, { status: 400 });
  }

  const { data: contract } = await supabaseAdmin
    .from('contracts')
    .select('*')
    .eq('id', contract_id)
    .single();

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  // ── Both payer AND freelancer can raise a dispute ─────────────────────────
  const isPayer      = contract.payer_id      === user.id;
  const isFreelancer = contract.freelancer_id === user.id;

  if (!isPayer && !isFreelancer) {
    return NextResponse.json({ error: 'You are not a party to this contract' }, { status: 403 });
  }

  if (['released', 'refunded', 'disputed'].includes(contract.status)) {
    return NextResponse.json({ error: `Cannot dispute. Contract is already ${contract.status}` }, { status: 400 });
  }

  // Freelancer can only dispute once they have marked work as delivered (client ghosted)
  if (isFreelancer && contract.status !== 'delivered') {
    return NextResponse.json({
      error: 'Freelancer can only dispute after marking work as delivered and the client has not responded'
    }, { status: 400 });
  }

  // Payer can dispute at any funded/delivered stage
  if (isPayer && !['funded', 'delivered'].includes(contract.status)) {
    return NextResponse.json({
      error: `Cannot dispute. Contract is ${contract.status}`
    }, { status: 400 });
  }

  // Fetch the calling party's stellar secret to sign the on-chain tx
  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('stellar_secret')
    .eq('id', user.id)
    .single();

  if (!callerProfile?.stellar_secret) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  try {
    const txHash = await disputeEscrow(contract.escrow_id, callerProfile.stellar_secret);

    await supabaseAdmin
      .from('contracts')
      .update({
        status: 'disputed',
        disputed_at: new Date().toISOString(),
        tx_hash_dispute: txHash,
        dispute_reason: reason,
        disputed_by: isPayer ? 'payer' : 'freelancer',
      })
      .eq('id', contract_id);

    const msg = isPayer
      ? 'Dispute raised. Funds are frozen. You may now request a refund.'
      : 'Dispute raised. Funds are frozen. You can now claim your payment.';

    return NextResponse.json({ success: true, tx_hash: txHash, message: msg });
  } catch (error: any) {
    console.error('Dispute contract error:', error);
    return NextResponse.json({ error: error.message || 'Failed to raise dispute' }, { status: 500 });
  }
}
