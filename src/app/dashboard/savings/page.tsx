"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Lock, Droplets, TrendingUp, ExternalLink, CheckCircle2,
  Loader2, Shield, BarChart3, Sparkles, ArrowRight, Flame,
  Repeat, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

// ── Tier configuration ────────────────────────────────────────────────────────
// reward_bps is the simple-interest reward over the lock period (e.g. 600 bps = 6%
// over 90 days = ~24% APR). All tiers below 100% to comply with Stellar smart
// contract caps and Indian regulatory disclosure norms.
const TIERS = [
  { days: 30, bps: 125, rate: "1.25%", apr: "~15% APR", label: "Bronze",
    gradient: "from-white/5 to-transparent", border: "border-white/10",
    glow: "shadow-[0_0_30px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]", badge: "" },
  { days: 60, bps: 300, rate: "3.00%", apr: "~18% APR", label: "Silver",
    gradient: "from-white/10 to-transparent", border: "border-white/20",
    glow: "shadow-[0_0_30px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]", badge: "Popular" },
  { days: 90, bps: 600, rate: "6.00%", apr: "~24% APR", label: "Gold",
    gradient: "from-[#C694F9]/20 to-transparent", border: "border-[#C694F9]/30",
    glow: "shadow-[0_0_40px_rgba(198,148,249,0.1)] group-hover:shadow-[0_0_50px_rgba(198,148,249,0.2)]", badge: "Best Rate" },
];

