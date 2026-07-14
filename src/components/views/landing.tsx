"use client";

import { HeroSection } from "@/components/landing/hero";
import { MarqueeSection } from "@/components/landing/marquee";
import { StatsBar } from "@/components/landing/stats-bar";
import { PillarsSection } from "@/components/landing/pillars";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { FeaturedEbooksSection } from "@/components/landing/featured-ebooks";
import { CreatorSitesSection } from "@/components/landing/creator-sites";
import { WalletSection } from "@/components/landing/wallet";
import { PricingSection } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";

export function LandingPage() {
  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden bg-background">
      <HeroSection />
      <MarqueeSection />
      <StatsBar />
      <PillarsSection />
      <HowItWorksSection />
      <FeaturedEbooksSection />
      <CreatorSitesSection />
      <WalletSection />
      <PricingSection />
      <FinalCTA />
    </div>
  );
}
