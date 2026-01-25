"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const words = ["ROUTER", "RESOLVER", "SETTLER"];

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTime, setCurrentTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const word = words[currentWordIndex];
    const typingSpeed = isDeleting ? 60 : 120;
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(word.slice(0, displayedText.length + 1));
        if (displayedText.length === word.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayedText(word.slice(0, displayedText.length - 1));
        if (displayedText.length === 0) {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, phoneRef.current, subtitleRef.current], {
        opacity: 0,
        y: 60,
      });

      const tl = gsap.timeline({ delay: 0.2 });
      
      tl.to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power4.out",
      })
      .to(phoneRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power4.out",
      }, "-=0.9")
      .to(subtitleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      }, "-=0.8");

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        pin: contentRef.current,
        pinSpacing: false,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.set(contentRef.current, {
            opacity: 1 - progress * 1.5,
            scale: 1 - progress * 0.1,
            y: progress * -100,
          });
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative h-[200vh] bg-black overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40vw] max-w-[500px] aspect-square rounded-full bg-[#C694F9]/20 blur-[100px] md:blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[35vw] max-w-[400px] aspect-square rounded-full bg-[#94A1F9]/15 blur-[80px] md:blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[800px] aspect-square rounded-full bg-gradient-to-br from-[#C694F9]/10 to-[#94A1F9]/10 blur-[120px] md:blur-[200px]" />
      </div>
      
      <div 
        ref={contentRef}
        className="h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 relative"
      >
        <div 
          ref={titleRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-10 pointer-events-none"
        >
          <h1 
            className="font-black uppercase"
            style={{ 
              fontFamily: 'var(--font-syne)',
              lineHeight: '0.9',
              letterSpacing: '-0.03em',
            }}
          >
            <span 
              className="block text-white/[0.07] text-[15vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw]"
              style={{ maxWidth: '100%' }}
            >
              Global
            </span>
            <span 
              className="block text-white/[0.07] text-[15vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw]"
              style={{ maxWidth: '100%' }}
            >
              Payment
            </span>
            <span 
              className="block text-white/[0.05] text-[15vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw]"
              style={{ minHeight: '1.1em', maxWidth: '100%' }}
            >
              {displayedText}
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[3px] sm:w-[4px] h-[0.75em] bg-white/10 align-middle ml-1 sm:ml-2"
              />
            </span>
          </h1>
        </div>

        <div 
          ref={phoneRef}
          className="relative z-30 w-[220px] sm:w-[260px] md:w-[300px] lg:w-[340px]"
        >
          <div className="absolute -inset-8 sm:-inset-12 bg-gradient-to-b from-[#C694F9]/30 via-[#F5A7C4]/20 to-transparent rounded-[60px] sm:rounded-[80px] blur-2xl sm:blur-3xl" />
          
          <div className="relative w-full aspect-[9/19.5] rounded-[36px] sm:rounded-[44px] md:rounded-[52px] overflow-hidden bg-[#0A0A0A] border-[5px] sm:border-[6px] md:border-[7px] border-[#1a1a1a] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="absolute top-2.5 sm:top-3 md:top-4 left-1/2 -translate-x-1/2 w-[80px] sm:w-[95px] md:w-[110px] h-[22px] sm:h-[26px] md:h-[30px] bg-black rounded-full z-50" />
            
            <div className="relative w-full h-full flex flex-col pt-10 sm:pt-12 md:pt-14">
              <div className="flex justify-between items-center px-4 sm:px-5 md:px-7 py-1.5 sm:py-2">
                <span className="text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-white tabular-nums">{currentTime}</span>
                <div className="flex gap-1 sm:gap-1.5 items-center">
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" className="w-[14px] sm:w-[15px] md:w-[17px]">
                    <path d="M1 4.5C2.5 2.5 5 1 8.5 1C12 1 14.5 2.5 16 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M3 7C4 5.5 6 4.5 8.5 4.5C11 4.5 13 5.5 14 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M5.5 9.5C6.25 8.75 7.25 8 8.5 8C9.75 8 10.75 8.75 11.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8.5" cy="11" r="1" fill="white"/>
                  </svg>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="w-[13px] sm:w-[14px] md:w-[16px] ml-0.5">
                    <rect x="1" y="3" width="2" height="8" rx="0.5" fill="white" fillOpacity="0.4"/>
                    <rect x="4.5" y="2" width="2" height="9" rx="0.5" fill="white" fillOpacity="0.6"/>
                    <rect x="8" y="1" width="2" height="10" rx="0.5" fill="white" fillOpacity="0.8"/>
                    <rect x="11.5" y="0" width="2" height="11" rx="0.5" fill="white"/>
                  </svg>
                  <div className="ml-1 sm:ml-1.5 flex items-center">
                    <div className="w-[22px] sm:w-[25px] md:w-[28px] h-[10px] sm:h-[11px] md:h-[12px] border-[1.5px] border-white/90 rounded-[3px] relative">
                      <div className="absolute inset-[1.5px] right-[4px] sm:right-[5px] bg-white rounded-[1.5px]" />
                    </div>
                    <div className="w-[1.5px] h-[4px] bg-white/90 rounded-r-full ml-[0.5px]" />
                  </div>
                </div>
              </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center">
                    <div className="w-[80px] sm:w-[100px] md:w-[120px] aspect-square relative mb-6 sm:mb-8 md:mb-10">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-[3px] sm:border-4 border-white/30"
                      />
                      <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[10%] rounded-full border-t-[3px] sm:border-t-4 border-l-[3px] sm:border-l-4 border-white/60"
                      />
                        <div className="absolute inset-[20%] rounded-full bg-gradient-to-br from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] shadow-[0_0_40px_rgba(198,148,249,0.7)]" />
                    </div>

                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg md:text-xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-syne)' }}>EXPO</span>
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-black leading-[0.95] tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-syne)' }}>
                      Global<br />Payment<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C694F9] via-[#F5A7C4] to-[#94A1F9]">
                        {displayedText}
                        <motion.span 
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-[2px] sm:w-[3px] h-[0.8em] bg-gradient-to-b from-[#C694F9] to-[#94A1F9] align-middle ml-0.5"
                        />
                      </span>
                    </h2>
                    <p className="text-white/40 text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase">Powered by Stellar</p>
                  </div>
                </div>

              <div className="p-4 sm:p-5 md:p-7 pb-8 sm:pb-10 md:pb-12">
                <Link 
                  href="/auth/signup" 
                  className="w-full h-[44px] sm:h-[50px] md:h-[56px] rounded-full bg-white text-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_15px_30px_rgba(255,255,255,0.12)]"
                >
                  GET STARTED
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 sm:w-4 md:w-[18px]">
                    <path d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={subtitleRef}
          className="absolute bottom-[10%] sm:bottom-[12%] left-1/2 -translate-x-1/2 text-center px-4 z-20 w-full max-w-md"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-4 sm:mb-5">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-white/70 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.12em] sm:tracking-[0.15em] uppercase">Live on Mainnet</span>
          </div>
          <p className="text-white/40 text-xs sm:text-sm md:text-base font-medium max-w-[320px] sm:max-w-md mx-auto leading-relaxed">
            One Universal ID. Send money anywhere.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>Zero complexity. Infinite scale.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
