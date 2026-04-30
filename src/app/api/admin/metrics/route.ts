import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAILS = ['admin@expopay.app', 'support@expopay.app', 'bkbhaia@gmail.com'];

export async function GET() {
  const user = await getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalUsersRes,
      allProfilesRes,       // for DAU fallback: treat signup as a "session"
      activeUsers30dRes,
      activeUsers7dRes,
      totalTxRes,
      tx30dRes,
      tx7dRes,
      dailyTxRes,
      topUsersRes,
      recentSignupsRes,
      gaslessTxRes,
      recentSignups14dRes,  // for retention: signups before 14 days ago
      recentSignups7dRes,   // for retention: signups in 7–14 day window who also transacted
    ] = await Promise.all([
      // Total claimed accounts
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .not('universal_id', 'is', null),

      // All profiles with created_at for DAU fallback
      supabaseAdmin
        .from('profiles')
        .select('id, created_at')
        .not('universal_id', 'is', null)
        .gte('created_at', thirtyDaysAgo),

      // Active senders last 30 days
      supabaseAdmin
        .from('transactions')
        .select('sender_id, created_at')
        .gte('created_at', thirtyDaysAgo),

      // Active senders last 7 days
      supabaseAdmin
        .from('transactions')
        .select('sender_id, created_at')
        .gte('created_at', sevenDaysAgo),

      // Total transaction count
      supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true }),

      // Transactions last 30 days with amounts
      supabaseAdmin
        .from('transactions')
        .select('id, amount, currency, created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false }),

      // Transactions last 7 days count
      supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),

      // Daily transactions for charts
      supabaseAdmin
        .from('transactions')
        .select('created_at, amount, sender_id')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true }),

      // Top users
      supabaseAdmin
        .from('transactions')
        .select('sender_universal_id')
        .gte('created_at', thirtyDaysAgo),

      // Recent signups
      supabaseAdmin
        .from('profiles')
        .select('universal_id, full_name, created_at, preferred_currency')
        .not('universal_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10),

      // Gasless transactions
      supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('gasless', true),

      // Retention cohort A: users who signed up or transacted before 14 days ago
      supabaseAdmin
        .from('profiles')
        .select('id')
        .not('universal_id', 'is', null)
        .lte('created_at', fourteenDaysAgo),

      // Retention cohort B: those same users who also transacted in last 14 days
      supabaseAdmin
        .from('transactions')
        .select('sender_id')
        .gte('created_at', fourteenDaysAgo),
    ]);

    // ── Active Users (deduplicated) ───────────────────────────────────────────
    const activeSenders30d = new Set((activeUsers30dRes.data ?? []).map((r: any) => r.sender_id));
    const activeSenders7d  = new Set((activeUsers7dRes.data  ?? []).map((r: any) => r.sender_id));

    // Also count recent signups as "active" (a new signup = a DAU event)
    const recentSignupIds30d = new Set((allProfilesRes.data ?? []).map((r: any) => r.id));
    const recentSignupIds7d  = new Set(
      (allProfilesRes.data ?? [])
        .filter((r: any) => r.created_at >= sevenDaysAgo)
        .map((r: any) => r.id)
    );

    const combined30d = new Set([...activeSenders30d, ...recentSignupIds30d]);
    const combined7d  = new Set([...activeSenders7d,  ...recentSignupIds7d]);

    const activeUsers30d = combined30d.size;
    const activeUsers7d  = combined7d.size;

    // ── Daily Stats (merge tx activity + signups for DAU) ────────────────────
    const dailyMap: Record<string, { count: number; volume: number; users: Set<string> }> = {};

    // Add transaction data
    for (const tx of dailyTxRes.data ?? []) {
      const date = tx.created_at.substring(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { count: 0, volume: 0, users: new Set() };
      dailyMap[date].count += 1;
      dailyMap[date].volume += parseFloat(tx.amount ?? 0);
      if (tx.sender_id) dailyMap[date].users.add(tx.sender_id);
    }

    // Add signup data (a signup counts as a DAU event)
    for (const profile of allProfilesRes.data ?? []) {
      const date = profile.created_at.substring(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { count: 0, volume: 0, users: new Set() };
      dailyMap[date].users.add(profile.id);
    }

    // Fill in every day for the last 30 days so chart has no gaps
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().substring(0, 10);
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { count: 0, volume: 0, users: new Set() };
    }

    const dailyStats = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        transactions: d.count,
        volume: parseFloat(d.volume.toFixed(2)),
        dau: d.users.size,
      }));

    // ── Retention Rate ────────────────────────────────────────────────────────
    // "Of the users who existed before 14 days ago, what % were active in the last 14 days?"
    const cohortA = new Set((recentSignups14dRes.data ?? []).map((r: any) => r.id));
    const cohortBSenders = new Set((recentSignups7dRes.data ?? []).map((r: any) => r.sender_id));
    const retained = [...cohortA].filter(id => cohortBSenders.has(id)).length;

    let retentionRate = 0;
    if (cohortA.size > 0) {
      retentionRate = Math.round((retained / cohortA.size) * 100);
    } else if (activeUsers30d > 0) {
      // Fallback: use 7d/30d ratio as a proxy when platform is too new
      retentionRate = Math.round((activeUsers7d / Math.max(activeUsers30d, 1)) * 100);
    }

    // ── Top Users ─────────────────────────────────────────────────────────────
    const userTxCount: Record<string, number> = {};
    for (const tx of topUsersRes.data ?? []) {
      const uid = tx.sender_universal_id;
      if (uid) userTxCount[uid] = (userTxCount[uid] ?? 0) + 1;
    }
    const topUsers = Object.entries(userTxCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([universal_id, tx_count]) => ({ universal_id, tx_count }));

    // ── Volume ────────────────────────────────────────────────────────────────
    const volume30d = (tx30dRes.data ?? []).reduce(
      (sum: number, tx: any) => sum + parseFloat(tx.amount ?? 0), 0
    );

    return NextResponse.json({
      summary: {
        total_users:        totalUsersRes.count ?? 0,
        active_users_30d:   activeUsers30d,
        active_users_7d:    activeUsers7d,
        total_transactions: totalTxRes.count ?? 0,
        transactions_30d:   tx30dRes.data?.length ?? 0,
        transactions_7d:    tx7dRes.count ?? 0,
        volume_30d:         parseFloat(volume30d.toFixed(2)),
        retention_rate:     retentionRate,
        gasless_transactions: gaslessTxRes.count ?? 0,
      },
      daily_stats:    dailyStats,
      top_users:      topUsers,
      recent_signups: recentSignupsRes.data ?? [],
    });
  } catch (error: any) {
    console.error('Metrics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
