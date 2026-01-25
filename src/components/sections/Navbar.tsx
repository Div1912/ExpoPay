"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const BrandIcon = () => (
  <div className="relative w-9 h-9">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 rounded-full border-2 border-white/30"
    />
    <motion.div 
      animate={{ rotate: -360 }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      className="absolute inset-1 rounded-full border-t-2 border-l-2 border-white/60"
    />
    <div className="absolute inset-2 rounded-md bg-gradient-to-br from-[#C694F9] via-[#F5A7C4] to-[#94A1F9] shadow-[0_0_20px_rgba(198,148,249,0.7)]" />
  </div>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className={`flex items-center justify-between rounded-full px-6 py-2.5 transition-all duration-500 ${
            scrolled ? 'bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'bg-transparent'
          }`}>
            <Link href="/" className="flex items-center gap-3 group">
              <BrandIcon />
              <span 
                className="text-white font-black text-2xl tracking-tighter group-hover:text-iridescent transition-colors duration-300"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                EXPO
              </span>
            </Link>

            <ul className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[13px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="px-6 h-11 flex items-center justify-center text-[13px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-8 h-11 rounded-full bg-white text-black text-[13px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all flex items-center justify-center shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99] bg-black/98 backdrop-blur-3xl md:hidden flex flex-col items-center justify-center p-12"
          >
            <div className="flex flex-col items-center gap-10 w-full">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black text-white uppercase tracking-tighter"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  {link.name}
                </motion.a>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex flex-col gap-4 w-full pt-10 border-t border-white/10"
              >
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-16 flex items-center justify-center rounded-full border border-white/15 text-white font-black uppercase tracking-widest text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-16 flex items-center justify-center rounded-full bg-white text-black font-black uppercase tracking-widest text-sm"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
