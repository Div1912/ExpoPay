"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useInView } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return <span ref={ref}>${count.toLocaleString()}</span>;
}

const LargePayments = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, cardRef.current], {
        opacity: 0,
        y: 80,
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          })
          .to(cardRef.current, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          }, "-=0.7");
        },
        once: true,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-black py-20 sm:py-28 md:py-40 lg:py-56 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1000px] aspect-square rounded-full bg-gradient-to-br from-[#C694F9]/10 to-[#F5A7C4]/5 blur-[150px] md:blur-[200px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16 md:gap-20 lg:gap-28 xl:gap-32">
          
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div
              ref={cardRef}
              className="relative"
              style={{ perspective: '1000px' }}
            >
              <div className="relative w-full max-w-[380px] sm:max-w-[420px] md:max-w-[450px] mx-auto">
                <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-br from-[#C694F9]/25 to-[#F5A7C4]/15 rounded-[40px] sm:rounded-[56px] blur-2xl sm:blur-3xl" />
                
                <div className="relative bg-gradient-to-br from-[#141414] to-[#0a0a0a] rounded-[28px] sm:rounded-[36px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white/[0.08] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                  <div className="text-center space-y-6 sm:space-y-8 md:space-y-10">
                    <div>
                      <p className="text-white/50 text-xs sm:text-sm mb-2 sm:mb-3 font-medium">You're sending</p>
                      <h3 
                        className="font-black text-white tracking-tighter text-[9vw] sm:text-[7vw] md:text-[5vw] lg:text-[3.5rem] xl:text-[4rem]"
                        style={{ fontFamily: 'var(--font-syne)' }}
                      >
                        <AnimatedCounter target={1000000} duration={2.5} />
                      </h3>
                      <p className="text-white/30 text-xs sm:text-sm mt-1.5 sm:mt-2 font-medium">USD</p>
                    </div>

                    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 sm:w-11 md:w-12 aspect-square rounded-full bg-gradient-to-br from-[#C694F9] to-[#94A1F9] shadow-[0_0_20px_rgba(198,148,249,0.35)]" />
                        <span className="text-white/70 text-xs sm:text-sm font-medium">You</span>
                      </div>
                      <div className="flex-1 h-[2px] bg-gradient-to-r from-[#C694F9]/60 via-white/30 to-[#94A1F9]/60 relative rounded-full max-w-[100px] sm:max-w-[120px]">
                        <motion.div 
                          animate={{ x: [0, 80, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-1/2 -translate-y-1/2 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white shadow-[0_0_12px_white,0_0_25px_rgba(255,255,255,0.4)]"
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-white/70 text-xs sm:text-sm font-medium">Alex</span>
                        <div className="w-10 sm:w-11 md:w-12 aspect-square rounded-full bg-gradient-to-br from-[#F5A7C4] to-[#C694F9] shadow-[0_0_20px_rgba(245,167,196,0.35)]" />
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 py-4 sm:py-5 md:py-6 border-y border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-white/40">Network Fee</span>
                        <span className="text-white/70 font-medium">$0.01</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-white/40">Processing Time</span>
                        <span className="text-green-400 font-bold">~3 seconds</span>
                      </div>
                    </div>

                    <button className="w-full h-12 sm:h-14 md:h-16 rounded-full bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] text-black font-black text-xs sm:text-sm md:text-base uppercase tracking-wide sm:tracking-wider flex items-center justify-center gap-2 sm:gap-3 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgba(198,148,249,0.25)]">
                      Confirm & Send
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5">
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div ref={titleRef} className="w-full lg:w-1/2 order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-5 sm:mb-6 md:mb-8">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#F5A7C4] shadow-[0_0_10px_#F5A7C4]" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60">Enterprise</span>
            </div>
            
            <h2 
              className="font-black leading-[0.9] tracking-tight mb-5 sm:mb-6 md:mb-8"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              <span className="block bg-gradient-to-r from-[#C694F9] to-[#F5A7C4] bg-clip-text text-transparent text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[5.5vw] xl:text-[4.5rem]">Large</span>
              <span className="block bg-gradient-to-r from-[#F5A7C4] to-[#94A1F9] bg-clip-text text-transparent text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[5.5vw] xl:text-[4.5rem]">Payments</span>
            </h2>
            
            <p className="text-white/50 text-sm sm:text-base md:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 md:mb-10 leading-relaxed">
              Send payments over $1,000,000 USD with ease. Experience unmatched security for high-value transactions.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
              {[
                { label: "Max Transfer", value: "Unlimited" },
                { label: "Settlement", value: "3 seconds" },
                { label: "Fee", value: "$0.01" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02]"
                >
                  <p className="text-white/40 text-[10px] sm:text-xs mb-0.5 sm:mb-1 font-medium">{stat.label}</p>
                  <p className="text-white font-bold text-sm sm:text-base">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LargePayments;
