import { connection } from "next/server";
import { Logo } from "@orion/ui/components/ui/logo";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { getPublishedAssessment } from "@/lib/api/assessments";
import { OnboardingAssessment } from "@/components/onboarding/onboarding-assessment";

export const metadata = {
  title: "Onboarding — Orion",
  description: "Complete your legal health check to set up your dashboard.",
};

export default async function OnboardingPage() {
  // Per-request render; see health-check/page.tsx.
  await connection();
  const data = await getPublishedAssessment();

  if (!data) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <BentoCard padding="lg" className="max-w-md text-center">
          <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-ink">
            <Logo size={26} />
          </span>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">Almost ready</p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink">Setting things up</h1>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            The assessment is being prepared. Please check back shortly.
          </p>
        </BentoCard>
      </div>
    );
  }

  return (
    <OnboardingAssessment template={data.template} sections={data.sections} questions={data.questions} />
  );
}
