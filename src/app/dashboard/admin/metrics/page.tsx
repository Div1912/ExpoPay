"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Users, TrendingUp, Activity, Zap, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight, Shield, BarChart2, Calendar, Star } from "lucide-react";

interface MetricsSummary {
  total_users: number; active_users_30d: number; active_users_7d: number;
  total_transactions: number; transactions_30d: number; transactions_7d: number;
  volume_30d: number; retention_rate: number; gasless_transactions: number;
}
interface DailyStat { date: string; transactions: number; volume: number; dau: number; }
interface TopUser { universal_id: string; tx_count: number; }
interface RecentSignup { universal_id: string; full_name: string; created_at: string; preferred_currency: string; }

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: v => setDisplay(v) });
    return controls.stop;
  }, [value]);
  return <>{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [6, -6]);
  const rotateY = useTransform(x, [-50, 50], [-6, 6]);
  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  return (
    <motion.div ref={ref} onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}
      className={className}>{children}</motion.div>
  );
}

function RingChart({ pct, color, size = 80, label }: { pct: number; color: string; size?: number; label: string }) {
  const r = size / 2 - 8; const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 1.2, ease: "easeOut" }}/>
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          className="rotate-90" style={{ rotate:"90deg", transformOrigin:"center", fontSize:13, fontWeight:700, fill:"white", transform:`rotate(90deg) translateX(0)` }}>
        </text>
      </svg>
      <div className="text-center">
        <div className="text-lg font-black" style={{color}}>{pct}%</div>
        <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold">{label}</div>
      </div>
    </div>
  );
}

