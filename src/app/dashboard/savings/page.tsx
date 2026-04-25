"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Lock, Droplets, TrendingUp, ArrowRight, CheckCircle2,
  Loader2, Clock, Zap, Shield, ExternalLink, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

const REWARD_RATES: Record<number, { bps: number; label: string; color: string }> = {
  30: { bps: 125, label: "1.25%",  color: "text-blue-400"   },
  60: { bps: 300, label: "3.00%",  color: "text-[#C694F9]"  },
  90: { bps: 600, label: "6.00%",  color: "text-green-400"  },
};

export default function SavingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"staking" | "pool">("staking");
  const [ticker, setTicker] = useState(0);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/savings/positions");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // Tick every 10s to update live accrual display
    const iv = setInterval(() => setTicker(t => t + 1), 10000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const summary = data?.summary;
  const stakes  = data?.stakes  || [];
  const pools   = data?.pools   || [];

  return (
    <div className="space-y-8 pb-20">

      {/* ── Header ── */}
      <section className="space-y-2">
        <h1 className="text-[clamp(2rem,8vw,3.5rem)] font-black tracking-tight uppercase leading-[0.9]"
          style={{ fontFamily: 'var(--font-syne)' }}>
          VAULT
        </h1>
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          Earn EXPO rewards on your crypto
        </p>
        {/* RBI Disclaimer */}
        <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl px-4 py-2.5 mt-3">
          <p className="text-[10px] text-yellow-400/70 font-bold leading-relaxed">
            ⚠️ Rewards from staking are taxable as VDA income at 30% under the Income Tax Act, 1961.
            Returns are variable and not guaranteed. Not a regulated deposit product.
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#C694F9]" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Staked EXPO" value={`${(summary?.total_staked_expo || 0).toFixed(2)}`} sub="EXPO" icon={<Lock className="w-4 h-4" />} color="purple" />
            <StatCard label="In Pool"     value={`${(summary?.total_in_pool_xlm || 0).toFixed(2)}`}  sub="XLM"  icon={<Droplets className="w-4 h-4" />}  color="blue" />
            <StatCard label="Active Stakes"    value={summary?.active_stakes || 0}          sub="positions" icon={<Shield className="w-4 h-4" />}    color="pink" />
            <StatCard label="Pool Positions"   value={summary?.active_pool_positions || 0}  sub="positions" icon={<BarChart3 className="w-4 h-4" />}  color="green" />
          </section>

          {/* ── Tab switcher ── */}
          <section className="flex gap-3">
            {(["staking", "pool"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider border transition-all",
                  activeTab === tab
                    ? "bg-[#C694F9]/10 border-[#C694F9]/30 text-[#C694F9]"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
                )}
              >
                {tab === "staking" ? "🔒 EXPO Staking" : "💧 XLM Pool"}
              </button>
            ))}
          </section>

          <AnimatePresence mode="wait">

            {/* ── STAKING TAB ── */}
            {activeTab === "staking" && (
              <motion.section
                key="staking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Tier cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[30, 60, 90].map(days => (
                    <TierCard key={days} days={days} />
                  ))}
                </div>

                <Link href="/dashboard/savings/stake">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-14 bg-gradient-to-r from-[#C694F9] to-[#94A1F9] rounded-2xl font-black uppercase tracking-wider text-base shadow-2xl shadow-[#C694F9]/30 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" /> Stake EXPO Now
                  </motion.button>
                </Link>

                {/* Active stakes */}
                {stakes.filter((s: any) => s.status === 'active').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Active Stakes</h3>
                    {stakes.filter((s: any) => s.status === 'active').map((stake: any) => (
                      <StakeCard key={stake.id} stake={stake} onAction={fetchData} />
                    ))}
                  </div>
                )}

                {/* Past stakes */}
                {stakes.filter((s: any) => s.status !== 'active').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Completed</h3>
                    {stakes.filter((s: any) => s.status !== 'active').map((stake: any) => (
                      <StakeCard key={stake.id} stake={stake} onAction={fetchData} />
                    ))}
                  </div>
                )}

                {stakes.length === 0 && <EmptyHint text="Stake your EXPO tokens to earn rewards. Choose a lock period above." />}
              </motion.section>
            )}

            {/* ── POOL TAB ── */}
            {activeTab === "pool" && (
              <motion.section
                key="pool"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Pool info card */}
                <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#C694F9]/5 rounded-full blur-3xl" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-black text-base">EXPO Yield Pool</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Deposit XLM → Earn EXPO</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Est. APR</p>
                        <p className="font-black text-xl text-blue-400">~18%</p>
                        <p className="text-[9px] text-white/30">Variable</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Lock-up</p>
                        <p className="font-black text-xl text-green-400">None</p>
                        <p className="text-[9px] text-white/30">Anytime</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Rewards</p>
                        <p className="font-black text-xl text-[#C694F9]">EXPO</p>
                        <p className="text-[9px] text-white/30">Daily accrual</p>
                      </div>
                    </div>

                    <p className="text-xs text-white/40 leading-relaxed">
                      Deposit XLM and earn EXPO tokens as rewards daily. No lock-up — withdraw anytime with your accrued EXPO. Powered by the ExpoPay Yield Pool smart contract on Stellar.
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/savings/pool">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-14 bg-gradient-to-r from-blue-500 to-[#C694F9] rounded-2xl font-black uppercase tracking-wider text-base shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    <Droplets className="w-5 h-5" /> Deposit to Pool
                  </motion.button>
                </Link>

                {/* Active pool positions */}
                {pools.filter((p: any) => p.status === 'active').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Pool Positions</h3>
                    {pools.filter((p: any) => p.status === 'active').map((pos: any) => (
                      <PoolCard key={pos.id} position={pos} ticker={ticker} onAction={fetchData} />
                    ))}
                  </div>
                )}

                {pools.filter((p: any) => p.status !== 'active').length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Closed Positions</h3>
                    {pools.filter((p: any) => p.status !== 'active').map((pos: any) => (
                      <PoolCard key={pos.id} position={pos} ticker={ticker} onAction={fetchData} />
                    ))}
                  </div>
                )}

                {pools.length === 0 && <EmptyHint text="Deposit XLM to start earning EXPO rewards. No lock-up required — withdraw anytime." />}
              </motion.section>
            )}

          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    purple: "text-[#C694F9] bg-[#C694F9]/10 border-[#C694F9]/20",
    blue:   "text-blue-400   bg-blue-400/10   border-blue-400/20",
    pink:   "text-pink-400   bg-pink-400/10   border-pink-400/20",
    green:  "text-green-400  bg-green-400/10  border-green-400/20",
  };
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="font-black text-xl tracking-tight">{value} <span className="text-white/30 text-xs font-bold">{sub}</span></p>
        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function TierCard({ days }: { days: number }) {
  const rate = REWARD_RATES[days];
  const aprs: Record<number, string> = { 30: "~15% APR", 60: "~18% APR", 90: "~24% APR" };
  const icons: Record<number, string> = { 30: "🥉", 60: "🥈", 90: "🥇" };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "bg-white/[0.02] border rounded-2xl p-4 space-y-3 transition-all cursor-default",
        days === 90
          ? "border-green-500/30 bg-green-500/5"
          : days === 60
          ? "border-[#C694F9]/30"
          : "border-white/[0.08]"
      )}
    >
      <div className="text-2xl">{icons[days]}</div>
      <div>
        <p className="font-black text-base">{days} Days</p>
        <p className={cn("font-black text-2xl", rate.color)}>{rate.label}</p>
        <p className="text-[10px] text-white/30 font-bold mt-0.5">{aprs[days]} est.</p>
      </div>
      {days === 90 && (
        <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
          Best Rate
        </span>
      )}
    </motion.div>
  );
}

