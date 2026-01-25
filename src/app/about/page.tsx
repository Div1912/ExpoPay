"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from "@/components/sections/Navbar";
import FooterCTA from "@/components/sections/FooterCTA";

export default function AboutPage() {
  const team = [
    { name: "Divyanshu Singh", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" },
    { name: "Sristi Priya", role: "CTO", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" },
    { name: "Hritik", role: "Head of Growth", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" },
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-8 font-syne tracking-tighter">
              Bridging the gap between <br />
              <span className="text-purple-400">Finance & Future</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed mb-16">
              EXPO was founded with a single mission: to make global payments as easy as sending a text message. We believe that distance shouldn't dictate the speed or cost of value transfer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-3xl overflow-hidden"
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                alt="Our Office" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </motion.div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-syne">Our Vision</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                By leveraging the Stellar blockchain, we've built a system that bypasses the antiquated correspondent banking system. This means fewer middlemen, lower fees, and near-instant settlement.
              </p>
              <p className="text-white/60 text-lg leading-relaxed">
                Today, EXPO serves thousands of businesses and individuals across 50+ countries, moving millions of dollars daily with unparalleled efficiency.
              </p>
            </div>
          </div>

          <div className="mb-32">
            <h2 className="text-4xl font-bold font-syne text-center mb-16 tracking-tighter">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group"
                >
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-bold font-syne">{member.name}</h3>
                  <p className="text-white/50">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FooterCTA />
    </main>
  );
}
