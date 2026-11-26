import Link from "next/link";
import { Bookmark } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { PillArrow, primaryPillClass } from "../shared/pill";

/**
 * Save-your-results prompt. Signing up carries the report over: PersistGuestCheck in
 * the app layout picks it up from localStorage after login.
 */
export function GuestCta() {
  return (
    <BentoCard
      as="section"
      variant="tinted-teal"
      padding="lg"
      aria-labelledby="guest-cta-title"
      className="overflow-hidden print:hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(25_211_174/0.25),transparent)]"
      />
      <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex items-start gap-4">
          <IconChip tone="white" className="hidden sm:inline-flex">
            <Bookmark />
          </IconChip>
          <div>
            <h2 id="guest-cta-title" className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
              Ready to fix these issues?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
              Sign up for free to save this report, generate documents, get AI-powered guidance and
              connect with legal experts.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:flex-col md:items-stretch">
          <Link href="/signup" className={primaryPillClass}>
            <span>Create free account</span>
            <PillArrow />
          </Link>
          <Link
            href="/login"
            className="focus-ring rounded-full px-4 py-2 text-center text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </BentoCard>
  );
}