function StakeCard({ stake, onAction }: any) {
  const [unstaking, setUnstaking] = useState(false);
  const [error, setError]         = useState("");
  const isUnlocked  = new Date() >= new Date(stake.unlocks_at);
  const isActive    = stake.status === 'active';
  const rate        = REWARD_RATES[stake.duration_days];

  const handleUnstake = async () => {
    setUnstaking(true);
    setError("");
    try {
      const res = await fetch('/api/savings/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position_id: stake.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Unstake failed'); return; }
      onAction();
    } catch { setError('Network error'); }
    finally { setUnstaking(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
            stake.status === 'completed'
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : isUnlocked
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
              : "bg-[#C694F9]/10 border-[#C694F9]/20 text-[#C694F9]"
          )}>
            {stake.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-black text-base">{stake.amount_expo} EXPO</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              {stake.duration_days}-day lock · <span className={rate.color}>{rate.label} reward</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-sm text-green-400">+{stake.reward_expo.toFixed(4)} EXPO</p>
          <p className="text-[9px] text-white/30 font-bold">earned</p>
        </div>
      </div>

      {isActive && (
        <div>
          <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1.5">
            <span>{isUnlocked ? "✅ Ready to unstake" : `Unlocks ${formatDistanceToNow(new Date(stake.unlocks_at), { addSuffix: true })}`}</span>
            <span>{format(new Date(stake.unlocks_at), 'MMM d, yyyy')}</span>
          </div>
          <LockProgress stakedAt={stake.staked_at} unlocksAt={stake.unlocks_at} />
        </div>
      )}

      {stake.tx_hash_stake && (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${stake.tx_hash_stake}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/50 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View transaction
        </a>
      )}

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      {isActive && isUnlocked && (
        <button
          onClick={handleUnstake}
          disabled={unstaking}
          className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {unstaking ? <><Loader2 className="w-4 h-4 animate-spin" /> Unstaking...</> : '🎉 Collect Rewards'}
        </button>
      )}
    </motion.div>
  );
}

