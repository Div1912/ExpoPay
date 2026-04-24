import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { refundEscrow, releaseEscrow } from '@/lib/escrow';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contract_id, pin } = await request.json();

  if (!contract_id) {
    return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
  }

  const { data: contract } = await supabaseAdmin
    .from('contracts')
    .select('*')
    .eq('id', contract_id)
    .single();

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
  }

  const isPayer      = contract.payer_id      === user.id;
  const isFreelancer = contract.freelancer_id === user.id;

  if (!isPayer && !isFreelancer) {
    return NextResponse.json({ error: 'You are not a party to this contract' }, { status: 403 });
  }

  if (['released', 'refunded'].includes(contract.status)) {
    return NextResponse.json({ error: `Contract already ${contract.status}` }, { status: 400 });
  }

  const isExpired  = contract.expiry_timestamp && (Date.now() / 1000) > contract.expiry_timestamp;
  const isDisputed = contract.status === 'disputed';

  // ── Payer refund: requires dispute (they raised) or expiry ────────────────
  if (isPayer) {
    if (!isExpired && !isDisputed) {
      return NextResponse.json({
        error: 'Can only refund if contract is disputed or has expired'
      }, { status: 400 });
    }
    // Freelancer raised the dispute — payer cannot self-refund
    if (isDisputed && contract.disputed_by === 'freelancer') {
      return NextResponse.json({
        error: 'This dispute was raised by the freelancer. An arbiter must resolve it.'
      }, { status: 403 });
    }
  }

  // ── Freelancer claim: only when THEY raised the dispute ───────────────────
  if (isFreelancer) {
    if (!isDisputed) {
      return NextResponse.json({
        error: 'You can only claim funds after raising a dispute'
      }, { status: 400 });
    }
    if (contract.disputed_by !== 'freelancer') {
      return NextResponse.json({
        error: 'This dispute was raised by the client. An arbiter will resolve it.'
      }, { status: 403 });
    }
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!callerProfile?.stellar_secret) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  // PIN check for payer only
  if (isPayer && callerProfile.app_pin) {
    if (!pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 });
    if (callerProfile.app_pin !== pin) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
  }

  try {
    if (isPayer) {
      // Payer refund: return funds to client
      const txHash = await refundEscrow(contract.escrow_id, callerProfile.stellar_secret);

      await supabaseAdmin
        .from('contracts')
        .update({ status: 'refunded', refunded_at: new Date().toISOString(), tx_hash_refund: txHash })
        .eq('id', contract_id);

      return NextResponse.json({
        success: true,
        tx_hash: txHash,
        message: 'Refund processed. Funds returned to your wallet.'
      });
    } else {
      // Freelancer claim: release escrow funds to freelancer
      const txHash = await releaseEscrow(contract.escrow_id, callerProfile.stellar_secret);

      await supabaseAdmin
        .from('contracts')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
          tx_hash_release: txHash,
        })
        .eq('id', contract_id);

      await supabaseAdmin
        .from('transactions')
        .insert({
          sender_id:              contract.payer_id,
          recipient_id:           contract.freelancer_id,
          sender_universal_id:    contract.payer_universal_id,
          recipient_universal_id: contract.freelancer_universal_id,
          amount:                 contract.amount,
          currency:               contract.currency,
          tx_hash:                txHash,
          status:                 'completed',
          note:                   `Dispute Resolved (Freelancer Claim): ${contract.title}`,
          purpose:                'Contract Dispute Release',
        });

      return NextResponse.json({
        success: true,
        tx_hash: txHash,
        message: 'Dispute resolved. Funds released to your wallet.'
      });
    }
  } catch (error: any) {
    console.error('Refund/claim error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process' }, { status: 500 });
  }
}
