"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Log In
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-6 rounded-full transition-all hover:scale-105 active:scale-95">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