export default function SavingsPage() {
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"staking" | "pool">("staking");
  const [ticker, setTicker]       = useState(0);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/savings/positions");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // 1 Hz tick for live counters; cheap, no network
    const iv = setInterval(() => setTicker((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const summary = data?.summary;
  const stakes  = data?.stakes  || [];
  const pools   = data?.pools   || [];

  return (
    <div className="space-y-8 sm:space-y-10 pb-24 max-w-2xl mx-auto">

      {/* ── Hero Header ── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute -top-8 left-0 w-64 h-64 bg-[#C694F9]/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C694F9] to-[#94A1F9] flex items-center justify-center shadow-lg shadow-[#C694F9]/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
              ExpoPay Vault
            </span>
          </div>
          <h1 className="text-[clamp(2rem,9vw,4.5rem)] font-black tracking-tight uppercase leading-[0.85] mb-4 break-words font-jakarta">
            EARN<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
              REWARDS
            </span>
          </h1>
          <p className="text-white/40 text-sm font-medium max-w-sm font-jakarta">
            Stake EXPO or deposit XLM to earn rewards on-chain via Stellar smart contracts.
          </p>

          <div className="mt-4 flex items-start gap-2 bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
            <p className="text-[10px] text-white/40 font-medium leading-relaxed font-jakarta">
              Staking rewards are taxable as VDA income at 30% under the Income Tax Act, 1961. Returns are variable and not guaranteed.
            </p>
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-[#C694F9]" />
            <div className="absolute inset-0 blur-xl bg-[#C694F9]/20 rounded-full" />
          </div>
          <p className="text-white/30 text-xs font-black uppercase tracking-widest">Loading positions…</p>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="Staked EXPO"
              value={(summary?.total_staked_expo || 0).toFixed(2)}
              sub="EXPO"
              icon={<Lock className="w-4 h-4" />}
              color="purple"
            />
            <StatCard
              label="In Pool"
              value={(summary?.total_in_pool_xlm || 0).toFixed(2)}
              sub="XLM"
              icon={<Droplets className="w-4 h-4" />}
              color="cyan"
            />
            <StatCard
              label="Active Stakes"
              value={summary?.active_stakes || 0}
              sub="positions"
              icon={<Flame className="w-4 h-4" />}
              color="orange"
            />
            <StatCard
              label="Pool Positions"
              value={summary?.active_pool_positions || 0}
              sub="positions"
              icon={<BarChart3 className="w-4 h-4" />}
              color="green"
            />
          </section>

          {/* ── Live earnings strip (innovation: rolling counter showing real-time accrual) ── */}
          {summary?.active_stakes > 0 && (
            <LiveEarningsStrip
              accruedExpo={summary.total_accrued_expo || 0}
              pendingExpo={summary.total_pending_expo || 0}
              poolAccrued={summary.total_pool_accrued || 0}
              ticker={ticker}
            />
          )}

          {/* ── Tab switcher ── */}
          <section className="relative flex p-1 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
            {(["staking", "pool"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative flex-1 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all font-jakarta"
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="vault-tab"
                    className="absolute inset-0 bg-white/[0.05] rounded-xl border border-white/[0.1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={cn(
                  "relative z-10 transition-colors duration-500",
                  activeTab === tab ? "text-white" : "text-white/30 hover:text-white/50"
                )}>
                  {tab === "staking" ? "EXPO Staking" : "XLM Pool"}
                </span>
              </button>
            ))}
          </section>

          <AnimatePresence mode="wait">
            {activeTab === "staking" && (
              <motion.section
                key="staking"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Tier cards — auto-flow grid that wraps to 1-col on tiny screens */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {TIERS.map((tier) => (
                    <motion.div
                      key={tier.days}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className={cn(
                        "relative overflow-hidden rounded-3xl border p-3 sm:p-4 space-y-2 sm:space-y-3 cursor-default",
                        `bg-gradient-to-b ${tier.gradient}`,
                        tier.border,
                        `shadow-lg ${tier.glow}`
                      )}
                    >
                      {tier.badge && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[7px] sm:text-[8px] font-black uppercase tracking-wider bg-white/10 border border-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full">
                          {tier.badge}
                        </span>
                      )}
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.18em] text-white/50">
                        {tier.label}
                      </p>
                      <div>
                        <p className="font-black text-xl sm:text-3xl text-white leading-none break-words">
                          {tier.rate}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-white/40 font-bold mt-1">
                          {tier.apr}
                        </p>
                      </div>
                      <div className="h-px bg-white/10" />
                      <p className="font-black text-xs sm:text-sm text-white/70">{tier.days} Days</p>
                    </motion.div>
                  ))}
                </div>

                {/* Compound projection — the "innovation" piece */}
                <CompoundProjection />

                <Link href="/dashboard/savings/stake">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 rounded-2xl font-black uppercase tracking-wider text-sm sm:text-base transition-all duration-500 flex items-center justify-center gap-3 group font-jakarta text-white hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                  >
                    <Lock className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-500" />
                    <span className="truncate">Stake EXPO Now</span>
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-500 shrink-0" />
                  </motion.button>
                </Link>

                {stakes.filter((s: any) => s.status === "active").length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel>Active Stakes</SectionLabel>
                    {stakes
                      .filter((s: any) => s.status === "active")
                      .map((s: any) => (
                        <StakeCard
                          key={s.id}
                          stake={s}
                          ticker={ticker}
                          onAction={fetchData}
                        />
                      ))}
                  </div>
                )}

                {stakes.filter((s: any) => s.status !== "active").length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel>Completed</SectionLabel>
                    {stakes
                      .filter((s: any) => s.status !== "active")
                      .map((s: any) => (
                        <StakeCard
                          key={s.id}
                          stake={s}
                          ticker={ticker}
                          onAction={fetchData}
                        />
                      ))}
                  </div>
                )}

                {stakes.length === 0 && (
                  <EmptyHint text="Stake your EXPO tokens to earn rewards. Choose a lock period above." />
                )}
              </motion.section>
            )}

            {activeTab === "pool" && (
              <motion.section
                key="pool"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Pool hero card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.01] p-5 sm:p-6 group transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02]">
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-3xl transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-3xl transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 transition-colors duration-500 group-hover:bg-white/10 group-hover:border-white/20">
                        <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-base sm:text-lg truncate font-jakarta">EXPO Yield Pool</p>
                        <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider truncate font-jakarta">
                          Deposit XLM → Earn EXPO Daily
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { label: "Est. APR", value: "~18%", color: "text-white" },
                        { label: "Lock-up",  value: "None",  color: "text-white/70" },
                        { label: "Rewards",  value: "EXPO",  color: "text-white/70" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/5 border border-white/[0.05] rounded-2xl p-3 text-center transition-colors duration-500 group-hover:bg-white/10 group-hover:border-white/10">
                          <p className={cn("font-black text-base sm:text-xl font-jakarta", color)}>{value}</p>
                          <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/40 mt-0.5 font-jakarta">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed font-jakarta">
                      No lock-up — withdraw anytime with accrued EXPO. Powered by ExpoPay smart contracts on Stellar.
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/savings/pool">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-16 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 rounded-2xl font-black uppercase tracking-wider text-sm sm:text-base transition-all duration-500 flex items-center justify-center gap-3 group font-jakarta text-white hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
                  >
                    <Droplets className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-500" />
                    <span className="truncate">Deposit to Pool</span>
                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all duration-500 shrink-0" />
                  </motion.button>
                </Link>

                {pools.filter((p: any) => p.status === "active").length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel>Your Pool Positions</SectionLabel>
                    {pools
                      .filter((p: any) => p.status === "active")
                      .map((pos: any) => (
                        <PoolCard
                          key={pos.id}
                          position={pos}
                          ticker={ticker}
                          onAction={fetchData}
                        />
                      ))}
                  </div>
                )}

                {pools.filter((p: any) => p.status !== "active").length > 0 && (
                  <div className="space-y-3">
                    <SectionLabel>Closed Positions</SectionLabel>
                    {pools
                      .filter((p: any) => p.status !== "active")
                      .map((pos: any) => (
                        <PoolCard
                          key={pos.id}
                          position={pos}
                          ticker={ticker}
                          onAction={fetchData}
                        />
                      ))}
                  </div>
                )}

                {pools.length === 0 && (
                  <EmptyHint text="Deposit XLM to start earning EXPO rewards. No lock-up — withdraw anytime." />
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 flex items-center gap-2">
      <span className="flex-1 h-px bg-white/5" />
      <span className="px-2 whitespace-nowrap">{children}</span>
      <span className="flex-1 h-px bg-white/5" />
    </p>
  );
}

