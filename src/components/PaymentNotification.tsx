"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PaymentNotificationProps {
  currentUserId: string;
  currentUniversalId: string;
}

export function PaymentNotification({ currentUserId, currentUniversalId }: PaymentNotificationProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const showNotification = useCallback((tx: any) => {
    const amount = parseFloat(tx.amount || "0").toFixed(2);
    const currency = tx.currency || "XLM";
    const sender = tx.sender_universal_id || "Someone";

    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="w-[calc(100vw-2rem)] max-w-sm mx-auto"
        >
          <div className="relative bg-[#0d0d0d] border border-[#C694F9]/30 rounded-2xl p-4 shadow-2xl shadow-black/60 overflow-hidden">
            {/* gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9]" />

            <div className="flex items-start gap-3">
              {/* icon */}
              <div className="w-11 h-11 shrink-0 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                <ArrowDownLeft className="w-5 h-5 text-green-400" />
              </div>

              {/* text */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">
                  Payment Received
                </p>
                <p className="font-black text-white text-base leading-tight">
                  +{amount}{" "}
                  <span className="text-green-400">{currency}</span>
                </p>
                <p className="text-xs text-white/50 mt-0.5 truncate">
                  from{" "}
                  <span className="text-[#C694F9] font-bold">{sender}@expo</span>
                </p>
              </div>

              {/* close */}
              <button
                onClick={() => toast.dismiss(t)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>
          </div>
        </motion.div>
      ),
      {
        duration: 7000,
        position: "top-center",
      }
    );
  }, []);

  useEffect(() => {
    if (!currentUserId || !currentUniversalId) return;

    // Subscribe to new incoming transactions for this user
    const channel = supabase
      .channel(`incoming-payments-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transactions",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          showNotification(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, currentUniversalId, showNotification]);

  return null; // renders nothing — toasts are managed by Sonner
}
