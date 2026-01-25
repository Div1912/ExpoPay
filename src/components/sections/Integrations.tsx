"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const StellarLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <circle cx="16" cy="16" r="14" fill="#000" />
    <path d="M19.84 11.04l-11.2 5.04c-.32.16-.64-.16-.48-.48l1.6-4.16c.16-.32-.16-.64-.48-.48l-4.16 1.6c-.32.16-.64-.16-.48-.48l5.04-11.2c.16-.32.48-.32.64 0l2.4 5.04c.16.32.48.32.64 0l2.4-5.04c.16-.32.48-.32.64 0l5.04 11.2c.16.32-.16.64-.48.48l-4.16-1.6c-.32-.16-.64.16-.48.48l1.6 4.16c.16.32-.16.64-.48.48l-11.2-5.04" fill="#fff" transform="translate(7, 7) scale(0.6)" />
    <circle cx="16" cy="16" r="4" fill="#fff" />
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#635BFF" />
    <path d="M14.5 12.5c0-.8.7-1.2 1.8-1.2 1.6 0 3.6.5 5.2 1.4V8.5c-1.7-.7-3.5-1-5.2-1-4.2 0-7 2.2-7 5.9 0 5.8 8 4.9 8 7.4 0 1-.9 1.3-2.1 1.3-1.8 0-4.2-.7-6-1.8v4.2c2 .9 4.1 1.3 6 1.3 4.3 0 7.3-2.1 7.3-5.9-.1-6.2-8-5.2-8-7.4z" fill="#fff" />
  </svg>
);

const PayPalLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#003087" />
    <path d="M22.7 10.4c-.8 3.7-3 5.5-6.8 5.5h-1.7c-.4 0-.8.3-.9.7L12 22.4c0 .3.2.6.5.6h3.4c.4 0 .7-.3.8-.6l.5-3c0-.3.4-.6.8-.6h.5c3.2 0 5.7-1.3 6.4-5 .3-1.5.1-2.8-.7-3.7-.3-.3-.5-.5-.5-.7z" fill="#fff" />
    <path d="M11.2 8c-.4 0-.8.3-.9.7L8.2 19.2c0 .3.2.5.5.5h4.1l1.5-7.2v-.1c.1-.4.5-.7.9-.7h1.9c3.7 0 6.5-1.5 7.4-5.8.1-.3.1-.6.1-.9-.9-.5-2-.7-3.2-.7h-7.1c-.4 0-.8.3-1.1.7z" fill="#fff" opacity=".7" />
  </svg>
);

const ApplePayLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#000" />
    <path d="M11.5 10.5c-.6.7-.5 1.9.1 2.8.5.7 1.2 1.2 2 1.2.9 0 1.2-.4 2.3-.4 1.1 0 1.4.4 2.2.4.8 0 1.4-.4 1.9-1.1-1.3-.8-1.5-2.5-.2-3.3-.5-.7-1.3-1.1-2-1.1-1.1 0-1.6.6-2.3.6-.8 0-1.4-.6-2.4-.6-.9 0-1.8.5-2.3 1.2.3-.2.5-.3.7-.3.6 0 1.1.3 1.3.7.3.5.3 1 .1 1.5-.4.4-1.1.6-1.4-.6zm4 3.8v.1c-.1.2-.3.6-.3 1 0 .5.1 1 .4 1.4.3.4.5.7.7 1-.5-.5-.9-1-1.2-1.6-.3-.6-.4-1.2-.4-1.9 0-.1 0-.1.1-.1.2.1.5.1.7.1z" fill="#fff" />
    <text x="18" y="20" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="system-ui">Pay</text>
  </svg>
);

const GooglePayLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#fff" />
    <path d="M15.5 17.2v-3.7h2.2c.6 0 1.1.2 1.5.6.4.4.6.9.6 1.5 0 .6-.2 1.1-.6 1.5-.4.4-.9.6-1.5.6h-2.2zm1.8-1.2c.3 0 .5-.1.7-.3.2-.2.3-.4.3-.7 0-.3-.1-.5-.3-.7-.2-.2-.4-.3-.7-.3h-1v2h1z" fill="#4285F4" />
    <path d="M21.5 14.7c.4.3.6.7.6 1.2 0 .5-.2 1-.6 1.3-.4.3-.9.5-1.5.5h-2.5v-3.7h2.3c.6 0 1.1.2 1.5.5l.2.2zm-2.2 2.2h.5c.3 0 .5-.1.7-.2.2-.2.2-.4.2-.7 0-.2-.1-.4-.2-.6-.2-.2-.4-.2-.7-.2h-.5v1.7z" fill="#EA4335" />
    <text x="9" y="20" fill="#34A853" fontSize="7" fontWeight="bold" fontFamily="system-ui">G</text>
  </svg>
);

const CircleLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#00D4AA" />
    <circle cx="16" cy="16" r="8" fill="none" stroke="#fff" strokeWidth="2" />
    <circle cx="16" cy="16" r="4" fill="#fff" />
  </svg>
);

const WiseLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#9FE870" />
    <path d="M8 16l4-6 4 6-4 6-4-6zm8 0l4-6 4 6-4 6-4-6z" fill="#1A1A1A" />
  </svg>
);

const BitcoinLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#F7931A" />
    <path d="M21.2 14.3c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2v-.1l-2.3-.6-.4 1.8s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2v.1l-1.1 4.4c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.6c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c2.8.5 5 .3 5.9-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1.1 2.1-2.6zm-3.7 5.3c-.5 2-4 .9-5.1.6l.9-3.7c1.1.3 4.8.8 4.2 3.1zm.5-5.3c-.5 1.8-3.4.9-4.3.7l.8-3.3c.9.2 4 .6 3.5 2.6z" fill="#fff" />
  </svg>
);

