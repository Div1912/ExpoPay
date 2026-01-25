"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowUpRight, Plus, PiggyBank, Users, Repeat, CreditCard, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ArrowUpRight,
    title: "Transfer",
    description: "Send money instantly to anyone, anywhere in the world.",
    color: "#C694F9",
  },
  {
    icon: Plus,
    title: "Request",
    description: "Request payments with a simple shareable link.",
    color: "#F5A7C4",
  },
  {
    icon: PiggyBank,
    title: "Savings",
    description: "Grow your wealth with high-yield DeFi savings.",
    color: "#94A1F9",
  },
  {
    icon: Users,
    title: "Split",
    description: "Split bills effortlessly with your group.",
    color: "#C694F9",
  },
];

export default function QuickActions() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, cardsRef.current, phoneRef.current], {
        opacity: 0,
        y: 80,
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          })
          .to(cardsRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }, "-=0.7")
          .to(phoneRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }, "-=0.8");
        },
        once: true,
      });

      const cards = cardsRef.current?.querySelectorAll('.feature-card');
      if (cards) {
        cards.forEach((card, index) => {
          gsap.fromTo(card,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              delay: index * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none",
              }
            }
          );
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-black overflow-hidden py-20 sm:py-28 md:py-36 lg:py-40"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[50vw] max-w-[600px] aspect-square rounded-full bg-purple-600/10 blur-[150px] md:blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[45vw] max-w-[500px] aspect-square rounded-full bg-blue-600/10 blur-[130px] md:blur-[180px]" />
      </div>

      <div ref={contentRef} className="relative">
        <div className="container mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-20 xl:gap-24">
            
            <div className="w-full lg:w-1/2 lg:sticky lg:top-28">
              <div ref={titleRef} className="mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 sm:mb-6">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#C694F9] shadow-[0_0_10px_#C694F9]" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60">Features</span>
                </div>
                <h2 
                  className="font-black leading-[0.9] tracking-tight mb-4 sm:mb-6 uppercase"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  <span className="block text-white text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[5vw] xl:text-[4.5rem]">Quick</span>
                  <span className="block bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] bg-clip-text text-transparent text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[5vw] xl:text-[4.5rem]">Actions</span>
                </h2>
                <p className="text-white/50 text-sm sm:text-base md:text-lg lg:text-xl font-medium max-w-md leading-relaxed">
                  All major actions are just a tap away. Frictionless payments for the modern age.
                </p>
              </div>

                <div ref={cardsRef} className="space-y-3 sm:space-y-4">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        onClick={() => router.push('/auth/signup')}
                        className="feature-card group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 cursor-pointer overflow-hidden"
                      >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#C694F9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C694F9] to-[#94A1F9] opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative flex items-center gap-4 sm:gap-5">
                        <div 
                          className="w-11 sm:w-12 md:w-14 aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/10 bg-white/[0.03] group-hover:scale-110 group-hover:border-white/20 transition-all duration-500 flex-shrink-0"
                          style={{ boxShadow: `0 0 25px ${feature.color}15` }}
                        >
                          <Icon className="w-5 sm:w-6 h-5 sm:h-6" style={{ color: feature.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-black text-base sm:text-lg mb-0.5 sm:mb-1 uppercase tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>
                            {feature.title}
                          </h3>
                          <p className="text-white/40 text-xs sm:text-sm font-medium leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 flex-shrink-0">
                          <ArrowUpRight className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div 
                ref={phoneRef}
                className="relative w-[240px] sm:w-[280px] md:w-[320px] lg:w-[340px]"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute -inset-12 sm:-inset-16 md:-inset-20 bg-gradient-to-b from-[#C694F9]/20 via-[#F5A7C4]/10 to-transparent rounded-[80px] sm:rounded-[100px] blur-[80px] sm:blur-[100px] opacity-60" />
                
                <div className="relative w-full aspect-[9/19.5] rounded-[36px] sm:rounded-[42px] md:rounded-[48px] overflow-hidden bg-[#050505] border-[5px] sm:border-[6px] md:border-[7px] border-[#151515] shadow-[0_40px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]">
                  <div className="absolute top-2.5 sm:top-3 md:top-3.5 left-1/2 -translate-x-1/2 w-[80px] sm:w-[90px] md:w-[100px] h-[22px] sm:h-[25px] md:h-[28px] bg-black rounded-full z-50" />
                  
                  <div className="relative w-full h-full pt-10 sm:pt-12 md:pt-14 pb-6 sm:pb-8 px-4 sm:px-5 flex flex-col">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                      <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-white">9:41</span>
                      <div className="flex gap-1 items-center">
                        <svg width="16" height="11" viewBox="0 0 17 12" fill="none" className="w-[14px] sm:w-[15px]">
                          <path d="M1 4.5C2.5 2.5 5 1 8.5 1C12 1 14.5 2.5 16 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M3 7C4 5.5 6 4.5 8.5 4.5C11 4.5 13 5.5 14 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                          <circle cx="8.5" cy="10" r="1.5" fill="white"/>
                        </svg>
                        <div className="ml-1 w-[22px] sm:w-[24px] h-[9px] sm:h-[10px] border-[1.5px] border-white/80 rounded-[2px] relative">
                          <div className="absolute inset-[1px] right-[4px] bg-white rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 md:p-6 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] mb-4 sm:mb-5 md:mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 sm:w-28 md:w-32 aspect-square bg-purple-500/20 blur-2xl sm:blur-3xl -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
                      <div className="relative">
                        <p className="text-white/50 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3">Total Balance</p>
                        <div className="flex items-baseline gap-0.5 sm:gap-1 mb-3 sm:mb-4 md:mb-5">
                          <span className="text-white/50 font-black text-base sm:text-lg md:text-xl">$</span>
                          <h3 className="text-[24px] sm:text-[28px] md:text-[32px] font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>12,450.00</h3>
                        </div>
                        <div className="flex gap-1.5 sm:gap-2">
                          <div className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[8px] sm:text-[9px] md:text-[10px] font-black flex items-center gap-0.5 sm:gap-1">
                            <TrendingUp className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                            +2.4%
                          </div>
                          <div className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-[8px] sm:text-[9px] md:text-[10px] font-black">24h</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6 md:mb-8">
                      {[
                        { icon: ArrowUpRight, label: "Send", color: "#C694F9" },
                        { icon: Plus, label: "Add", color: "#F5A7C4" },
                        { icon: Repeat, label: "Swap", color: "#94A1F9" },
                        { icon: CreditCard, label: "Pay", color: "#C694F9" },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div 
                            key={i}
                            className="flex flex-col items-center gap-1.5 sm:gap-2"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div 
                              className="w-10 sm:w-11 md:w-12 aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08]"
                              style={{ boxShadow: `0 0 15px ${item.color}10` }}
                            >
                              <Icon className="w-4 sm:w-4.5 md:w-5 h-4 sm:h-4.5 md:h-5" style={{ color: item.color }} />
                            </div>
                            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-wider text-white/50">{item.label}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="flex-1 space-y-2 sm:space-y-2.5 md:space-y-3 overflow-hidden">
                      <div className="flex justify-between items-center px-0.5 sm:px-1 mb-2 sm:mb-3">
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60">Recent</span>
                        <span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white/30">See all</span>
                      </div>
                      {[
                        { name: "Sarah Miller", amount: "-$45.00", initials: "SM", positive: false },
                        { name: "Apple Store", amount: "-$1,299.00", initials: "AS", positive: false },
                        { name: "Alex Chen", amount: "+$120.00", initials: "AC", positive: true },
                      ].map((tx, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.05]"
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                            <div className="w-8 sm:w-9 md:w-10 aspect-square rounded-full bg-gradient-to-br from-[#C694F9]/20 to-[#94A1F9]/20 flex items-center justify-center text-[8px] sm:text-[9px] md:text-[10px] font-black text-white border border-white/10">
                              {tx.initials}
                            </div>
                            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-white uppercase tracking-tight">{tx.name}</p>
                          </div>
                          <span className={`text-[10px] sm:text-[11px] md:text-[12px] font-black tracking-tight ${tx.positive ? 'text-green-400' : 'text-white/80'}`}>
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
