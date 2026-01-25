import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { refundEscrow } from '@/lib/escrow';

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

  if (contract.payer_id !== user.id) {
    return NextResponse.json({ error: 'Only buyer/payer can request a refund' }, { status: 403 });
  }

  if (contract.status === 'released' || contract.status === 'refunded') {
    return NextResponse.json({ error: `Cannot refund. Contract already ${contract.status}` }, { status: 400 });
  }

  const isExpired = contract.expiry_timestamp && (Date.now() / 1000) > contract.expiry_timestamp;
  const isDisputed = contract.status === 'disputed';
  
  if (!isExpired && !isDisputed) {
    return NextResponse.json({ 
      error: 'Can only refund if contract is disputed or expired' 
    }, { status: 400 });
  }

  const { data: payerProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!payerProfile?.stellar_secret) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  if (payerProfile.app_pin) {
    if (!pin) {
      return NextResponse.json({ error: 'PIN required' }, { status: 400 });
    }
    if (payerProfile.app_pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }
  }

  try {
    const txHash = await refundEscrow(contract.escrow_id, payerProfile.stellar_secret);

    await supabaseAdmin
      .from('contracts')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        tx_hash_refund: txHash,
      })
      .eq('id', contract_id);

    return NextResponse.json({
      success: true,
      tx_hash: txHash,
      message: 'Refund processed successfully. Funds returned to your wallet.'
    });
  } catch (error: any) {
    console.error('Refund contract error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process refund' }, { status: 500 });
  }
}
