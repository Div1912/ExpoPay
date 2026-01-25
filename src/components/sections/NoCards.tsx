"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const NoCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 1], [0.8, 1, 0.9]);

  const leftRotate = useTransform(scrollYProgress, [0, 0.5], [-35, -25]);
  const leftX = useTransform(scrollYProgress, [0, 0.5], [-40, -60]);
  const leftY = useTransform(scrollYProgress, [0, 0.5], [20, 10]);
  
  const rightRotate = useTransform(scrollYProgress, [0, 0.5], [35, 25]);
  const rightX = useTransform(scrollYProgress, [0, 0.5], [40, 60]);
  const rightY = useTransform(scrollYProgress, [0, 0.5], [20, 10]);

  const centerScale = useTransform(scrollYProgress, [0.3, 0.6], [1, 1.1]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[140vh] flex flex-col items-center justify-center overflow-hidden bg-black py-40"
    >
      <motion.div 
        style={{ opacity, scale }}
        className="sticky top-1/4 flex flex-col items-center w-full max-w-[1200px] z-10"
      >
        <div className="text-center mb-16 select-none pointer-events-none">
          <h2 className="text-white text-[80px] md:text-[120px] lg:text-[140px] font-bold leading-[1.05] tracking-[-0.05em] flex flex-col items-center">
            <span>Say</span>
            <span>bye</span>
            <span className="text-iridescent">to cards</span>
          </h2>
        </div>

        <div className="relative w-full max-w-[600px] h-[400px] flex items-center justify-center">
          
          <motion.div 
            style={{ 
              rotate: leftRotate,
              x: leftX,
              y: leftY,
              zIndex: 1
            }}
            className="absolute rounded-[24px] overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="w-[280px] h-[440px] bg-[#0A0A0A] relative flex flex-col justify-between p-8">
              <div className="flex justify-between items-start">
                <div className="text-white/40 text-[10px] uppercase tracking-widest leading-none">EXPO</div>
                <div className="w-8 h-5 bg-white/5 rounded-sm"></div>
              </div>
              <div className="rotate-90 origin-left translate-x-12 -translate-y-8">
                <p className="text-white/80 text-lg font-medium tracking-wider">3455 4562 7710 3507</p>
                <div className="mt-4 flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-white/30 text-[8px] uppercase">Card holder name</span>
                    <span className="text-white/60 text-[10px]">John Doe</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/30 text-[8px] uppercase">Expiry date</span>
                    <span className="text-white/60 text-[10px]">02/30</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="w-10 h-10 bg-white/5 rounded-full blur-[1px]"></div>
                <div className="w-8 h-8 rounded-full border border-white/20"></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={{ 
              rotate: rightRotate,
              x: rightX,
              y: rightY,
              zIndex: 1
            }}
            className="absolute rounded-[24px] overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="w-[280px] h-[440px] bg-[#0F0F0F] relative flex flex-col justify-between p-8">
              <div className="flex justify-between items-start">
                <div className="text-white/40 text-[10px] uppercase tracking-widest leading-none">EXPO</div>
                <div className="w-8 h-5 bg-white/10 rounded-sm"></div>
              </div>
              <div className="rotate-90 origin-left translate-x-12 -translate-y-8">
                <p className="text-white/80 text-lg font-medium tracking-wider">3455 4562 7710 3507</p>
                <div className="mt-4 flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-white/30 text-[8px] uppercase">Card holder name</span>
                    <span className="text-white/60 text-[10px]">John Doe</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/30 text-[8px] uppercase">Expiry date</span>
                    <span className="text-white/60 text-[10px]">02/30</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-end">
                 <div className="w-10 h-10 bg-white/5 rounded-full"></div>
                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={{ 
              scale: centerScale,
              zIndex: 10 
            }}
            className="absolute rounded-[24px] overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            <div className="w-[300px] h-[470px] bg-gradient-to-br from-[#1A1A1A] to-[#010101] relative flex flex-col justify-between p-10 overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold tracking-[0.2em] uppercase">EXPO</span>
                </div>
                <div className="w-10 h-8 bg-gradient-to-br from-white/20 to-white/5 rounded-md border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-[1px] w-full h-full p-1 opacity-50">
                    <div className="border border-white/20"></div>
                    <div className="border border-white/20"></div>
                    <div className="border border-white/20"></div>
                    <div className="border border-white/20"></div>
                  </div>
                </div>
              </div>

              <div className="rotate-90 origin-left translate-x-12 -translate-y-4 relative z-10">
                <p className="text-white text-2xl font-semibold tracking-[0.05em] whitespace-nowrap">3455 4562 7710 3507</p>
                <div className="mt-6 flex gap-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 text-[9px] uppercase font-medium tracking-tight">Card holder name</span>
                    <span className="text-white text-[11px] font-semibold">John Doe</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-white/40 text-[9px] uppercase font-medium tracking-tight">Expiry date</span>
                    <span className="text-white text-[11px] font-semibold">02/30</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end relative z-10">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <div className="w-6 h-6 border border-white/20 rounded-full"></div>
                  </div>
                </div>
                <div className="flex -space-x-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"></div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-br from-white/5 to-transparent pointer-events-none -skew-y-12 transform translate-x-1/4"></div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default NoCards;
