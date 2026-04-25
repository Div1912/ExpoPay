"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Droplets, Loader2, Check, Zap } from "lucide-react";

export default function PoolDepositPage() {
  const router  = useRouter();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState<any>(null);

  const parsedAmount  = parseFloat(amount) || 0;
  // Est. daily EXPO = amount * 0.5% per day
  const dailyExpo     = (parsedAmount * 50) / 10000;
  const monthlyExpo   = dailyExpo * 30;

  const handleDeposit = async () => {
    if (!amount || parsedAmount <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/savings/pool/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_xlm: parsedAmount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Deposit failed"); return; }
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
          className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-blue-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black uppercase">Deposited! 💧</h2>
          <p className="text-white/50 text-sm mt-2">{success.message}</p>
          <p className="text-[#C694F9] font-black mt-3">
            ~{dailyExpo.toFixed(4)} EXPO / day accruing
          </p>
        </div>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${success.tx_hash}`}
          target="_blank" rel="noopener noreferrer"
          className="text-blue-400 text-sm font-bold underline underline-offset-2"
        >
          View on Stellar Explorer →
        </a>
        <button
          onClick={() => router.push("/dashboard/savings")}
          className="w-full max-w-xs h-12 bg-gradient-to-r from-blue-500 to-[#C694F9] rounded-2xl font-black text-sm uppercase tracking-wider"
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
          <h1 className="text-2xl font-black uppercase" style={{ fontFamily: 'var(--font-syne)' }}>EXPO Yield Pool</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Deposit XLM → Earn EXPO</p>
        </div>
      </div>

      {/* How it works */}
      <section className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-5 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">How It Works</p>
        {[
          { icon: "1️⃣", text: "Deposit any amount of XLM — no minimum, no lock-up." },
          { icon: "2️⃣", text: "Your XLM earns EXPO token rewards every day (~0.5%/day)." },
          { icon: "3️⃣", text: "Withdraw anytime — get your XLM back + all accrued EXPO." },
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-lg shrink-0">{step.icon}</span>
            <p className="text-sm text-white/60 font-bold">{step.text}</p>
          </div>
        ))}
      </section>

      {/* Amount input */}
      <section className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Amount to Deposit</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-blue-500/50 transition-all">
          <input
            id="pool-amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-transparent flex-1 font-black text-3xl focus:outline-none placeholder:text-white/10"
          />
          <span className="font-black text-white/30 text-base shrink-0">XLM</span>
        </div>
      </section>

      {/* Live projection */}
      {parsedAmount > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Projected Earnings</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Per Day</p>
              <p className="font-black text-xl text-[#C694F9]">{dailyExpo.toFixed(4)} <span className="text-xs text-white/30">EXPO</span></p>
            </div>
            <div>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Per Month</p>
              <p className="font-black text-xl text-[#C694F9]">{monthlyExpo.toFixed(3)} <span className="text-xs text-white/30">EXPO</span></p>
            </div>
          </div>
          <p className="text-[10px] text-white/30 font-bold">*Variable rate. Based on current reward pool size.</p>
        </motion.section>
      )}

      {/* Tax disclaimer */}
      <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl px-4 py-3">
        <p className="text-[10px] text-yellow-400/70 font-bold leading-relaxed">
          ⚠️ EXPO rewards are taxable at 30% as VDA income under Indian law. Not a guaranteed return.
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
        id="pool-deposit-submit"
        onClick={handleDeposit}
        disabled={loading || !amount}
        className="w-full h-14 bg-gradient-to-r from-blue-500 to-[#C694F9] rounded-2xl font-black uppercase tracking-wider text-base shadow-2xl shadow-blue-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Depositing...</>
          : <><Droplets className="w-5 h-5" /> Deposit {amount || "0"} XLM</>
        }
      </button>
    </div>
  );
}
