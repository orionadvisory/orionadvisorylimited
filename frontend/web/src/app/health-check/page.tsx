import { connection } from "next/server";
import { getPublishedAssessment } from "@/lib/api/assessments";
import { Logo } from "@orion/ui/components/ui/logo";
import { AssessmentFlow } from "@/components/health-check/assessment-flow";

export const metadata = {
  title: "Free Legal Health Check \u2014 Orion",
  description:
    "Find out where your startup stands legally. Free, no signup required. Get a personalised risk assessment in minutes.",
};

export default async function HealthCheckPage() {
  // Render per request (the API response itself is cached for 60s) so a newly
  // published template appears without a redeploy, and builds don't need the API.
  await connection();
  const data = await getPublishedAssessment();

  if (!data) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-orion-canvas px-4 py-10">
        <section className="relative w-full max-w-md overflow-hidden rounded-bento border border-line bg-white p-8 text-center shadow-bento">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-ink">
            <Logo size={28} />
          </span>
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brand">
            Coming shortly
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink">
            Legal Health Check
          </h1>
          <p className="mt-3 text-sm leading-6 text-mist">
            The assessment is being set up. Please check back shortly.
          </p>
        </section>
      </main>
    );
  }

  return (
    <AssessmentFlow
      template={data.template}
      sections={data.sections}
      questions={data.questions}
    />
  );
}
