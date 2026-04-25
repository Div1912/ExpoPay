import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: stakes }, { data: pools }] = await Promise.all([
    supabaseAdmin
      .from('staking_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('staked_at', { ascending: false }),
    supabaseAdmin
      .from('pool_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('deposited_at', { ascending: false }),
  ]);

  // Compute live EXPO accrual for active pool positions
  // Rate: 0.5% per day (BASE_REWARD_BPS_PER_DAY = 50)
  const now = Date.now();
  const poolsWithAccrual = (pools || []).map((p: any) => {
    if (p.status !== 'active') return p;
    const daysElapsed = (now - new Date(p.deposited_at).getTime()) / (1000 * 60 * 60 * 24);
    const accrued     = (p.amount_xlm * 50 * daysElapsed) / 10000;
    return { ...p, expo_accrued: Math.max(0, accrued) };
  });

  return NextResponse.json({
    stakes: stakes || [],
    pools:  poolsWithAccrual,
    summary: {
      active_stakes:        (stakes || []).filter((s: any) => s.status === 'active').length,
      active_pool_positions:(pools  || []).filter((p: any) => p.status === 'active').length,
      total_staked_expo:    (stakes || []).filter((s: any) => s.status === 'active')
                              .reduce((sum: number, s: any) => sum + parseFloat(s.amount_expo), 0),
      total_in_pool_xlm:    (pools  || []).filter((p: any) => p.status === 'active')
                              .reduce((sum: number, p: any) => sum + parseFloat(p.amount_xlm), 0),
    },
  });
}
