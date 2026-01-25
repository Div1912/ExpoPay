"use client";

import React, { useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import Marquee from 'react-fast-marquee';

gsap.registerPlugin(ScrollTrigger);

const FooterCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, {
        opacity: 0,
        y: 60,
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          });
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120vw] max-w-[1400px] h-[500px] sm:h-[600px] md:h-[700px] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(ellipse, rgba(198, 148, 249, 0.6) 0%, rgba(148, 161, 249, 0.3) 40%, transparent 70%)',
            filter: 'blur(80px)',
            transform: 'translateX(-50%) translateY(40%)',
          }}
        />
      </div>

      <div className="py-20 sm:py-28 md:py-36 lg:py-48">
        <div ref={titleRef} className="container relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px] flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <h2 
              className="font-black leading-[0.85] tracking-tight mb-5 sm:mb-6 md:mb-8"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              <span className="block bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] bg-clip-text text-transparent text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[8vw] xl:text-[7rem]">
                Get
              </span>
              <span className="block text-white text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[8vw] xl:text-[7rem]">
                Started.
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-white/50 text-sm sm:text-base md:text-lg lg:text-xl max-w-lg mb-8 sm:mb-10 md:mb-14"
          >
            Fast, secure, and borderless payments—powered by EXPO on Stellar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link
              href="/auth/signup"
              className="group relative flex h-12 sm:h-14 md:h-16 items-center justify-center rounded-full bg-white px-6 sm:px-8 md:px-12 transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-sm sm:text-base font-black text-black flex items-center gap-2 sm:gap-3 uppercase tracking-wide sm:tracking-wider">
                Create Account
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="w-4 sm:w-5 group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="flex h-12 sm:h-14 md:h-16 items-center justify-center rounded-full border border-white/15 px-6 sm:px-8 md:px-12 text-white font-black text-sm sm:text-base uppercase tracking-wide sm:tracking-wider hover:bg-white/5 hover:border-white/25 transition-all duration-300 active:scale-[0.98]"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="relative py-6 sm:py-8 border-y border-white/[0.05] overflow-hidden">
        <Marquee speed={40} gradient={false}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 sm:gap-8 md:gap-12 mx-6 sm:mx-8 md:mx-12">
              <span 
                className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[12rem] font-black text-white/[0.03] uppercase tracking-tighter whitespace-nowrap"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                EXPO
              </span>
              <span className="text-white/[0.08] text-2xl sm:text-3xl md:text-4xl">•</span>
              <span 
                className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[12rem] font-black text-white/[0.03] uppercase tracking-tighter whitespace-nowrap"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                PAYMENTS
              </span>
              <span className="text-white/[0.08] text-2xl sm:text-3xl md:text-4xl">•</span>
              <span 
                className="text-[5rem] sm:text-[7rem] md:text-[10rem] lg:text-[12rem] font-black text-white/[0.03] uppercase tracking-tighter whitespace-nowrap"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                STELLAR
              </span>
              <span className="text-white/[0.08] text-2xl sm:text-3xl md:text-4xl">•</span>
            </div>
          ))}
        </Marquee>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        viewport={{ once: true }}
        className="py-8 sm:py-10 md:py-12 border-t border-white/[0.05]"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 sm:w-7 md:w-8 aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br from-[#C694F9] to-[#94A1F9] shadow-[0_0_15px_rgba(198,148,249,0.35)]" />
              <span className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>EXPO</span>
            </div>
            
            <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
              {["Privacy", "Terms", "Support", "Docs"].map((link) => (
                <a 
                  key={link}
                  href="#" 
                  className="text-white/40 text-xs sm:text-sm font-medium hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>

            <p className="text-white/30 text-xs sm:text-sm">
              © 2025 EXPO. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
};

export default FooterCTA;
