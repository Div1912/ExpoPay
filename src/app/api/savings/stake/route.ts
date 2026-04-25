import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { stakeExpo } from '@/lib/savings';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount_expo, duration_days } = await request.json();
  if (!amount_expo || ![30, 60, 90].includes(duration_days)) {
    return NextResponse.json({ error: 'Invalid amount or duration (30/60/90 days)' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stellar_secret, stellar_address, universal_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stellar_secret) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  const rewardBps: Record<number, number> = { 30: 125, 60: 300, 90: 600 };
  const amountInStroops = BigInt(Math.round(parseFloat(amount_expo) * 10_000_000));
  const rewardExpo = (parseFloat(amount_expo) * rewardBps[duration_days]) / 10000;

  try {
    const { txHash, stakeId } = await stakeExpo(
      profile.stellar_secret,
      profile.stellar_address,
      amountInStroops,
      duration_days as 30 | 60 | 90
    );

    const unlocksAt = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000);

    const { data: position, error } = await supabaseAdmin
      .from('staking_positions')
      .insert({
        user_id:        user.id,
        universal_id:   profile.universal_id,
        stake_id:       stakeId,
        amount_expo:    parseFloat(amount_expo),
        duration_days,
        reward_bps:     rewardBps[duration_days],
        reward_expo:    rewardExpo,
        status:         'active',
        tx_hash_stake:  txHash,
        unlocks_at:     unlocksAt.toISOString(),
      })
      .select()
      .single();

    if (error) console.error('DB insert error:', error);

    return NextResponse.json({
      success:  true,
      tx_hash:  txHash,
      stake_id: stakeId,
      position,
      message:  `Staked ${amount_expo} EXPO for ${duration_days} days. Expected reward: ${rewardExpo.toFixed(4)} EXPO`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Staking failed' }, { status: 500 });
  }
}
