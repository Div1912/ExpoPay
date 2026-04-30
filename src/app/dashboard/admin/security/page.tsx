"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Lock, Zap } from "lucide-react";

interface CheckItem {
  id: string;
  title: string;
  description: string;
  status: "done" | "partial" | "todo";
  link?: string;
}

const CHECKLIST: CheckItem[] = [
  {
    id: "auth",
    title: "Server-side authentication on every API route",
    description: "All routes call getUser() server-side via Supabase Auth. Middleware redirects unauthenticated browser navigations away from /dashboard/*.",
    status: "done",
  },
  {
    id: "pin",
    title: "4-digit transaction PIN",
    description: "Every fund-moving action (send, merchant pay, escrow refund/release) requires the user's 4-digit PIN before proceeding.",
    status: "done",
  },
  {
    id: "inactivity",
    title: "Inactivity guard (15-min auto-logout)",
    description: "InactivityGuard component resets on user activity and is visibility-aware so it does not fire while the device is backgrounded.",
    status: "done",
  },
  {
    id: "onchain",
    title: "On-chain audit trail (Stellar tx hash)",
    description: "Every payment, escrow action, and vault event emits a Stellar transaction hash verifiable on Stellar Expert.",
    status: "done",
  },
  {
    id: "servicekey",
    title: "SUPABASE_SERVICE_ROLE_KEY guard",
    description: "The server refuses to start in production if the service role key is missing — prevents silent admin write failures.",
    status: "done",
  },
  {
    id: "duplicate",
    title: "Duplicate transaction detection",
    description: "10-second idempotency check prevents double-spends from rapid resubmissions on the send payment route.",
    status: "done",
  },
  {
    id: "gasless",
    title: "Fee Bump (Gasless) — no private key leakage",
    description: "The fee-bump flow keeps the sender's private key server-side and only the fee_source (platform key) is exposed on-chain.",
    status: "done",
  },
  {
    id: "logging",
    title: "Structured security event logging",
    description: "Critical events (payment attempts, PIN failures, admin actions) are persisted to app_logs with level, route, and user_id.",
    status: "done",
  },
  {
    id: "pin_hash",
    title: "Hash app_pin with bcrypt",
    description: "Currently stored as plaintext. Migration needed: hash with bcrypt(pin, 10) before storage, verify with bcrypt.compare() on every transaction.",
    status: "partial",
  },
  {
    id: "secret_encrypt",
    title: "Encrypt stellar_secret at rest",
    description: "Currently stored as plaintext in Postgres. AES-256-GCM encryption with ENCRYPTION_KEY env var should be added before mainnet.",
    status: "partial",
  },
  {
    id: "rate_limit",
    title: "Rate limiting on auth and payment endpoints",
    description: "Implement rate limiting (e.g. 10 req/min per IP) on /api/auth/*, /api/expo/claim, /api/admin/resolve.",
    status: "partial",
  },
  {
    id: "admin_role",
    title: "Role-based admin access (DB column)",
    description: "Admin/arbiter role is currently checked via ADMIN_EMAILS env var. Migrate to profiles.role column for proper RBAC.",
    status: "todo",
  },
  {
    id: "contract_audit",
    title: "Soroban smart contract audit",
    description: "All contracts are deployed on testnet only. A formal security audit is required before any mainnet deployment.",
    status: "todo",
  },
];

const statusConfig = {
  done: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", label: "Implemented" },
  partial: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Partial / Planned" },
  todo: { icon: XCircle, color: "text-white/30", bg: "bg-white/[0.02] border-white/[0.06]", label: "On Backlog" },
};

export default function SecurityPage() {
  const done = CHECKLIST.filter(i => i.status === "done").length;
  const partial = CHECKLIST.filter(i => i.status === "partial").length;
  const total = CHECKLIST.length;
  const score = Math.round((done / total) * 100);

  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1
          className="text-[clamp(1.8rem,6vw,3rem)] font-black tracking-tight uppercase leading-none mb-3"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          SECURITY
        </h1>
        <p className="text-white/40 text-sm">
          Platform security posture for ExpoPay production deployment.
        </p>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#C694F9]/5 rounded-full blur-[60px]" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C694F9]/20 to-[#94A1F9]/20 border border-[#C694F9]/20">
            <Shield className="w-9 h-9 text-[#C694F9]" />
          </div>
          <div className="flex-1">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-[#C694F9]">{score}%</span>
              <span className="text-white/40 font-bold mb-1">secure</span>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="text-green-400">✓ {done} implemented</span>
              <span className="text-yellow-400">⚠ {partial} partial</span>
              <span className="text-white/30">○ {total - done - partial} backlog</span>
            </div>
          </div>
          <a
            href="https://github.com/Div1912/ExpoPay/blob/main/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#C694F9]/10 border border-[#C694F9]/20 rounded-xl text-[#C694F9] text-sm font-bold hover:bg-[#C694F9]/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            SECURITY.md
          </a>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-[#C694F9] to-[#94A1F9]"
          />
        </div>
      </motion.div>

      {/* Checklist */}
      <div className="space-y-3">
        {CHECKLIST.map((item, i) => {
          const cfg = statusConfig[item.status];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${cfg.bg}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-black text-sm">{item.title}</h3>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed">{item.description}</p>
                  {item.link && (
                    <a href={item.link} className="text-[#C694F9] text-xs font-bold flex items-center gap-1 mt-2">
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Advanced Security Note */}
      <div className="p-5 rounded-xl bg-[#C694F9]/5 border border-[#C694F9]/15">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#C694F9] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-sm text-[#C694F9] mb-1">Advanced: Fee Bump Privacy</h4>
            <p className="text-white/40 text-xs leading-relaxed">
              Gasless transactions via fee_bump_transaction keep the sender&apos;s keypair server-side. On-chain, the 
              <span className="text-white/60 font-bold"> fee_source</span> is the platform wallet, not the user. 
              This means user wallet addresses are not directly linked to fees on the explorer, enhancing privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
