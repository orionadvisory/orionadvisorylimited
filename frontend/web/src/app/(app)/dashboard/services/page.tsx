import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import ServicePackages from "@/components/dashboard/services/service-packages";

export default function ServicesPage() {
  return (
    <div>
      <Topbar title="Services" subtitle="Work with our legal team" />
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <PageHero
          kicker="Workspace · Services"
          title={
            <>
              Work with our <em>legal team</em>
            </>
          }
          description="Flat-fee packages for every stage — from incorporation to your raise and beyond."
        />
        <ServicePackages />
      </div>
    </div>
  );
}
