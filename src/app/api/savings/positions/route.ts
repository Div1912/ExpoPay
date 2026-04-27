import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

// Pool: 0.5% per day in EXPO rewards on deposited XLM (BASE_REWARD_BPS_PER_DAY = 50)
const POOL_BPS_PER_DAY = 50;

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

  const now = Date.now();

  // ── Stakes: enrich active positions with live numbers ──
  // For a fixed-term stake of `amount_expo` paying `reward_bps` over `duration_days`,
  // the linear accrual at any time t in [stake_start, stake_end] is:
  //   accrued(t) = amount * (reward_bps / 10000) * (elapsed / duration_seconds)
  // The "current value" = principal + accrued (what the user would get if they could
  // unlock right now and the contract paid pro-rata; we display this for transparency).
  const stakesWithDetails = (stakes || []).map((s: any) => {
    if (s.status !== 'active') {
      return {
        ...s,
        current_value:   parseFloat(s.amount_expo) + parseFloat(s.reward_expo),
        accrued_reward:  parseFloat(s.reward_expo),
        progress_pct:    100,
        days_remaining:  0,
        seconds_remaining: 0,
      };
    }

    const start    = new Date(s.staked_at).getTime();
    const end      = new Date(s.unlocks_at).getTime();
    const total    = Math.max(end - start, 1);
    const elapsed  = Math.min(Math.max(now - start, 0), total);
    const fraction = elapsed / total;

    const principal     = parseFloat(s.amount_expo);
    const fullReward    = parseFloat(s.reward_expo);
    const accruedReward = fullReward * fraction;
    const currentValue  = principal + accruedReward;

    const secondsRemaining = Math.max(0, Math.floor((end - now) / 1000));
    const daysRemaining    = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    return {
      ...s,
      current_value:     currentValue,
      accrued_reward:    accruedReward,
      progress_pct:      fraction * 100,
      days_remaining:    daysRemaining,
      seconds_remaining: secondsRemaining,
    };
  });

  // ── Pools: same live accrual as before ──
  const poolsWithAccrual = (pools || []).map((p: any) => {
    if (p.status !== 'active') return p;
    const daysElapsed = (now - new Date(p.deposited_at).getTime()) / (1000 * 60 * 60 * 24);
    const accrued     = (p.amount_xlm * POOL_BPS_PER_DAY * daysElapsed) / 10000;
    return { ...p, expo_accrued: Math.max(0, accrued) };
  });

  // ── Summary ──
  const activeStakes = stakesWithDetails.filter((s: any) => s.status === 'active');
  const activePools  = poolsWithAccrual.filter((p: any) => p.status === 'active');

  const totalStakedExpo  = activeStakes.reduce((sum: number, s: any) => sum + parseFloat(s.amount_expo), 0);
  const totalAccruedExpo = activeStakes.reduce((sum: number, s: any) => sum + (s.accrued_reward || 0), 0);
  const totalPendingExpo = activeStakes.reduce((sum: number, s: any) => sum + parseFloat(s.reward_expo), 0);
  const totalInPoolXlm   = activePools.reduce((sum: number, p: any) => sum + parseFloat(p.amount_xlm), 0);
  const totalPoolAccrued = activePools.reduce((sum: number, p: any) => sum + (p.expo_accrued || 0), 0);

  return NextResponse.json({
    stakes: stakesWithDetails,
    pools:  poolsWithAccrual,
    summary: {
      active_stakes:         activeStakes.length,
      active_pool_positions: activePools.length,
      total_staked_expo:     totalStakedExpo,
      total_accrued_expo:    totalAccruedExpo,
      total_pending_expo:    totalPendingExpo,
      total_in_pool_xlm:     totalInPoolXlm,
      total_pool_accrued:    totalPoolAccrued,
      // Lifetime: include completed stakes' delivered rewards
      total_lifetime_rewards: (stakes || []).reduce((sum: number, s: any) => {
        return s.status === 'completed' ? sum + parseFloat(s.reward_expo || 0) : sum;
      }, 0),
    },
  });
}
