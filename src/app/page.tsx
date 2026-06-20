"use client";

import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import QuickActions from "@/components/sections/QuickActions";
import CardsSection from "@/components/sections/CardsSection";
import LargePayments from "@/components/sections/LargePayments";
import Testimonials from "@/components/sections/Testimonials";
import Integrations from "@/components/sections/Integrations";
import FooterCTA from "@/components/sections/FooterCTA";
import { BeamsBackground } from "@/components/ui/beams-background";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen text-white selection:bg-purple-500/30 overflow-x-hidden">
      <BeamsBackground className="bg-transparent">
        <Navbar />
        <Hero />
        <QuickActions />
        <CardsSection />
        <LargePayments />
        <Testimonials />
        <Integrations />
        <FooterCTA />
      </BeamsBackground>
    </main>
  );
}
