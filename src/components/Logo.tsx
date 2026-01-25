"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Logo({ className = "", showText = true, size = "default" }: { className?: string; showText?: boolean; size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "w-7 h-7",
    default: "w-9 h-9",
    large: "w-12 h-12"
  };

  const textSizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
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
        <div className="absolute inset-2 rounded-md bg-gradient-to-br from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] shadow-[0_0_20px_rgba(198,148,249,0.7)]" />
      </div>
      {showText && (
        <span 
          className={`text-white font-black ${textSizeClasses[size]} tracking-tighter`}
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          EXPO
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-8 h-8",
    large: "w-10 h-10"
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
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
      <div className="absolute inset-2 rounded-md bg-gradient-to-br from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] shadow-[0_0_20px_rgba(198,148,249,0.7)]" />
    </div>
  );
}
