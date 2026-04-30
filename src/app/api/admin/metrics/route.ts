import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

export async function GET() {
  const user = await getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Run all queries in parallel
    const [
      totalUsersRes,
      activeUsers30dRes,
      activeUsers7dRes,
      totalTxRes,
      tx30dRes,
      tx7dRes,
      dailyTxRes,
      dailyUsersRes,
      topUsersRes,
      recentSignupsRes,
      gaslessTxRes,
    ] = await Promise.all([
      // Total claimed accounts
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .not('universal_id', 'is', null),

      // Active users last 30 days (distinct senders)
      supabaseAdmin
        .from('transactions')
        .select('sender_id')
        .gte('created_at', thirtyDaysAgo),

      // Active users last 7 days
      supabaseAdmin
        .from('transactions')
        .select('sender_id')
        .gte('created_at', sevenDaysAgo),

      // Total transaction count
      supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true }),

      // Transactions last 30 days
      supabaseAdmin
        .from('transactions')
        .select('id, amount, currency, created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false }),

      // Transactions last 7 days
      supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),

      // Daily transaction counts (last 30 days) — grouped in JS
      supabaseAdmin
        .from('transactions')
        .select('created_at, amount')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true }),

      // Daily active users (distinct senders per day)
      supabaseAdmin
        .from('transactions')
        .select('sender_id, created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true }),

      // Top users by transaction count
      supabaseAdmin
        .from('transactions')
        .select('sender_universal_id')
        .gte('created_at', thirtyDaysAgo),

      // Recent signups (last 10)
      supabaseAdmin
        .from('profiles')
        .select('universal_id, full_name, created_at, preferred_currency')
        .not('universal_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10),

      // Gasless transactions count
      supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('gasless', true),
    ]);

    // Process active users (distinct)
    const activeUsers30d = new Set((activeUsers30dRes.data ?? []).map((r: any) => r.sender_id)).size;
    const activeUsers7d = new Set((activeUsers7dRes.data ?? []).map((r: any) => r.sender_id)).size;

    // Process daily data — group by date string
    const dailyMap: Record<string, { count: number; volume: number; users: Set<string> }> = {};
    for (const tx of dailyTxRes.data ?? []) {
      const date = tx.created_at.substring(0, 10); // "YYYY-MM-DD"
      if (!dailyMap[date]) dailyMap[date] = { count: 0, volume: 0, users: new Set() };
      dailyMap[date].count += 1;
      dailyMap[date].volume += parseFloat(tx.amount ?? 0);
    }
    for (const tx of dailyUsersRes.data ?? []) {
      const date = tx.created_at.substring(0, 10);
      if (!dailyMap[date]) dailyMap[date] = { count: 0, volume: 0, users: new Set() };
      dailyMap[date].users.add(tx.sender_id);
    }

    const dailyStats = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        transactions: d.count,
        volume: parseFloat(d.volume.toFixed(2)),
        dau: d.users.size,
      }));

    // Top users
    const userTxCount: Record<string, number> = {};
    for (const tx of topUsersRes.data ?? []) {
      const uid = tx.sender_universal_id;
      if (uid) userTxCount[uid] = (userTxCount[uid] ?? 0) + 1;
    }
    const topUsers = Object.entries(userTxCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([universal_id, tx_count]) => ({ universal_id, tx_count }));

    // Retention: simple week-over-week
    // Users who sent in week 1 (days 14-21 ago) AND week 2 (days 7-14 ago)
    const week1Start = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();
    const week1End = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const week2Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const week2End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [week1Res, week2Res] = await Promise.all([
      supabaseAdmin.from('transactions').select('sender_id').gte('created_at', week1Start).lte('created_at', week1End),
      supabaseAdmin.from('transactions').select('sender_id').gte('created_at', week2Start).lte('created_at', week2End),
    ]);

    const week1Users = new Set((week1Res.data ?? []).map((r: any) => r.sender_id));
    const week2Users = new Set((week2Res.data ?? []).map((r: any) => r.sender_id));
    const retained = [...week1Users].filter(id => week2Users.has(id)).length;
    const retentionRate = week1Users.size > 0 ? Math.round((retained / week1Users.size) * 100) : 0;

    // Total volume (30d)
    const volume30d = (tx30dRes.data ?? []).reduce((sum: number, tx: any) => sum + parseFloat(tx.amount ?? 0), 0);

    return NextResponse.json({
      summary: {
        total_users: totalUsersRes.count ?? 0,
        active_users_30d: activeUsers30d,
        active_users_7d: activeUsers7d,
        total_transactions: totalTxRes.count ?? 0,
        transactions_30d: tx30dRes.data?.length ?? 0,
        transactions_7d: tx7dRes.count ?? 0,
        volume_30d: parseFloat(volume30d.toFixed(2)),
        retention_rate: retentionRate,
        gasless_transactions: gaslessTxRes.count ?? 0,
      },
      daily_stats: dailyStats,
      top_users: topUsers,
      recent_signups: recentSignupsRes.data ?? [],
    });
  } catch (error: any) {
    console.error('Metrics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
