import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { unstakeExpo } from '@/lib/savings';
import { notifyUnstake } from '@/lib/notify';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { position_id } = await request.json();
  if (!position_id) return NextResponse.json({ error: 'Missing position_id' }, { status: 400 });

  const { data: position } = await supabaseAdmin
    .from('staking_positions')
    .select('*')
    .eq('id', position_id)
    .eq('user_id', user.id)
    .single();

  if (!position) return NextResponse.json({ error: 'Position not found' }, { status: 404 });
  if (position.status !== 'active') return NextResponse.json({ error: 'Position is not active' }, { status: 400 });

  if (new Date() < new Date(position.unlocks_at)) {
    return NextResponse.json({
      error: `Stake locked until ${new Date(position.unlocks_at).toLocaleDateString('en-IN')}`,
    }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stellar_secret, stellar_address')
    .eq('id', user.id)
    .single();

  if (!profile?.stellar_secret) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

  try {
    const { txHash, payout } = await unstakeExpo(
      profile.stellar_secret,
      profile.stellar_address,
      position.stake_id
    );

    await supabaseAdmin
      .from('staking_positions')
      .update({
        status:          'completed',
        tx_hash_unstake: txHash,
        unstaked_at:     new Date().toISOString(),
      })
      .eq('id', position_id);

    const payoutExpo = Number(payout) / 10_000_000;

    // Fire-and-forget unstake confirmation email
    notifyUnstake({
      userId: user.id,
      amountExpo: position.amount_expo,
      rewardExpo: position.reward_expo,
      payoutExpo,
      durationDays: position.duration_days,
      txHash,
    }).catch(console.error);

    return NextResponse.json({
      success:     true,
      tx_hash:     txHash,
      payout_expo: payoutExpo,
      message:     `Unstaked ${payoutExpo.toFixed(4)} EXPO (principal + rewards)`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unstake failed' }, { status: 500 });
  }
}
