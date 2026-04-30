"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, CheckCircle2, Info,
  Loader2, RefreshCw, Radio, Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LogEntry {
  id: string;
  level: "info" | "warn" | "error";
  event: string;
  route: string | null;
  user_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

interface HourlyStat {
  hour: string;
  errors: number;
  warns: number;
  infos: number;
}

const LEVEL_STYLES = {
  error: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
    dot: "bg-red-500",
    badge: "bg-red-500/20 text-red-400",
    icon: AlertTriangle,
  },
  warn: {
    bg: "bg-yellow-500/10 border-yellow-500/20",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
    badge: "bg-yellow-500/20 text-yellow-400",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-500/5 border-blue-500/10",
    text: "text-blue-300",
    dot: "bg-blue-500",
    badge: "bg-blue-500/20 text-blue-300",
    icon: Info,
  },
};

export default function MonitoringDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [livePulse, setLivePulse] = useState(false);
  const [newLogCount, setNewLogCount] = useState(0);

  const fetchLogs = useCallback(async (level = levelFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?level=${level}&limit=100`);
      if (res.status === 403) { setError("Access denied — admin only"); return; }
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data.logs ?? []);
      setHourlyStats(data.hourly_stats ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [levelFilter]);

  useEffect(() => { fetchLogs(); }, []);

  // Real-time subscription to new logs
  useEffect(() => {
    const channel = supabase
      .channel("monitoring-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "app_logs" },
        (payload) => {
          const newLog = payload.new as LogEntry;
          setLogs((prev) => [newLog, ...prev].slice(0, 100));
          setLivePulse(true);
          setNewLogCount((c) => c + 1);
          setTimeout(() => setLivePulse(false), 2000);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const maxErrors = Math.max(...hourlyStats.map(h => h.errors), 1);
  const last12h = hourlyStats.slice(-12);

  const errorCount = logs.filter(l => l.level === "error").length;
  const warnCount = logs.filter(l => l.level === "warn").length;
  const infoCount = logs.filter(l => l.level === "info").length;

  const filteredLogs = levelFilter === "all" ? logs : logs.filter(l => l.level === levelFilter);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1
              className="text-[clamp(1.8rem,6vw,3rem)] font-black tracking-tight uppercase leading-none"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              MONITORING
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <motion.div
                animate={{ scale: livePulse ? [1, 1.5, 1] : 1 }}
                transition={{ duration: 0.5 }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                {livePulse ? "New Event" : "Live"}
              </span>
            </div>
          </div>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Production log stream · Real-time Supabase
          </p>
        </div>
        <button
          onClick={() => { fetchLogs(); setNewLogCount(0); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold disabled:opacity-50 relative"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
          {newLogCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#C694F9] rounded-full text-[9px] font-black flex items-center justify-center text-black">
              {newLogCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
          {error}
        </div>
      )}

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Errors (shown)", value: errorCount, color: "#f87171" },
          { label: "Warnings", value: warnCount, color: "#facc15" },
          { label: "Info", value: infoCount, color: "#60a5fa" },
        ].map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white/[0.02]"
            style={{ borderColor: `${b.color}30` }}
          >
            <Radio className="w-3 h-3" style={{ color: b.color }} />
            <span className="text-xs font-black" style={{ color: b.color }}>{b.value}</span>
            <span className="text-[10px] font-bold text-white/30">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Error Rate Chart */}
      {last12h.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-6">
            Error Rate (Last 12 Hours)
          </h3>
          <div className="flex items-end gap-2 h-24">
            {last12h.map((h, i) => {
              const errorH = maxErrors > 0 ? Math.max((h.errors / maxErrors) * 100, h.errors > 0 ? 8 : 2) : 2;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded px-2 py-1 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {h.hour.substring(11, 13)}:00 · {h.errors}E {h.warns}W {h.infos}I
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${errorH}%` }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                    className="w-full rounded-t-md"
                    style={{
                      background: h.errors > 0
                        ? "linear-gradient(to top, #ef4444, #f87171)"
                        : "linear-gradient(to top, #4ade8030, #22c55e30)",
                      alignSelf: "flex-end",
                    }}
                  />
                  {i % 2 === 0 && (
                    <span className="text-[8px] text-white/20 font-bold">
                      {h.hour.substring(11, 13)}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Log Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-white/30" />
        {["all", "error", "warn", "info"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => { setLevelFilter(lvl); fetchLogs(lvl); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              levelFilter === lvl
                ? "bg-[#C694F9]/20 border border-[#C694F9]/30 text-[#C694F9]"
                : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Log Stream */}
      <div className="space-y-2">
        {loading && filteredLogs.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#C694F9]" />
          </div>
        )}
        {!loading && filteredLogs.length === 0 && (
          <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
            <Activity className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm font-bold">No log events yet</p>
            <p className="text-white/20 text-xs mt-1">Events will appear here as users interact with the platform</p>
          </div>
        )}
        <AnimatePresence>
          {filteredLogs.map((log) => {
            const style = LEVEL_STYLES[log.level];
            const Icon = style.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                layout
                className={`flex items-start gap-3 p-4 rounded-xl border font-mono text-xs ${style.bg}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${style.badge}`}>
                      {log.level}
                    </span>
                    {log.route && (
                      <span className="text-white/30 text-[10px]">{log.route}</span>
                    )}
                    <span className="text-white/20 text-[10px] ml-auto">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`font-bold text-[11px] ${style.text}`}>{log.event}</p>
                  {log.meta && (
                    <p className="text-white/30 text-[10px] mt-1 truncate">
                      {JSON.stringify(log.meta).substring(0, 120)}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
