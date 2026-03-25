"use client";

import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import BillingSection from "./BillingSection";
import WhySynetraSection from "./WhySynetraSection";
import PlatformSection from "./PlatformSection";
import TestimonialsSection from "./TestimonialsSection";
import CTASection from "./CTASection";
import Footer from "./Footer";

type LandingHomeProps = {
  signedIn: boolean;
};

export function LandingHome({ signedIn }: LandingHomeProps) {
  const dashboardHref = signedIn ? "/dashboard" : "/login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-[#67e3ff]/12 blur-3xl" />
        <div className="absolute right-[-8%] top-[0%] h-[26rem] w-[26rem] rounded-full bg-[#8a6cff]/16 blur-3xl" />
        <div className="absolute left-[22%] top-[46%] h-[18rem] w-[18rem] rounded-full bg-[#3158ff]/8 blur-3xl" />
      </div>

      <Navbar dashboardHref={dashboardHref} signedIn={signedIn} />
      <div className="relative">
        <HeroSection
          heroImage="/landing-hero-real.png"
          heroWidth={1344}
          heroHeight={768}
          dashboardHref={dashboardHref}
        />
        <FeaturesGrid />
        <BillingSection
          billingImage="/landing-billing-real.png"
          billingWidth={1184}
          billingHeight={864}
        />
        <WhySynetraSection />
        <PlatformSection
          dataImage="/landing-platform-real.png"
          dataWidth={1184}
          dataHeight={864}
        />
        <TestimonialsSection />
        <CTASection dashboardHref={dashboardHref} />
        <Footer />
      </div>
    </main>
  );
}