const BankLogo = () => (
  <svg viewBox="0 0 32 32" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#1E3A5F" />
    <path d="M16 7l9 5v2H7v-2l9-5zm-6 9h3v7H10v-7zm4.5 0h3v7h-3v-7zm4.5 0h3v7h-3v-7zM7 24h18v2H7v-2z" fill="#fff" />
  </svg>
);

const orbitIcons = [
  { name: "Stellar", Logo: StellarLogo, angle: 0, orbit: 1 },
  { name: "Stripe", Logo: StripeLogo, angle: 72, orbit: 1 },
  { name: "PayPal", Logo: PayPalLogo, angle: 144, orbit: 1 },
  { name: "Apple", Logo: ApplePayLogo, angle: 216, orbit: 1 },
  { name: "Google", Logo: GooglePayLogo, angle: 288, orbit: 1 },
  { name: "Circle", Logo: CircleLogo, angle: 30, orbit: 2 },
  { name: "Wise", Logo: WiseLogo, angle: 120, orbit: 2 },
  { name: "Bitcoin", Logo: BitcoinLogo, angle: 210, orbit: 2 },
  { name: "Bank", Logo: BankLogo, angle: 300, orbit: 2 },
];

const OrbitIcon = ({ icon, orbitRadius, counterRotate }: { 
  icon: typeof orbitIcons[0], 
  orbitRadius: number, 
  counterRotate: boolean 
}) => {
  const [rotation, setRotation] = useState(icon.angle);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + (counterRotate ? -0.3 : 0.3));
    }, 50);
    return () => clearInterval(interval);
  }, [counterRotate]);
  
  const angleRad = (rotation * Math.PI) / 180;
  const x = Math.cos(angleRad) * orbitRadius;
  const y = Math.sin(angleRad) * orbitRadius;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `calc(50% + ${x}%)`,
        top: `calc(50% + ${y}%)`,
        transform: `translate(-50%, -50%)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: icon.angle / 360 }}
    >
      <div 
        className="w-10 sm:w-12 md:w-14 lg:w-16 aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 bg-black/80 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform cursor-pointer overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-6 sm:w-7 md:w-8 lg:w-9 aspect-square">
          <icon.Logo />
        </div>
      </div>
    </motion.div>
  );
};

const Integrations = () => {
  return (
    <section className="relative w-full overflow-hidden bg-black py-20 sm:py-28 md:py-40 lg:py-56">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1200px] aspect-square rounded-full bg-gradient-to-br from-[#94A1F9]/10 to-[#C694F9]/5 blur-[180px] md:blur-[250px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-16 sm:mb-20 md:mb-24"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-5 sm:mb-6 md:mb-8">
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#94A1F9] shadow-[0_0_10px_#94A1F9]" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60">Ecosystem</span>
          </div>
          
          <h2 
            className="font-black leading-[0.9] tracking-tight mb-5 sm:mb-6 md:mb-8"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            <span className="block text-white text-[10vw] sm:text-[9vw] md:text-[8vw] lg:text-[5.5vw] xl:text-[5rem]">Integrate with</span>
            <span className="block bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] bg-clip-text text-transparent text-[10vw] sm:text-[9vw] md:text-[8vw] lg:text-[5.5vw] xl:text-[5rem]">any apps</span>
          </h2>
          
          <p className="text-white/50 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed">
            Connect with your favorite payment platforms, banks, and crypto networks seamlessly.
          </p>
          
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-6 sm:px-8 md:px-10 h-12 sm:h-14 md:h-16 rounded-full bg-white text-black font-black text-sm sm:text-base uppercase tracking-wide sm:tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgba(255,255,255,0.12)]"
          >
            Get the app
          </Link>
        </motion.div>

        <div className="relative w-full max-w-[300px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-[800px] aspect-square mx-auto">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[30%] aspect-square border border-white/[0.08] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.02)]" />
            <div className="absolute w-[50%] aspect-square border border-white/[0.1] rounded-full shadow-[0_0_25px_rgba(255,255,255,0.03)]" />
            <div className="absolute w-[70%] aspect-square border border-white/[0.12] rounded-full shadow-[0_0_35px_rgba(255,255,255,0.04)]" />
            <div className="absolute w-[90%] aspect-square border border-white/[0.08] rounded-full shadow-[0_0_45px_rgba(255,255,255,0.02)]" />
          </div>

          <div className="absolute inset-0">
            {orbitIcons.filter(icon => icon.orbit === 1).map((icon) => (
              <OrbitIcon 
                key={icon.name} 
                icon={icon} 
                orbitRadius={35} 
                counterRotate={false}
              />
            ))}
          </div>

          <div className="absolute inset-0">
            {orbitIcons.filter(icon => icon.orbit === 2).map((icon) => (
              <OrbitIcon 
                key={icon.name} 
                icon={icon} 
                orbitRadius={22} 
                counterRotate={true}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="w-16 sm:w-20 md:w-24 lg:w-28 aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] flex items-center justify-center shadow-[0_0_60px_rgba(198,148,249,0.4)] p-0.5 sm:p-1">
              <div className="w-full h-full rounded-[14px] sm:rounded-[20px] bg-[#0A0A0A] flex items-center justify-center">
                <span className="text-white font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl" style={{ fontFamily: 'var(--font-syne)' }}>E</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-12 sm:mt-16 md:mt-20"
        >
          {["Stellar", "Circle", "Wise", "Stripe", "PayPal", "Apple Pay", "Google Pay", "Bitcoin"].map((name) => (
            <span
              key={name}
              className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full text-xs sm:text-sm text-white/60 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all cursor-pointer"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;
