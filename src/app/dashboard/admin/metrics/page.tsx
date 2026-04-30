"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Activity, Zap, ArrowUpRight,
  BarChart2, Calendar, Loader2, RefreshCw, Shield,
} from "lucide-react";

interface MetricsSummary {
  total_users: number;
  active_users_30d: number;
  active_users_7d: number;
  total_transactions: number;
  transactions_30d: number;
  transactions_7d: number;
  volume_30d: number;
  retention_rate: number;
  gasless_transactions: number;
}

interface DailyStat {
  date: string;
  transactions: number;
  volume: number;
  dau: number;
}

interface TopUser {
  universal_id: string;
  tx_count: number;
}

interface RecentSignup {
  universal_id: string;
  full_name: string;
  created_at: string;
  preferred_currency: string;
}

export default function MetricsDashboard() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.status === 403) { setError("Access denied — admin only"); return; }
      if (!res.ok) throw new Error("Failed to fetch metrics");
      const data = await res.json();
      setSummary(data.summary);
      setDailyStats(data.daily_stats);
      setTopUsers(data.top_users);
      setRecentSignups(data.recent_signups);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#C694F9]" />
        <p className="text-white/40 text-xs font-black uppercase tracking-widest animate-pulse">
          Loading Analytics…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Shield className="w-12 h-12 text-red-400/50 mx-auto" />
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const maxDau = Math.max(...dailyStats.map(d => d.dau), 1);
  const maxTx = Math.max(...dailyStats.map(d => d.transactions), 1);
  const last14 = dailyStats.slice(-14);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-[clamp(1.8rem,6vw,3rem)] font-black tracking-tight uppercase leading-none mb-2"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            METRICS
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            DAU · Transactions · Retention · Last refreshed {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: summary.total_users,
              icon: Users,
              color: "#C694F9",
              sub: `${summary.active_users_30d} active (30d)`,
            },
            {
              label: "DAU (7d avg)",
              value: summary.active_users_7d,
              icon: Activity,
              color: "#94A1F9",
              sub: `${summary.active_users_30d} unique (30d)`,
            },
            {
              label: "Transactions (30d)",
              value: summary.transactions_30d,
              icon: TrendingUp,
              color: "#4ade80",
              sub: `${summary.transactions_7d} this week`,
            },
            {
              label: "Volume (30d)",
              value: `${summary.volume_30d.toLocaleString()} XLM`,
              icon: BarChart2,
              color: "#facc15",
              sub: "Total settled",
            },
            {
              label: "Retention (WoW)",
              value: `${summary.retention_rate}%`,
              icon: Calendar,
              color: "#f87171",
              sub: "Week-over-week",
            },
            {
              label: "Gasless Txs ⚡",
              value: summary.gasless_transactions,
              icon: Zap,
              color: "#C694F9",
              sub: "Fee sponsored",
            },
            {
              label: "Total Txs (all time)",
              value: summary.total_transactions,
              icon: ArrowUpRight,
              color: "#94A1F9",
              sub: "Lifetime",
            },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-all group"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  {kpi.label}
                </p>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.color}18`, border: `1px solid ${kpi.color}30` }}
                >
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <p
                className="text-2xl font-black tracking-tight"
                style={{ fontVariantNumeric: "tabular-nums lining-nums" }}
              >
                {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
              </p>
              <p className="text-[10px] text-white/30 font-bold">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DAU Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-6">
            Daily Active Users (Last 14 Days)
          </h3>
          <div className="flex items-end gap-1.5 h-32">
            {last14.map((d, i) => {
              const height = maxDau > 0 ? Math.max((d.dau / maxDau) * 100, 4) : 4;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded px-2 py-1 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {d.date.slice(5)}: {d.dau} users
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.4 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                    className="w-full rounded-t-md"
                    style={{
                      background: `linear-gradient(to top, #C694F9, #94A1F9)`,
                      opacity: 0.7,
                      alignSelf: "flex-end",
                    }}
                  />
                  {i % 3 === 0 && (
                    <span className="text-[8px] text-white/20 font-bold mt-1">{d.date.slice(8)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Transaction Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-6">
            Daily Transactions (Last 14 Days)
          </h3>
          <div className="flex items-end gap-1.5 h-32">
            {last14.map((d, i) => {
              const height = maxTx > 0 ? Math.max((d.transactions / maxTx) * 100, 4) : 4;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded px-2 py-1 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {d.date.slice(5)}: {d.transactions} txs
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.45 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                    className="w-full rounded-t-md"
                    style={{
                      background: `linear-gradient(to top, #4ade80, #22c55e)`,
                      opacity: 0.7,
                      alignSelf: "flex-end",
                    }}
                  />
                  {i % 3 === 0 && (
                    <span className="text-[8px] text-white/20 font-bold mt-1">{d.date.slice(8)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-4">
            Top Users (30d)
          </h3>
          <div className="space-y-2">
            {topUsers.length === 0 && (
              <p className="text-white/20 text-sm text-center py-4">No transaction data yet</p>
            )}
            {topUsers.map((u, i) => (
              <div key={u.universal_id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-white/30 w-5">#{i + 1}</span>
                  <span className="font-bold text-sm text-[#C694F9]">{u.universal_id}@expo</span>
                </div>
                <span className="text-xs font-black text-white/50">{u.tx_count} txs</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Signups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-4">
            Recent Signups
          </h3>
          <div className="space-y-2">
            {recentSignups.length === 0 && (
              <p className="text-white/20 text-sm text-center py-4">No signups yet</p>
            )}
            {recentSignups.map((u) => (
              <div
                key={u.universal_id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
              >
                <div>
                  <p className="font-bold text-sm">{u.full_name || u.universal_id}</p>
                  <p className="text-[10px] text-white/40 font-bold">{u.universal_id}@expo</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 font-bold">
                    {new Date(u.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-white/30 font-bold">{u.preferred_currency || 'XLM'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