function StatCard({ label, value, sub, icon, color }: any) {
  const styles: any = {
    purple: { ring: "from-white/5 to-transparent", icon: "bg-white/[0.03] border-white/10 text-white/70" },
    cyan:   { ring: "from-white/5 to-transparent", icon: "bg-white/[0.03] border-white/10 text-white/70" },
    orange: { ring: "from-white/5 to-transparent", icon: "bg-white/[0.03] border-white/10 text-white/70" },
    green:  { ring: "from-white/5 to-transparent", icon: "bg-white/[0.03] border-white/10 text-white/70" },
  };
  const s = styles[color];
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={cn("relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.01] p-3 sm:p-4 min-w-0 group cursor-default transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)]", s.ring)}
    >
      <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center mb-3 transition-colors duration-500 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20", s.icon)}>{icon}</div>
      <p className="font-black text-xl sm:text-2xl tracking-tight break-words leading-tight font-jakarta">
        {value}
        <span className="text-white/30 text-[10px] sm:text-xs font-bold ml-1 font-jakarta">{sub}</span>
      </p>
      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/30 mt-1 truncate font-jakarta">
        {label}
      </p>
    </motion.div>
  );
}

// Live rolling counter — accrued rewards across all active stakes, smoothed at 1 Hz
function LiveEarningsStrip({
  accruedExpo,
  pendingExpo,
  poolAccrued,
  ticker,
}: {
  accruedExpo: number;
  pendingExpo: number;
  poolAccrued: number;
  ticker: number;
}) {
  // Add a tiny per-tick delta so the number visibly moves between server fetches
  // (extrapolation from the last reported accrual). Cap to never exceed pending.
  const deltaPerSecond = pendingExpo > 0 ? (pendingExpo - accruedExpo) / (60 * 60 * 24 * 30) : 0;
  const liveExtrapolated = Math.min(pendingExpo, accruedExpo + deltaPerSecond * ticker);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4 group transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02]"
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl transition-opacity duration-500 opacity-50 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/50 mb-1 truncate font-jakarta">
            Total Earning Right Now
          </p>
          <p className="font-black text-2xl sm:text-3xl text-white tabular-nums break-all leading-tight font-jakarta">
            +{liveExtrapolated.toFixed(6)}
            <span className="text-white/30 text-sm sm:text-base ml-1.5 font-bold font-jakarta">EXPO</span>
          </p>
          <p className="text-[10px] text-white/40 font-bold mt-1 truncate font-jakarta">
            Pool: +{poolAccrued.toFixed(4)} · Stakes pending: {pendingExpo.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-start">
          <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse inline-block" />
          <span className="text-[9px] font-black uppercase tracking-wider text-white/60 font-jakarta">live</span>
        </div>
      </div>
    </motion.section>
  );
}

