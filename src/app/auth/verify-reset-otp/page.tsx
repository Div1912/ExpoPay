"use client";

import { useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Background } from "@/components/Background";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function VerifyResetOtpInner() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "recovery",
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      router.push("/auth/update-password");
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-[#C694F9]/30 overflow-hidden">
      <Background />
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center px-4 py-4 bg-transparent">
        <Logo />
      </nav>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1
              className="text-[clamp(2rem,6vw,3rem)] font-black leading-[0.95] tracking-[-0.04em] mb-3 sm:mb-4 uppercase"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Verify Reset Code
            </motion.h1>
            <p className="text-white/50 text-sm sm:text-base">
              We sent a 6-digit code to <span className="text-white font-bold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">
                6-Digit Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="w-full h-12 sm:h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl sm:rounded-2xl px-4 sm:px-5 text-white text-center text-2xl tracking-[0.5em] font-bold focus:border-[#C694F9]/40 focus:bg-white/[0.05] transition-all duration-300"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs sm:text-sm text-red-500 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="group relative w-full h-12 sm:h-14 mt-4 bg-white text-black font-black text-sm sm:text-base rounded-xl sm:rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Code"}
              </span>
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#C694F9] animate-spin" /></div>}>
      <VerifyResetOtpInner />
    </Suspense>
  );
}
