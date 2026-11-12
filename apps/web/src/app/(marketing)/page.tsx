import { Hero } from "@/components/marketing/hero";
import { ReportPreview } from "@/components/marketing/report-preview";
import PartnersMarquee from "@/components/marketing/partners-marquee";
import { Manifesto } from "@/components/marketing/manifesto";
import { StatsBand } from "@/components/marketing/stats-band";
import { Pillars } from "@/components/marketing/pillars";
import { Jurisdictions } from "@/components/marketing/jurisdictions";
import { Process } from "@/components/marketing/process";
import { Copilot } from "@/components/marketing/copilot";
import { PackagesSection } from "@/components/marketing/packages";
import { FinalCta } from "@/components/marketing/final-cta";

// Revalidate so newly added partner logos appear without a redeploy.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReportPreview />
      <PartnersMarquee />
      <Manifesto />
      <StatsBand />
      <Pillars />
      <Jurisdictions />
      <Process />
      <Copilot />
      <PackagesSection />
      <FinalCta />
    </>
  );
}
