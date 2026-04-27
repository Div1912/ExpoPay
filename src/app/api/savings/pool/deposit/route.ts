import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { depositToPool } from '@/lib/savings';
import { notifyPoolDeposit } from '@/lib/notify';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount_xlm } = await request.json();
  if (!amount_xlm || parseFloat(amount_xlm) <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stellar_secret, stellar_address, universal_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stellar_secret) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

  const amountInStroops = BigInt(Math.round(parseFloat(amount_xlm) * 10_000_000));

  try {
    const { txHash, positionId } = await depositToPool(
      profile.stellar_secret,
      profile.stellar_address,
      amountInStroops
    );

    const { data: position, error } = await supabaseAdmin
      .from('pool_positions')
      .insert({
        user_id:         user.id,
        universal_id:    profile.universal_id,
        position_id:     positionId,
        amount_xlm:      parseFloat(amount_xlm),
        status:          'active',
        tx_hash_deposit: txHash,
      })
      .select()
      .single();

    if (error) console.error('DB insert error:', error);

    // Fire-and-forget email alert
    notifyPoolDeposit({
      userId: user.id,
      amount: parseFloat(amount_xlm),
      txHash,
      positionId: positionId,
    }).catch(console.error);

    return NextResponse.json({
      success:     true,
      tx_hash:     txHash,
      position_id: positionId,
      position,
      message:     `Deposited ${amount_xlm} XLM into the EXPO Yield Pool. Rewards accrue daily.`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Deposit failed' }, { status: 500 });
  }
}
