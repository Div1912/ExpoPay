import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { withdrawFromPool } from '@/lib/savings';

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { position_id } = await request.json();
  if (!position_id) return NextResponse.json({ error: 'Missing position_id' }, { status: 400 });

  const { data: position } = await supabaseAdmin
    .from('pool_positions')
    .select('*')
    .eq('id', position_id)
    .eq('user_id', user.id)
    .single();

  if (!position)                   return NextResponse.json({ error: 'Position not found' }, { status: 404 });
  if (position.status !== 'active') return NextResponse.json({ error: 'Already withdrawn' }, { status: 400 });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('stellar_secret, stellar_address')
    .eq('id', user.id)
    .single();

  if (!profile?.stellar_secret) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

  try {
    const { txHash, xlmAmount, expoReward } = await withdrawFromPool(
      profile.stellar_secret,
      profile.stellar_address,
      position.position_id
    );

    const xlmBack    = Number(xlmAmount)  / 10_000_000;
    const expoEarned = Number(expoReward) / 10_000_000;

    await supabaseAdmin
      .from('pool_positions')
      .update({
        status:           'withdrawn',
        expo_earned:      expoEarned,
        tx_hash_withdraw: txHash,
        withdrawn_at:     new Date().toISOString(),
      })
      .eq('id', position_id);

    return NextResponse.json({
      success:     true,
      tx_hash:     txHash,
      xlm_back:    xlmBack,
      expo_earned: expoEarned,
      message:     `Withdrew ${xlmBack} XLM + ${expoEarned.toFixed(4)} EXPO rewards`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Withdrawal failed' }, { status: 500 });
  }
}