// Compound projection: simulate auto-rolling the same tier N times. Innovation
// for the user — most wallets only show simple-interest reward; we show what
// rolling the same tier would yield over 1 year given they auto-restake on unlock.
function CompoundProjection() {
  const [amount, setAmount] = useState(1000);
  const [tierIdx, setTierIdx] = useState(2); // default Gold

  const projection = useMemo(() => {
    const t = TIERS[tierIdx];
    const periodsPerYear = 365 / t.days;          // e.g. 90d -> ~4.06 periods
    const periodReturn   = t.bps / 10000;         // 0.06 for Gold
    const simple         = amount * periodReturn * periodsPerYear;
    // Discrete compounding: principal * (1 + r)^n - principal
    const compoundFinal  = amount * Math.pow(1 + periodReturn, periodsPerYear);
    const compound       = compoundFinal - amount;
    const apy            = (Math.pow(1 + periodReturn, periodsPerYear) - 1) * 100;
    return {
      simple,
      compound,
      compoundFinal,
      apy,
      diff:    compound - simple,
      tier:    t,
      periods: Math.floor(periodsPerYear),
    };
  }, [amount, tierIdx]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.01] p-4 sm:p-5 space-y-4 group transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02]"
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 transition-colors duration-500 group-hover:bg-white/10 group-hover:border-white/20">
            <Repeat className="w-4 h-4 text-white/70 group-hover:text-white transition-colors duration-500" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm uppercase tracking-wider truncate font-jakarta">Compound Projection</p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider truncate font-jakarta">
              Auto-roll same tier · 1 yr
            </p>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white/70 px-2 py-1 rounded-full shrink-0 font-jakarta transition-colors duration-500 group-hover:bg-white/10 group-hover:text-white">
          {projection.apy.toFixed(1)}% APY
        </span>
      </div>

      {/* Amount input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-white/40 font-jakarta">
          <span>Stake amount</span>
          <span className="tabular-nums">{amount.toLocaleString()} EXPO</span>
        </div>
        <input
          type="range"
          min={100}
          max={50000}
          step={100}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full accent-white h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Tier picker */}
      <div className="grid grid-cols-3 gap-1.5">
        {TIERS.map((t, i) => (
          <button
            key={t.days}
            onClick={() => setTierIdx(i)}
            className={cn(
              "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all font-jakarta",
              tierIdx === i
                ? "bg-white/10 border border-white/20 text-white"
                : "bg-white/[0.03] border border-white/[0.06] text-white/40 hover:bg-white/[0.05] hover:text-white/60"
            )}
          >
            {t.days}d · {t.rate}
          </button>
        ))}
      </div>

      {/* Simple vs compound bars */}
      <div className="space-y-2.5">
        <ProjectionBar
          label="Simple"
          value={projection.simple}
          max={projection.compound}
          color="from-white/10 to-transparent"
        />
        <ProjectionBar
          label="Compounded"
          value={projection.compound}
          max={projection.compound}
          color="from-white/60 to-white/20"
          highlight
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.05] text-[10px] sm:text-xs font-bold flex-wrap font-jakarta">
        <span className="text-white/40 shrink-0">Extra from compounding</span>
        <span className="text-white/70 font-black tabular-nums transition-colors duration-500 group-hover:text-white">
          +{projection.diff.toFixed(2)} EXPO
        </span>
      </div>

      <p className="text-[9px] text-white/30 leading-relaxed font-jakarta">
        Projection assumes you re-stake principal + rewards every {projection.tier.days} days (~{projection.periods} cycles/yr) at the same rate. Real returns depend on tier availability and contract caps.
      </p>
    </motion.section>
  );
}

function ProjectionBar({
  label,
  value,
  max,
  color,
  highlight,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  highlight?: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold gap-2 font-jakarta">
        <span className={cn("uppercase tracking-wider truncate transition-colors duration-500", highlight ? "text-white/80" : "text-white/40")}>
          {label}
        </span>
        <span className={cn("font-black tabular-nums shrink-0 transition-colors duration-500", highlight ? "text-white" : "text-white/40")}>
          +{value.toFixed(2)} EXPO
        </span>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full bg-gradient-to-r", color)}
        />
      </div>
    </div>
  );
}

