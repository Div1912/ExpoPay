import { NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

export async function GET(request: Request) {
  const user = await getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') || 'all'; // 'info'|'warn'|'error'|'all'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);

  try {
    let query = supabaseAdmin
      .from('app_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (level !== 'all') {
      query = query.eq('level', level);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Also fetch error counts per hour for the last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: errorStats } = await supabaseAdmin
      .from('app_logs')
      .select('level, created_at')
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: true });

    // Group errors by hour
    const hourlyErrors: Record<string, { errors: number; warns: number; infos: number }> = {};
    for (const log of errorStats ?? []) {
      const hour = log.created_at.substring(0, 13) + ':00:00Z'; // "YYYY-MM-DDTHH:00:00Z"
      if (!hourlyErrors[hour]) hourlyErrors[hour] = { errors: 0, warns: 0, infos: 0 };
      if (log.level === 'error') hourlyErrors[hour].errors++;
      else if (log.level === 'warn') hourlyErrors[hour].warns++;
      else hourlyErrors[hour].infos++;
    }

    const hourlyStats = Object.entries(hourlyErrors)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, counts]) => ({ hour, ...counts }));

    return NextResponse.json({
      logs: data ?? [],
      hourly_stats: hourlyStats,
    });
  } catch (error: any) {
    console.error('Logs API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
