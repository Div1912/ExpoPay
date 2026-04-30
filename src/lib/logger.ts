import { supabaseAdmin } from '@/lib/supabase';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEvent {
  level: LogLevel;
  event: string;
  route?: string;
  user_id?: string;
  meta?: Record<string, unknown>;
}

/**
 * Structured logger that persists events to the `app_logs` Supabase table.
 * Fire-and-forget — never throws so it can't break the caller.
 */
export async function logEvent(params: LogEvent): Promise<void> {
  try {
    await supabaseAdmin.from('app_logs').insert({
      level: params.level,
      event: params.event,
      route: params.route ?? null,
      user_id: params.user_id ?? null,
      meta: params.meta ?? null,
    });
  } catch (err) {
    // Logging should never crash the app
    console.error('[logger] Failed to persist log:', err);
  }
}

export async function logInfo(event: string, opts?: Omit<LogEvent, 'level' | 'event'>): Promise<void> {
  return logEvent({ level: 'info', event, ...opts });
}

export async function logWarn(event: string, opts?: Omit<LogEvent, 'level' | 'event'>): Promise<void> {
  return logEvent({ level: 'warn', event, ...opts });
}

export async function logError(
  event: string,
  error: unknown,
  opts?: Omit<LogEvent, 'level' | 'event' | 'meta'>
): Promise<void> {
  const meta: Record<string, unknown> = {};
  if (error instanceof Error) {
    meta.message = error.message;
    meta.stack = error.stack?.split('\n').slice(0, 5).join('\n');
  } else {
    meta.raw = String(error);
  }
  return logEvent({ level: 'error', event, meta, ...opts });
}
