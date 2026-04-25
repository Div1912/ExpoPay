"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
  { days: 30, reward: "1.25%", apr: "~15% APR", icon: "🥉", color: "border-blue-500/30   bg-blue-500/5   text-blue-400" },
  { days: 60, reward: "3.00%", apr: "~18% APR", icon: "🥈", color: "border-[#C694F9]/30 bg-[#C694F9]/5 text-[#C694F9]" },
  { days: 90, reward: "6.00%", apr: "~24% APR", icon: "🥇", color: "border-green-500/30 bg-green-500/5 text-green-400", best: true },
];

export default function StakePage() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<30 | 60 | 90>(90);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState<any>(null);

  const tier = TIERS.find(t => t.days === selectedDays)!;
  const parsedAmount  = parseFloat(amount) || 0;
  const rewardBps     = { 30: 125, 60: 300, 90: 600 }[selectedDays];
  const estimatedGain = (parsedAmount * rewardBps) / 10000;
  const totalPayout   = parsedAmount + estimatedGain;

  const handleStake = async () => {
    if (!amount || parsedAmount <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/savings/stake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_expo: parsedAmount, duration_days: selectedDays }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Staking failed"); return; }
      setSuccess(data);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-20 h-20 rounded-3xl bg-green-500/10 border border-green-500/30 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-green-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black uppercase">Staked! 🎉</h2>
          <p className="text-white/50 text-sm mt-2">{success.message}</p>
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${success.tx_hash}`}
          target="_blank" rel="noopener noreferrer"
          className="text-[#C694F9] text-sm font-bold underline underline-offset-2"
        >
          View on Stellar Explorer →
        </a>
        <button
          onClick={() => router.push("/dashboard/savings")}
          className="w-full max-w-xs h-12 bg-gradient-to-r from-[#C694F9] to-[#94A1F9] rounded-2xl font-black text-sm uppercase tracking-wider"
        >
          Back to Vault
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase" style={{ fontFamily: 'var(--font-syne)' }}>Stake EXPO</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Lock & Earn rewards</p>
        </div>
      </div>

      {/* Tier selector */}
      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Choose Lock Period</p>
        <div className="grid grid-cols-3 gap-3">
          {TIERS.map(t => (
            <motion.button
              key={t.days}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDays(t.days as 30 | 60 | 90)}
              className={cn(
                "relative border rounded-2xl p-4 text-left transition-all space-y-2",
                selectedDays === t.days ? t.color : "border-white/10 bg-white/5 text-white/60"
              )}
            >
              {t.best && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-green-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Best
                </span>
              )}
              <div className="text-xl">{t.icon}</div>
              <div>
                <p className="font-black text-base">{t.days}d</p>
                <p className={cn("font-black text-lg", selectedDays === t.days ? "" : "text-white")}>
                  {t.reward}
                </p>
                <p className="text-[9px] opacity-60 font-bold">{t.apr}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Amount input */}
      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Amount to Stake</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-[#C694F9]/50 transition-all">
          <input
            id="stake-amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent flex-1 font-black text-3xl focus:outline-none placeholder:text-white/10"
          />
          <span className="font-black text-white/30 text-base shrink-0">EXPO</span>
        </div>
      </section>

      {/* Summary */}
      {parsedAmount > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-3"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Summary</p>
          <div className="space-y-2">
            <Row label="You stake"       value={`${parsedAmount} EXPO`} />
            <Row label="Lock period"     value={`${selectedDays} days`} />
            <Row label="Reward rate"     value={tier.reward} highlight />
            <Row label="Est. reward"     value={`+${estimatedGain.toFixed(4)} EXPO`} green />
            <div className="h-px bg-white/5" />
            <Row label="Total payout"    value={`${totalPayout.toFixed(4)} EXPO`} bold />
          </div>
        </motion.section>
      )}

      {/* Tax disclaimer */}
      <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl px-4 py-3">
        <p className="text-[10px] text-yellow-400/70 font-bold leading-relaxed">
          ⚠️ Staking rewards are taxable at 30% as VDA income under Indian law. Returns are variable and not guaranteed.
        </p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3"
        >
          <p className="text-red-400 text-sm font-bold">{error}</p>
        </motion.div>
      )}

      <button
        id="stake-submit"
        onClick={handleStake}
        disabled={loading || !amount}
        className="w-full h-14 bg-gradient-to-r from-[#C694F9] to-[#94A1F9] rounded-2xl font-black uppercase tracking-wider text-base shadow-2xl shadow-[#C694F9]/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Staking on Stellar...</>
          : <><Lock className="w-5 h-5" /> Stake {amount || "0"} EXPO</>
        }
      </button>
    </div>
  );
}

function Row({ label, value, highlight, green, bold }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-white/50 font-bold">{label}</span>
      <span className={cn(
        "font-black text-sm",
        highlight ? "text-[#C694F9]" : green ? "text-green-400" : bold ? "text-white" : "text-white/80"
      )}>
        {value}
      </span>
    </div>
  );
}
