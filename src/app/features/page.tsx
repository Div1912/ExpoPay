"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe, Shield, Cpu, Layers, Share2 } from 'lucide-react';
import Navbar from "@/components/sections/Navbar";
import FooterCTA from "@/components/sections/FooterCTA";

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-purple-400" />
    </div>
    <h3 className="text-xl font-bold mb-3 font-syne text-white">{title}</h3>
    <p className="text-white/60 leading-relaxed">{description}</p>
  </motion.div>
);

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/10 blur-[120px] rounded-full opacity-50" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 mb-6 inline-block">
              Technology Stack
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter font-syne leading-tight">
              The Power Behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                Global Settlement
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12">
              EXPO combines the speed of local payment rails with the security and transparency of the Stellar blockchain.
            </p>
          </motion.div>
        </div>
      </section>

      {/* EXPO Features */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6 font-syne">EXPO: The Payment Router</h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                EXPO acts as an intelligent layer above traditional financial networks, routing payments instantly across borders using a network of liquidity providers and automated market makers.
              </p>
              <ul className="space-y-4">
                {[
                  "Intelligent pathfinding for lowest fees",
                  "Instant currency conversion at mid-market rates",
                  "Unified API for all global payment methods",
                  "Real-time settlement verification"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/10 flex items-center justify-center p-12 overflow-hidden group">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-full h-full border-2 border-dashed border-white/20 rounded-full flex items-center justify-center relative"
                >
                  <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-full" />
                  <Cpu className="w-24 h-24 text-white group-hover:text-purple-400 transition-colors" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ x: [-100, 100], opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-1 h-20 bg-gradient-to-t from-transparent via-purple-500 to-transparent blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap} 
              title="Hyper-Speed" 
              description="Transactions are processed in sub-3 seconds, rivaling the speed of local credit card swipes." 
              delay={0.1}
            />
            <FeatureCard 
              icon={Layers} 
              title="Multi-Asset" 
              description="Settle in USDC, EURC, or native assets. EXPO handles the conversion in the background." 
              delay={0.2}
            />
            <FeatureCard 
              icon={Share2} 
              title="Interoperable" 
              description="Connect your existing banking apps, wallets, or enterprise systems via our simple SDK." 
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stellar Network Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-syne">Built on Stellar Network</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              We chose Stellar for its proven track record in global asset issuance and instant finality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-3xl bg-black border border-white/10 overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="grid grid-cols-4 gap-4 w-full h-full opacity-30 group-hover:opacity-50 transition-opacity">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: Math.random() * 3 + 2, 
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                      className="bg-white/10 rounded-xl"
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Globe className="w-40 h-40 text-blue-400/40" />
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-syne">Global Access</h4>
                  <p className="text-white/60">Connect to over 300,000 cash-in/cash-out points globally through the Stellar Anchor network.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-syne">Iron-Clad Security</h4>
                  <p className="text-white/60">Immutable ledger technology ensures your transactions are secure, verifiable, and transparent.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 font-syne">Eco-Friendly</h4>
                  <p className="text-white/60">Stellar is one of the most sustainable blockchains, consuming minimal energy per transaction.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterCTA />
    </main>
  );
}