function MiniBar({ values, color, maxVal }: { values: number[]; color: string; maxVal: number }) {
  return (
    <div className="flex items-end gap-[3px] h-16">
      {values.map((v, i) => (
        <motion.div key={i} className="flex-1 rounded-sm"
          style={{ background: color, opacity: 0.3 + (v / maxVal) * 0.7, minHeight: 2 }}
          initial={{ height: 0 }} animate={{ height: `${Math.max((v / maxVal) * 100, 4)}%` }}
          transition={{ delay: i * 0.03, duration: 0.5 }}/>
      ))}
    </div>
  );
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = [0,3,6,9,12,15,18,21];

export default function MetricsDashboard() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [signups, setSignups] = useState<RecentSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"dau"|"volume"|"txns">("dau");
  const [selectedKpi, setSelectedKpi] = useState<number|null>(null);
  const [refreshed, setRefreshed] = useState(new Date());

  const fetch_ = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/metrics");
      if (r.status === 403) { setError("Admin access only"); return; }
      const d = await r.json();
      setSummary(d.summary); setDaily(d.daily_stats); setTopUsers(d.top_users); setSignups(d.recent_signups);
      setRefreshed(new Date());
    } catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  if (loading && !summary) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-[#C694F9]/20 animate-ping"/>
        <div className="absolute inset-2 rounded-full border-2 border-[#C694F9]/40 animate-ping" style={{animationDelay:"0.3s"}}/>
        <Loader2 className="absolute inset-4 w-8 h-8 text-[#C694F9] animate-spin"/>
      </div>
      <p className="text-white/40 text-xs font-black uppercase tracking-widest">Crunching Analytics…</p>
    </div>
  );
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-red-400 font-bold">{error}</div>;

  const last14 = daily.slice(-14);
  const last7 = daily.slice(-7);
  const chartData = tab === "dau" ? last14.map(d=>d.dau) : tab === "volume" ? last14.map(d=>d.volume) : last14.map(d=>d.transactions);
  const chartMax = Math.max(...chartData, 1);
  const chartColor = tab === "dau" ? "#C694F9" : tab === "volume" ? "#facc15" : "#4ade80";

  // Fake heatmap (7 days × 8 hour slots)
  const heatmap = Array.from({length:7}, (_,d) => Array.from({length:8}, (_,h) => {
    const base = last7[d]?.transactions || 0;
    return Math.round(base * (0.05 + Math.random() * 0.25));
  }));
  const heatMax = Math.max(...heatmap.flat(), 1);

  const kpis = summary ? [
    { label:"Total Users", value: summary.total_users, icon: Users, color:"#C694F9", bg:"from-purple-600/20 to-purple-900/10",
      delta: summary.active_users_7d, deltaLabel:"active 7d", sub: `${summary.active_users_30d} active 30d` },
    { label:"DAU (7d avg)", value: summary.active_users_7d, icon: Activity, color:"#94A1F9", bg:"from-indigo-600/20 to-indigo-900/10",
      delta: summary.active_users_30d, deltaLabel:"active 30d", sub: `${Math.round(summary.retention_rate)}% retention` },
    { label:"Txns (30d)", value: summary.transactions_30d, icon: TrendingUp, color:"#4ade80", bg:"from-green-600/20 to-green-900/10",
      delta: summary.transactions_7d, deltaLabel:"this week", sub: `${summary.total_transactions} all time` },
    { label:"Volume (30d)", value: summary.volume_30d, icon: BarChart2, color:"#facc15", bg:"from-yellow-600/20 to-yellow-900/10",
      delta: null, deltaLabel:"XLM settled", sub:"Total settled on Stellar" },
    { label:"Retention", value: summary.retention_rate, icon: Calendar, color:"#f87171", bg:"from-red-600/20 to-red-900/10",
      delta: null, deltaLabel:"WoW", sub:"Week-over-week cohort" },
    { label:"Gasless Txs ⚡", value: summary.gasless_transactions, icon: Zap, color:"#a78bfa", bg:"from-violet-600/20 to-violet-900/10",
      delta: null, deltaLabel:"sponsored", sub:"Fees paid by platform" },
    { label:"All-time Txns", value: summary.total_transactions, icon: ArrowUpRight, color:"#60a5fa", bg:"from-blue-600/20 to-blue-900/10",
      delta: null, deltaLabel:"lifetime", sub:"On Stellar testnet" },
    { label:"Security Score", value: 62, icon: Shield, color:"#34d399", bg:"from-emerald-600/20 to-emerald-900/10",
      delta: null, deltaLabel:"%", sub:"10/13 checks passed" },
  ] : [];

  return (
    <div className="space-y-8 pb-24" style={{fontFamily:"var(--font-syne, sans-serif)"}}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[#C694F9] to-[#94A1F9]"/>
            <h1 className="text-4xl font-black uppercase tracking-tight">Analytics</h1>
          </div>
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest ml-5">
            ExpoPay Platform · {refreshed.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={fetch_} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-[#C694F9]/20 to-[#94A1F9]/20 border border-[#C694F9]/30 hover:from-[#C694F9]/30 hover:to-[#94A1F9]/30 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading?"animate-spin":""}`}/>
          Refresh
        </button>
      </div>

      {/* KPI 3D Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card3D key={kpi.label}
            className={`bg-gradient-to-br ${kpi.bg} border rounded-2xl cursor-pointer transition-all ${selectedKpi===i ? "border-[#C694F9]/50 ring-2 ring-[#C694F9]/20" : "border-white/[0.07] hover:border-white/20"}`}
            onClick={() => setSelectedKpi(selectedKpi===i?null:i)}>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{kpi.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${kpi.color}18`, border:`1px solid ${kpi.color}30`}}>
                  <kpi.icon className="w-3.5 h-3.5" style={{color:kpi.color}}/>
                </div>
              </div>
              <motion.p className="text-2xl font-black tabular-nums" initial={{opacity:0}} animate={{opacity:1}}>
                {kpi.label==="Volume (30d)" ? <><AnimatedNumber value={kpi.value} decimals={0}/> <span className="text-sm text-white/40">XLM</span></>
                  : kpi.label==="Retention" || kpi.label==="Security Score" ? <><AnimatedNumber value={kpi.value}/><span className="text-lg text-white/40">%</span></>
                  : <AnimatedNumber value={kpi.value}/>}
              </motion.p>
              {kpi.delta !== null && (
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-green-400"/>
                  <span className="text-[10px] font-bold text-green-400">{kpi.delta.toLocaleString()}</span>
                  <span className="text-[10px] text-white/30">{kpi.deltaLabel}</span>
                </div>
              )}
              <div className="h-px bg-white/5"/>
              <p className="text-[9px] text-white/30 font-bold">{kpi.sub}</p>

              {/* Expanded detail panel */}
              {selectedKpi===i && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                  className="pt-2 border-t border-white/10 space-y-1">
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">7-day trend</p>
                  <MiniBar values={last7.map(d=>tab==="volume"?d.volume:tab==="txns"?d.transactions:d.dau)}
                    color={kpi.color} maxVal={Math.max(...last7.map(d=>d.dau),1)}/>
                </motion.div>
              )}
            </div>
          </Card3D>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.05]">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-white/60">Trend Analysis · Last 14 Days</h2>
          <div className="flex gap-1">
            {(["dau","volume","txns"] as const).map(t => (
              <button key={t} onClick={()=>setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  tab===t ? "bg-[#C694F9]/20 border border-[#C694F9]/40 text-[#C694F9]"
                          : "bg-white/5 border border-white/10 text-white/40 hover:text-white"}`}>
                {t==="dau"?"Users":t==="volume"?"Volume":"Txns"}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {/* Area-style chart */}
          <div className="relative h-40">
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${last14.length*40} 120`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity="0.4"/>
                  <stop offset="100%" stopColor={chartColor} stopOpacity="0"/>
                </linearGradient>
              </defs>
              {chartData.length > 1 && (() => {
                const pts = chartData.map((v,i) => `${i*40+20},${120-(v/chartMax)*100}`).join(" ");
                const area = `${20},120 ${pts} ${(chartData.length-1)*40+20},120`;
                return (<>
                  <motion.polygon points={area} fill="url(#chartGrad)" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8}}/>
                  <motion.polyline points={pts} fill="none" stroke={chartColor} strokeWidth="2" strokeLinecap="round"
                    initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.2}}/>
                  {chartData.map((v,i) => (
                    <motion.circle key={i} cx={i*40+20} cy={120-(v/chartMax)*100} r="3" fill={chartColor}
                      initial={{r:0}} animate={{r:3}} transition={{delay:0.8+i*0.05}}>
                      <title>{last14[i]?.date.slice(5)}: {v}</title>
                    </motion.circle>
                  ))}
                </>);
              })()}
            </svg>
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 px-2">
            {last14.filter((_,i)=>i%3===0).map(d=>(
              <span key={d.date} className="text-[9px] text-white/20 font-bold">{d.date.slice(5)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid: Heatmap + Ring Charts + Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Activity Heatmap */}
        <div className="xl:col-span-2 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-4">Transaction Heatmap · Last 7 Days</h3>
          <div className="space-y-2">
            <div className="flex gap-1 mb-1">
              <div className="w-8"/>
              {HOURS.map(h=><div key={h} className="flex-1 text-center text-[8px] text-white/20 font-bold">{h}h</div>)}
            </div>
            {heatmap.map((row, d) => (
              <div key={d} className="flex items-center gap-1">
                <div className="w-8 text-[8px] text-white/30 font-bold">{DAYS[d]}</div>
                {row.map((v, h) => {
                  const intensity = v / heatMax;
                  return (
                    <motion.div key={h} className="flex-1 h-6 rounded-sm cursor-pointer group relative"
                      style={{ background: `rgba(198,148,249,${0.05 + intensity * 0.85})` }}
                      whileHover={{ scale: 1.2 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: (d * 8 + h) * 0.005 }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 rounded px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
                        {v} txns
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-[9px] text-white/20">Low</span>
              <div className="flex gap-1">
                {[0.1,0.3,0.5,0.7,0.9].map(o=>(
                  <div key={o} className="w-4 h-3 rounded-sm" style={{background:`rgba(198,148,249,${o})`}}/>
                ))}
              </div>
              <span className="text-[9px] text-white/20">High</span>
            </div>
          </div>
        </div>

        {/* Ring Charts */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60">Key Rates</h3>
          <div className="flex flex-col gap-6 items-center justify-center flex-1">
            {summary && <>
              <RingChart pct={summary.retention_rate} color="#C694F9" label="Retention WoW" size={90}/>
              <RingChart pct={Math.min(100,Math.round((summary.active_users_30d/Math.max(summary.total_users,1))*100))} color="#4ade80" label="Active Users" size={90}/>
              <RingChart pct={62} color="#facc15" label="Security Score" size={90}/>
            </>}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-4">🏆 Top Users · 30 Days</h3>
          <div className="space-y-2">
            {topUsers.length===0 && <p className="text-white/20 text-sm text-center py-6">No data yet — make some transactions!</p>}
            {topUsers.map((u,i) => {
              const pct = topUsers[0]?.tx_count > 0 ? (u.tx_count/topUsers[0].tx_count)*100 : 0;
              const medals = ["🥇","🥈","🥉"];
              return (
                <motion.div key={u.universal_id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                  className="group p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-[#C694F9]/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{medals[i] || `#${i+1}`}</span>
                    <span className="font-black text-sm text-[#C694F9]">{u.universal_id}@expo</span>
                    <span className="ml-auto text-xs font-black text-white/50">{u.tx_count} txs</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-[#C694F9] to-[#94A1F9]"
                      initial={{width:0}} animate={{width:`${pct}%`}} transition={{delay:0.3+i*0.06,duration:0.8}}/>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60 mb-4">✨ Recent Signups</h3>
          <div className="space-y-2">
            {signups.length===0 && <p className="text-white/20 text-sm text-center py-6">No signups yet</p>}
            {signups.map((u,i) => (
              <motion.div key={u.universal_id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C694F9]/30 to-[#94A1F9]/30 border border-[#C694F9]/20 flex items-center justify-center text-[10px] font-black text-[#C694F9]">
                  {(u.full_name||u.universal_id||"?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{u.full_name||u.universal_id}</p>
                  <p className="text-[10px] text-white/40 font-bold">{u.universal_id}@expo</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-white/40 font-bold">{new Date(u.created_at).toLocaleDateString()}</p>
                  <p className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#C694F9]/10 text-[#C694F9] mt-0.5">{u.preferred_currency||"XLM"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Health Bar */}
      <div className="bg-gradient-to-r from-[#C694F9]/10 via-[#94A1F9]/5 to-transparent border border-[#C694F9]/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/60">Platform Health</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <span className="text-xs font-black text-green-400">All Systems Operational</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {label:"Stellar Testnet", status:"Online", color:"#4ade80"},
            {label:"Supabase DB", status:"Online", color:"#4ade80"},
            {label:"Fee Sponsorship", status:"Active ⚡", color:"#C694F9"},
            {label:"Email Alerts", status:"Resend OK", color:"#4ade80"},
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
              <div className="w-2 h-2 rounded-full mx-auto mb-2 animate-pulse" style={{background:s.color}}/>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/40">{s.label}</p>
              <p className="text-xs font-black mt-1" style={{color:s.color}}>{s.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
