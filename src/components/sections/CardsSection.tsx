"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { color: "from-[#1a1a2e] to-[#16213e]", brand: "VISA", number: "•••• 4532" },
  { color: "from-[#2d132c] to-[#801336]", brand: "Mastercard", number: "•••• 8847" },
  { color: "from-[#1a1a1a] to-[#2d2d2d]", brand: "AMEX", number: "•••• 3782" },
  { color: "from-[#0f3460] to-[#16537e]", brand: "Discover", number: "•••• 6011" },
];

export default function CardsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, cardsContainerRef.current], {
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
          .to(cardsContainerRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }, "-=0.7");
        },
        once: true,
      });

      const cardElements = cardsContainerRef.current?.querySelectorAll('.credit-card');
      
      if (cardElements) {
        cardElements.forEach((card, index) => {
          gsap.set(card, {
            y: index * -12,
            rotate: 0,
            x: 0,
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 40%",
            end: "center center",
            scrub: 1,
          }
        });

        cardElements.forEach((card, index) => {
          const rotation = (index - 1.5) * 15;
          const xOffset = (index - 1.5) * 50;
          const yOffset = Math.abs(index - 1.5) * -30;
          
          tl.to(card, {
            rotate: rotation,
            x: xOffset,
            y: yOffset,
            opacity: 0.5 + (index * 0.12),
            ease: "power2.out",
          }, 0);
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full bg-black py-20 sm:py-28 md:py-40 lg:py-56 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1000px] aspect-square rounded-full bg-gradient-to-br from-[#F5A7C4]/10 to-[#C694F9]/5 blur-[150px] md:blur-[200px]" />
      </div>

      <div ref={contentRef} className="container relative mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16 md:gap-20 lg:gap-28 xl:gap-32">
          
          <div ref={titleRef} className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-5 sm:mb-6 md:mb-8">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#F5A7C4] shadow-[0_0_10px_#F5A7C4]" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/60">Revolution</span>
            </div>
            
            <h2 
              className="font-black leading-[0.9] tracking-tight mb-5 sm:mb-6 md:mb-8"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              <span className="block text-white text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[6vw] xl:text-[5rem]">Say bye</span>
              <span className="block bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] bg-clip-text text-transparent text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[6vw] xl:text-[5rem]">to cards</span>
            </h2>
            
            <p className="text-white/50 text-sm sm:text-base md:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8 md:mb-10 leading-relaxed">
              No more juggling multiple cards. One universal ID replaces them all. Pay anywhere, anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02]"
              >
                <div className="w-10 sm:w-11 md:w-12 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#C694F9]/20 to-[#94A1F9]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C694F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5 md:w-6">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">Bank-grade security</p>
                  <p className="text-white/40 text-xs sm:text-sm">256-bit encryption</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 md:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/[0.08] bg-white/[0.02]"
              >
                <div className="w-10 sm:w-11 md:w-12 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F5A7C4]/20 to-[#C694F9]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A7C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 sm:w-5 md:w-6">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">Instant transfers</p>
                  <p className="text-white/40 text-xs sm:text-sm">No waiting period</p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div ref={cardsContainerRef} className="relative w-[260px] sm:w-[300px] md:w-[320px] h-[360px] sm:h-[400px] md:h-[450px]">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="credit-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[270px] md:w-[300px] h-[145px] sm:h-[160px] md:h-[180px]"
                  style={{ zIndex: cards.length - index }}
                >
                  <div className={`w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br ${card.color} border border-white/10 p-4 sm:p-5 md:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}>
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                    
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-9 sm:w-10 md:w-12 h-6 sm:h-7 md:h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-md" />
                        <span className="text-white/90 font-bold text-xs sm:text-sm md:text-base tracking-wider">{card.brand}</span>
                      </div>
                      
                      <div>
                        <p className="text-white/70 text-base sm:text-lg md:text-xl tracking-[0.25em] sm:tracking-[0.3em] font-mono mb-2 sm:mb-3">
                          {card.number}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white/40 text-[8px] sm:text-[9px] md:text-[10px] uppercase mb-0.5 sm:mb-1">Card Holder</p>
                            <p className="text-white/80 text-xs sm:text-sm font-medium">EXPO USER</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-[8px] sm:text-[9px] md:text-[10px] uppercase mb-0.5 sm:mb-1">Expires</p>
                            <p className="text-white/80 text-xs sm:text-sm font-medium">12/28</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 z-20"
              >
                <div className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] text-black text-xs sm:text-sm font-black uppercase tracking-wide sm:tracking-wider shadow-[0_15px_30px_rgba(198,148,249,0.25)]">
                  Replaced by EXPO ID
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
