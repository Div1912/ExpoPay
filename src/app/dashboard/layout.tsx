"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, QrCode, History, User, Scan, LayoutDashboard, Store, Settings, FileText, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Background } from "@/components/Background";
import { InactivityGuard } from "@/components/InactivityGuard";
import { PaymentNotification } from "@/components/PaymentNotification";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; universal_id: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/expo/profile")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id && data?.universal_id) {
          setCurrentUser({ id: data.id, universal_id: data.universal_id });
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { label: "Overview",  icon: LayoutDashboard, href: "/dashboard" },
    { label: "History",   icon: History,          href: "/dashboard/history" },
    { label: "Scan",      icon: Scan,             href: "/dashboard/scan", primary: true },
    { label: "Split",     icon: Users,            href: "/dashboard/split" },
    { label: "Send",      icon: Send,             href: "/dashboard/send" },
  ];

  const sidebarItems = [
    { label: "Overview",    icon: LayoutDashboard, href: "/dashboard" },
    { label: "Transactions",icon: History,          href: "/dashboard/history" },
    { label: "Scan & Pay",  icon: Scan,             href: "/dashboard/scan" },
    { label: "Send Money",  icon: Send,             href: "/dashboard/send" },
    { label: "Split Bills", icon: Users,            href: "/dashboard/split" },
    { label: "Vault",       icon: TrendingUp,       href: "/dashboard/savings" },
    { label: "Pay Merchant",icon: Store,            href: "/dashboard/merchant" },
    { label: "Contracts",   icon: FileText,         href: "/dashboard/contracts" },
    { label: "My Code",     icon: QrCode,           href: "/dashboard/receive" },
  ];

  return (
    <InactivityGuard>
    <div className="min-h-screen bg-transparent text-white selection:bg-[#C694F9]/30">
      <Background />
      {currentUser && (
        <PaymentNotification
          currentUserId={currentUser.id}
          currentUniversalId={currentUser.universal_id}
        />
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 xl:w-80 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex-col p-6 xl:p-8 z-40">
        <div className="mb-8 shrink-0">
          <Link href="/"><Logo /></Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 px-3">Menu</p>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 h-11 rounded-xl transition-all relative overflow-hidden",
                mounted && pathname === item.href
                  ? "bg-[#C694F9]/10 text-[#C694F9] border border-[#C694F9]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                mounted && pathname === item.href ? "text-[#C694F9]" : "text-white/40")} />
              <span className="font-bold tracking-tight text-sm">{item.label}</span>
              {mounted && pathname === item.href && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-5 bg-[#C694F9] rounded-r-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-4 mt-2 border-t border-white/5 space-y-1 shrink-0">
          {[
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
            { href: "/dashboard/profile",  icon: User,     label: "Account" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 h-11 rounded-xl transition-all",
                mounted && pathname === href ? "bg-white/5 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-bold tracking-tight text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5 px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard"><Logo size="small" /></Link>
        <Link
          href="/dashboard/settings"
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Settings className="w-5 h-5 text-white/70" />
        </Link>
      </header>

      <main className="lg:pl-72 xl:pl-80 pb-28 lg:pb-0">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-5xl">
          <motion.div
            key={mounted ? pathname : 'initial'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <MobileNav navItems={navItems} sidebarItems={sidebarItems} pathname={mounted ? pathname : ''} />
    </div>
    </InactivityGuard>
  );
}

function MobileNav({ navItems, sidebarItems, pathname }: {
  navItems: any[];
  sidebarItems: any[];
  pathname: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // First 4 items for the bar (scan is item 3, centered)
  const barItems = navItems;

  return (
    <>
      {/* Bottom bar */}
      <nav className="lg:hidden fixed bottom-4 left-3 right-3 h-16 bg-black/80 backdrop-blur-2xl border border-white/10 flex items-center justify-around px-1 z-50 rounded-2xl shadow-2xl">
        {barItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 transition-all relative flex-1",
              pathname === item.href ? "text-[#C694F9]" : "text-white/35"
            )}
          >
            {item.primary ? (
              <div className="w-12 h-12 bg-gradient-to-br from-[#C694F9] to-[#94A1F9] rounded-full flex items-center justify-center -mt-7 border-4 border-black shadow-xl shadow-[#C694F9]/40 active:scale-90 transition-transform">
                <item.icon className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="relative flex flex-col items-center gap-0.5">
                <item.icon className="w-5 h-5" />
                {pathname === item.href && (
                  <motion.div layoutId="mobile-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C694F9] rounded-full" />
                )}
                <span className="text-[8px] font-bold">{item.label}</span>
              </div>
            )}
          </Link>
        ))}

        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={cn("flex flex-col items-center gap-0.5 flex-1 transition-all", drawerOpen ? "text-[#C694F9]" : "text-white/35")}
        >
          <div className="w-5 h-5 flex flex-col items-center justify-center gap-[3px]">
            <span className="w-4 h-[2px] bg-current rounded-full" />
            <span className="w-4 h-[2px] bg-current rounded-full" />
            <span className="w-4 h-[2px] bg-current rounded-full" />
          </div>
          <span className="text-[8px] font-bold">More</span>
        </button>
      </nav>

      {/* Full-screen drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.div key="dr"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl px-5 pt-5 pb-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 mb-4">All Pages</p>
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {sidebarItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all active:scale-95",
                      pathname === item.href
                        ? "bg-[#C694F9]/10 border-[#C694F9]/25 text-[#C694F9]"
                        : "bg-white/[0.03] border-white/[0.07] text-white/50"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-wide text-center leading-tight">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-white/[0.06] mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 mb-3">Account</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                  { href: "/dashboard/profile",  icon: User,     label: "Account" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95",
                      pathname === href
                        ? "bg-white/[0.08] border-white/15 text-white"
                        : "bg-white/[0.03] border-white/[0.07] text-white/50"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
