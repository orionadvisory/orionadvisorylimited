import HeroSection from "@/components/marketing/hero-section";
import PartnersMarquee from "@/components/marketing/partners-marquee";
import SocialProofStrip from "@/components/marketing/social-proof-strip";
import PillarsSection from "@/components/marketing/pillars-section";
import JurisdictionsStrip from "@/components/marketing/jurisdictions-strip";
import HowItWorksSection from "@/components/marketing/how-it-works-section";
import WhyOrionSection from "@/components/marketing/why-orion-section";
import PackagesTeaser from "@/components/marketing/packages-teaser";
import CtaSection from "@/components/marketing/cta-section";

// Revalidate so newly added partner logos appear without a redeploy.
export const revalidate = 300;

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <PartnersMarquee />
      <SocialProofStrip />
      <PillarsSection />
      <JurisdictionsStrip />
      <HowItWorksSection />
      <WhyOrionSection />
      <PackagesTeaser />
      <CtaSection />
    </div>
  );
}
