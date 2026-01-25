"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Phone, ExternalLink } from 'lucide-react';
import Navbar from "@/components/sections/Navbar";
import FooterCTA from "@/components/sections/FooterCTA";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function SupportPage() {
  const faqs = [
    {
      question: "How fast are the transactions?",
      answer: "Transactions on EXPO are settled within 3-5 seconds thanks to the Stellar consensus protocol. This includes currency conversion and pathfinding."
    },
    {
      question: "What are the fees?",
      answer: "We charge a flat 0.1% fee on all cross-border transactions. There are no hidden exchange rate markups or monthly maintenance fees."
    },
    {
      question: "Is EXPO available in my country?",
      answer: "EXPO is currently available in over 50 countries across North America, Europe, and parts of Asia and Africa. We are constantly expanding our anchor network."
    },
    {
      question: "How do I connect my bank account?",
      answer: "You can connect your bank account via our secure partner portal. We use industry-standard encryption to ensure your financial data remains private."
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-black mb-8 font-syne tracking-tighter">
              How can we <br />
              <span className="text-purple-400">help you?</span>
            </h1>
            <p className="text-xl text-white/60">
              Our support team is available 24/7 to help you with any questions or technical issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { icon: MessageSquare, title: "Live Chat", desc: "Average response time: 2 mins", action: "Start Chat" },
              { icon: Mail, title: "Email Support", desc: "support@expo.finance", action: "Send Email" },
              { icon: Phone, title: "Phone Support", desc: "Available for Pro users", action: "View Numbers" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-center group hover:border-purple-500/50 transition-all"
              >
                <item.icon className="w-10 h-10 text-purple-400 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2 font-syne">{item.title}</h3>
                <p className="text-white/50 mb-6">{item.desc}</p>
                <button className="text-sm font-bold uppercase tracking-widest text-white border-b border-white/20 pb-1 hover:border-purple-400 transition-colors">
                  {item.action}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mb-32">
            <h2 className="text-3xl font-bold font-syne mb-12 text-center tracking-tighter">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-2xl px-6 bg-white/[0.02]">
                  <AccordionTrigger className="text-lg font-bold font-syne py-6 hover:no-underline hover:text-purple-400 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 text-base pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="p-12 rounded-[40px] bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold font-syne mb-4 tracking-tighter">Need a custom solution?</h2>
                <p className="text-white/60 mb-8">Our enterprise team can help you build custom payment flows and integrate EXPO into your existing infrastructure.</p>
                <button className="px-8 h-14 rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                  Contact Sales <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full md:w-1/2 aspect-video rounded-3xl bg-black/40 border border-white/5 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex -space-x-4 mb-6 justify-center">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-white/10 overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Our experts are online</p>
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