function PoolCard({ position, ticker, onAction }: any) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError]             = useState("");
  const isActive = position.status === 'active';

  // Live accrual: recalculate every tick
  const daysElapsed  = (Date.now() - new Date(position.deposited_at).getTime()) / (1000 * 60 * 60 * 24);
  const liveAccrued  = isActive
    ? (parseFloat(position.amount_xlm) * 50 * daysElapsed) / 10000
    : parseFloat(position.expo_earned || 0);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setError("");
    try {
      const res = await fetch('/api/savings/pool/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position_id: position.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Withdrawal failed'); return; }
      onAction();
    } catch { setError('Network error'); }
    finally { setWithdrawing(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
            isActive
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
              : "bg-green-500/10 border-green-500/20 text-green-400"
          )}>
            {isActive ? <Droplets className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-black text-base">{position.amount_xlm} XLM</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              Deposited {format(new Date(position.deposited_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <motion.p
            key={`${ticker}-${position.id}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="font-black text-sm text-[#C694F9]"
          >
            +{liveAccrued.toFixed(4)} EXPO
          </motion.p>
          <p className="text-[9px] text-white/30 font-bold flex items-center justify-end gap-1">
            {isActive && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />}
            {isActive ? "accruing live" : "earned"}
          </p>
        </div>
      </div>

      {position.tx_hash_deposit && (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${position.tx_hash_deposit}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-white/20 hover:text-white/50 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View deposit tx
        </a>
      )}

      {error && (
        <p className="text-red-400 text-xs font-bold bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      {isActive && (
        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="w-full h-11 bg-gradient-to-r from-blue-500 to-[#C694F9] rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {withdrawing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Withdrawing...</>
            : `Withdraw ${position.amount_xlm} XLM + EXPO`
          }
        </button>
      )}
    </motion.div>
  );
}

function LockProgress({ stakedAt, unlocksAt }: { stakedAt: string; unlocksAt: string }) {
  const start    = new Date(stakedAt).getTime();
  const end      = new Date(unlocksAt).getTime();
  const now      = Date.now();
  const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "h-full rounded-full",
          progress >= 100
            ? "bg-green-500"
            : "bg-gradient-to-r from-[#C694F9] to-[#94A1F9]"
        )}
      />
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-center py-8 text-white/30">
      <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-20" />
      <p className="text-sm font-bold max-w-xs mx-auto">{text}</p>
    </div>
  );
}
