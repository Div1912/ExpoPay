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
    return NextResponse.json({ error: 'Please provide a detailed reason for the dispute (min 10 characters)' }, { status: 400 });
  }

  const { data: contract } = await supabaseAdmin
    .from('contracts')
    .select('*')
    .eq('id', contract_id)
    .single();

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  if (contract.payer_id !== user.id) {
    return NextResponse.json({ error: 'Only buyer/payer can raise a dispute' }, { status: 403 });
  }

  if (contract.status === 'released' || contract.status === 'refunded') {
    return NextResponse.json({ error: `Cannot dispute. Contract already ${contract.status}` }, { status: 400 });
  }

  if (contract.status === 'disputed') {
    return NextResponse.json({ error: 'Contract already in dispute' }, { status: 400 });
  }

  const { data: payerProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!payerProfile?.stellar_secret) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  try {
    const txHash = await disputeEscrow(contract.escrow_id, payerProfile.stellar_secret);

    await supabaseAdmin
      .from('contracts')
      .update({
        status: 'disputed',
        disputed_at: new Date().toISOString(),
        tx_hash_dispute: txHash,
        dispute_reason: reason,
      })
      .eq('id', contract_id);

    return NextResponse.json({
      success: true,
      tx_hash: txHash,
      message: 'Dispute raised on-chain. You can now request a refund.'
    });
  } catch (error: any) {
    console.error('Dispute contract error:', error);
    return NextResponse.json({ error: error.message || 'Failed to raise dispute' }, { status: 500 });
  }
}
