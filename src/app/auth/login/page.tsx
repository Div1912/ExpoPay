"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Background } from "@/components/Background";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("universal_id")
        .eq("id", data.user.id)
        .single();

      if (profile?.universal_id) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-[#C694F9]/30 overflow-hidden">
      <Background />

        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 bg-transparent">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="relative w-8 sm:w-9 h-8 sm:h-9">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-white/30"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 rounded-full border-t-2 border-l-2 border-white/60"
              />
              <div className="absolute inset-2 rounded-md bg-gradient-to-br from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] shadow-[0_0_20px_rgba(198,148,249,0.7)] flex items-center justify-center p-0.5">
                <span className="text-white font-black text-[10px]" style={{ fontFamily: 'var(--font-syne)' }}>E</span>
              </div>
            </div>
            <span className="text-white font-black text-lg sm:text-xl tracking-tight group-hover:text-iridescent transition-all duration-300" style={{ fontFamily: 'var(--font-syne)' }}>EXPO</span>
          </Link>
        <Link
          href="/auth/signup"
          className="flex items-center justify-center px-4 sm:px-6 h-10 sm:h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white text-xs sm:text-sm font-medium hover:bg-white/15 transition-all"
        >
          Create Account
        </Link>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(2rem,8vw,3.5rem)] font-black leading-[0.95] tracking-[-0.04em] mb-3 sm:mb-4"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              <span className="block bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] bg-clip-text text-transparent whitespace-nowrap">
                Welcome
              </span>
              <span className="block text-white whitespace-nowrap">
                Back
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white/50 text-sm sm:text-base"
            >
              Sign in to continue to your account
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full h-12 sm:h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl sm:rounded-2xl px-4 sm:px-5 text-white text-sm sm:text-base placeholder:text-white/25 focus:border-[#C694F9]/40 focus:bg-white/[0.05] focus:ring-0 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] sm:text-xs font-medium text-white/40 ml-1 uppercase tracking-wider">Password</label>
                <Link href="#" className="text-[10px] sm:text-xs font-medium text-white/40 hover:text-[#C694F9] transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-12 sm:h-14 bg-white/[0.03] border border-white/[0.08] rounded-xl sm:rounded-2xl px-4 sm:px-5 text-white text-sm sm:text-base placeholder:text-white/25 focus:border-[#C694F9]/40 focus:bg-white/[0.05] focus:ring-0 transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 sm:h-14 mt-2 bg-white hover:bg-white/95 text-black font-semibold text-sm sm:text-base rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative my-6 sm:my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] sm:text-xs font-medium uppercase tracking-widest">
              <span className="bg-black px-4 text-white/25">Or</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="w-full flex justify-center"
          >
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "273981797365-ke6n33in7sr83gngo8h3fin80m529cqk.apps.googleusercontent.com"}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const { credential } = credentialResponse;
                  if (!credential) return;
                  
                  const { data, error: googleError } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: credential,
                  });
                  
                  if (googleError) {
                    setError(googleError.message);
                  } else if (data?.user) {
                    const { data: profile } = await supabase
                      .from("profiles")
                      .select("universal_id")
                      .eq("id", data.user.id)
                      .single();

                    if (profile?.universal_id) {
                      router.push("/dashboard");
                    } else {
                      router.push("/onboarding");
                    }
                  }
                }}
                onError={() => {
                  setError('Google Login Failed');
                }}
                shape="pill"
                theme="filled_black"
                text="continue_with"
                size="large"
              />
            </GoogleOAuthProvider>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 sm:mt-10 text-center text-white/35 text-xs sm:text-sm"
          >
            New here?{" "}
            <Link href="/auth/signup" className="text-white font-medium hover:text-[#C694F9] transition-colors">Create an account</Link>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
