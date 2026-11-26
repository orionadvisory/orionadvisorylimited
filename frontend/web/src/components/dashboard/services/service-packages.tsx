import { Clock, MessageSquare } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { SERVICES } from "@/lib/data/services";
import { PackageCard } from "./package-card";

export default function ServicePackages() {
  return (
    <div className="space-y-8">
      <BentoCard variant="tinted-gold" padding="sm" className="flex items-start gap-3 sm:items-center">
        <IconChip tone="white" size="sm" className="border-transparent text-gold-deep">
          <Clock />
        </IconChip>
        <p className="text-sm font-medium text-gold-deep">
          Coming soon — our service packages are still being finalized. Have a look below; checkout
          isn&apos;t open yet.
        </p>
      </BentoCard>

      <section aria-labelledby="packages-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="packages-title" className="font-display text-3xl leading-tight tracking-tight text-ink">
              Choose a package
            </h2>
            <p className="mt-1 text-sm text-mist">Flat-fee legal services — no hourly surprises</p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:py-3">
          {SERVICES.map((service) => (
            <PackageCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <BentoCard as="section" aria-labelledby="custom-title" padding="lg">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <IconChip tone="teal" size="lg">
              <MessageSquare />
            </IconChip>
            <div className="min-w-0">
              <h3 id="custom-title" className="font-display text-2xl leading-tight tracking-tight text-ink">
                Need something <em className="text-brand">custom?</em>
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-mist">
                Have a specific legal need? Our team can help with ad-hoc legal work, international
                jurisdictions, or complex structures.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="focus-ring inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cloud transition-colors hover:bg-brand"
          >
            <MessageSquare className="size-4" aria-hidden="true" /> Contact Team
          </button>
        </div>
      </BentoCard>
    </div>
  );
}
