"use client";

import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import QuickActions from "@/components/sections/QuickActions";
import CardsSection from "@/components/sections/CardsSection";
import LargePayments from "@/components/sections/LargePayments";
import Testimonials from "@/components/sections/Testimonials";
import Integrations from "@/components/sections/Integrations";
import FooterCTA from "@/components/sections/FooterCTA";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      <Navbar />
      <Hero />
      <QuickActions />
      <CardsSection />
      <LargePayments />
      <Testimonials />
      <Integrations />
      <FooterCTA />
    </main>
  );
}
