"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_MS = 60 * 1000;           // warn 1 minute before

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
] as const;

/**
 * Automatically signs the user out after `INACTIVITY_TIMEOUT_MS` of inactivity.
 * Returns `{ showWarning }` — a boolean that is true for the last minute before logout.
 */
export function useInactivityLogout() {
  const router = useRouter();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showWarningRef = useRef(false);
  // We expose this via a ref so UI components can read it without re-rendering on every activity event
  const setShowWarning = useRef<((val: boolean) => void) | null>(null);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();

    // Hide warning if it was showing
    if (showWarningRef.current) {
      showWarningRef.current = false;
      setShowWarning.current?.(false);
    }

    // Warning timer
    warningTimerRef.current = setTimeout(() => {
      showWarningRef.current = true;
      setShowWarning.current?.(true);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Logout timer
    logoutTimerRef.current = setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/auth/login?reason=inactivity");
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearTimers, router]);

  useEffect(() => {
    // Start timers immediately on mount
    resetTimers();

    // Reset on any user activity
    const handleActivity = () => resetTimers();
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, handleActivity)
      );
    };
  }, [resetTimers, clearTimers]);

  return { setShowWarning };
}