function StakeCard({
  stake,
  ticker,
  onAction,
}: {
  stake: any;
  ticker: number;
  onAction: () => void;
}) {
  const [unstaking, setUnstaking] = useState(false);
  const [error, setError]         = useState("");

  const isUnlocked = new Date() >= new Date(stake.unlocks_at);
  const isActive   = stake.status === "active";
  const tier       = TIERS.find((t) => t.days === stake.duration_days) || TIERS[0];

  // Recompute live numbers client-side using the same linear-accrual formula the
  // API uses, so the card stays animated between server polls.
  const live = useMemo(() => {
    const start    = new Date(stake.staked_at).getTime();
    const end      = new Date(stake.unlocks_at).getTime();
    const total    = Math.max(end - start, 1);
    const elapsed  = Math.min(Math.max(Date.now() - start, 0), total);
    const fraction = elapsed / total;

    const principal     = parseFloat(stake.amount_expo);
    const fullReward    = parseFloat(stake.reward_expo);
    const accruedReward = isActive ? fullReward * fraction : fullReward;
    const currentValue  = principal + accruedReward;

    const secondsRemaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const days  = Math.floor(secondsRemaining / 86400);
    const hours = Math.floor((secondsRemaining % 86400) / 3600);
    const mins  = Math.floor((secondsRemaining % 3600) / 60);

    return {
      progressPct:  fraction * 100,
      accruedReward,
      currentValue,
      principal,
      fullReward,
      countdown:    days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stake.staked_at, stake.unlocks_at, stake.amount_expo, stake.reward_expo, isActive, ticker]);

  const handleUnstake = async () => {
    setUnstaking(true);
    setError("");
    try {
      const res = await fetch("/api/savings/unstake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_id: stake.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unstake failed");
        return;
      }
      onAction();
    } catch {
      setError("Network error");
    } finally {
      setUnstaking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.01] p-4 sm:p-5 space-y-4 group transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]"
    >
      <div className={cn("absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r opacity-40 group-hover:opacity-100 transition-opacity duration-500", tier.gradient)} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border shrink-0 transition-colors duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white",
            stake.status === "completed"
              ? "bg-white/[0.03] border-white/10 text-white/50"
              : isUnlocked
              ? "bg-white/[0.03] border-white/10 text-white/70"
              : "bg-white/[0.03] border-white/10 text-white/70"
          )}>
            {stake.status === "completed"
              ? <CheckCircle2 className="w-5 h-5" />
              : <Lock className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm sm:text-base break-words leading-tight font-jakarta">
              {live.principal} <span className="text-white/40">EXPO</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 truncate font-jakarta">
              {stake.duration_days}-day · {tier.label} · {tier.rate}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <motion.p
            key={ticker}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="font-black text-xs sm:text-sm text-white tabular-nums font-jakarta transition-colors duration-500"
          >
            +{live.accruedReward.toFixed(4)}
          </motion.p>
          <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider font-jakarta">
            of {live.fullReward.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Live detail grid (only for active stakes) — was missing before */}
      {isActive && (
        <div className="grid grid-cols-3 gap-2 bg-white/[0.02] rounded-2xl p-3 border border-white/[0.04]">
          <DetailCell
            label="Current value"
            value={live.currentValue.toFixed(4)}
            sub="EXPO"
            highlight
          />
          <DetailCell
            label={isUnlocked ? "Status" : "Unlocks in"}
            value={isUnlocked ? "Ready" : live.countdown}
            sub={isUnlocked ? "" : "remaining"}
            color={isUnlocked ? "text-white" : undefined}
          />
          <DetailCell
            label="Progress"
            value={`${live.progressPct.toFixed(0)}%`}
            sub="locked"
          />
        </div>
      )}

      {/* Progress bar */}
      {isActive && (
        <div>
          <div className="flex justify-between text-[10px] font-bold text-white/30 mb-2 gap-2">
            <span className="truncate">
              {isUnlocked
                ? "Ready to unstake"
                : `Unlocks ${formatDistanceToNow(new Date(stake.unlocks_at), { addSuffix: true })}`}
            </span>
            <span className="shrink-0 hidden sm:inline">
              {format(new Date(stake.unlocks_at), "MMM d, yyyy")}
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${live.progressPct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "h-full rounded-full",
                live.progressPct >= 100
                  ? "bg-white"
                  : "bg-white/50"
              )}
            />
          </div>
        </div>
      )}

      {stake.tx_hash_stake && (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${stake.tx_hash_stake}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/50 transition-colors w-fit"
        >
          <ExternalLink className="w-3 h-3" /> View on-chain
        </a>
      )}

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 rounded-xl px-3 py-2 break-words">
          {error}
        </p>
      )}

      {isActive && isUnlocked && (
        <button
          onClick={handleUnstake}
          disabled={unstaking}
          className="w-full h-12 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-jakarta text-white hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
        >
          {unstaking
            ? <><Loader2 className="w-4 h-4 animate-spin text-white/50" /> Unstaking…</>
            : <>Collect Rewards</>}
        </button>
      )}
    </motion.div>
  );
}

function DetailCell({
  label,
  value,
  sub,
  highlight,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className="text-center min-w-0">
      <p className={cn(
        "font-black text-xs sm:text-sm tabular-nums break-words leading-tight font-jakarta transition-colors duration-500",
        color ? color : highlight ? "text-white" : "text-white/70"
      )}>
        {value}
      </p>
      {sub && <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider truncate font-jakarta">{sub}</p>}
      <p className="text-[8px] text-white/40 font-bold uppercase tracking-wider mt-0.5 truncate font-jakarta">
        {label}
      </p>
    </div>
  );
}

function PoolCard({
  position,
  ticker,
  onAction,
}: {
  position: any;
  ticker: number;
  onAction: () => void;
}) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError]             = useState("");
  const isActive   = position.status === "active";
  const daysElapsed = (Date.now() - new Date(position.deposited_at).getTime()) / 86400000;
  const liveAccrued = isActive
    ? (parseFloat(position.amount_xlm) * 50 * daysElapsed) / 10000
    : parseFloat(position.expo_earned || 0);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setError("");
    try {
      const res = await fetch("/api/savings/pool/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_id: position.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Withdrawal failed");
        return;
      }
      onAction();
    } catch {
      setError("Network error");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.01] p-4 sm:p-5 space-y-4 group transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]"
    >
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white opacity-10 group-hover:opacity-30 transition-opacity duration-500" />
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border shrink-0 transition-colors duration-500",
            isActive
              ? "bg-white/[0.03] border-white/10 text-white/70 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white"
              : "bg-white/[0.03] border-white/10 text-white/50 group-hover:bg-white/10 group-hover:border-white/20 group-hover:text-white"
          )}>
            {isActive ? <Droplets className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="font-black text-sm sm:text-base break-words leading-tight font-jakarta">
              {position.amount_xlm} <span className="text-white/40">XLM</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 truncate font-jakarta">
              Deposited {format(new Date(position.deposited_at), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <motion.p
            key={`${ticker}-${position.id}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="font-black text-xs sm:text-sm text-white tabular-nums font-jakarta transition-colors duration-500"
          >
            +{liveAccrued.toFixed(4)} EXPO
          </motion.p>
          <p className="text-[9px] text-white/30 font-bold flex items-center justify-end gap-1 font-jakarta">
            {isActive && <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse inline-block" />}
            {isActive ? "accruing" : "earned"}
          </p>
        </div>
      </div>

      {position.tx_hash_deposit && (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${position.tx_hash_deposit}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/50 transition-colors w-fit"
        >
          <ExternalLink className="w-3 h-3" /> View deposit
        </a>
      )}

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 rounded-xl px-3 py-2 break-words">
          {error}
        </p>
      )}

      {isActive && (
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="w-full h-12 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-jakarta text-white hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
        >
          {withdrawing
            ? <><Loader2 className="w-4 h-4 animate-spin text-white/50" /> Withdrawing…</>
            : <span className="truncate">Withdraw {position.amount_xlm} XLM + EXPO</span>}
        </button>
      )}
    </motion.div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center transition-colors duration-500 hover:bg-white/[0.05] hover:border-white/[0.1]">
        <TrendingUp className="w-7 h-7 text-white/20" />
      </div>
      <p className="text-sm font-medium text-white/25 max-w-xs font-jakarta">{text}</p>
    </div>
  );
}
