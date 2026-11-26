import { Handshake, ListChecks, MessageSquare, Users } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";

const steps = [
  {
    icon: ListChecks,
    title: "Pick an issue",
    body: "Choose a flagged risk from your health check and add any context.",
  },
  {
    icon: Users,
    title: "Get matched",
    body: "We pair you with a vetted lawyer who knows your jurisdiction and stage.",
  },
  {
    icon: MessageSquare,
    title: "Resolve it",
    body: "Your expert reviews, advises and leaves notes right here.",
  },
];

/** The page's single dark anchor: a three-step explainer. */
export function HowItWorksCard({ className }: { className?: string }) {
  return (
    <BentoCard as="section" variant="ink" aria-labelledby="how-it-works-title" className={className}>
      <div className="flex items-center gap-3">
        <IconChip tone="on-ink">
          <Handshake />
        </IconChip>
        <div>
          <h2 id="how-it-works-title" className="text-base font-semibold tracking-tight text-[#f4efe6]">
            How it works
          </h2>
          <p className="text-xs text-[#b9c4bf]">From flagged risk to resolved, in three steps</p>
        </div>
      </div>
      <ol className="mt-6 space-y-5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-4">
              <span className="font-display text-4xl leading-none tracking-tight text-[#7f918a] tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 border-t border-white/[0.08] pt-2">
                <p className="flex items-center gap-2 text-sm font-medium text-[#f4efe6]">
                  <Icon className="size-3.5 text-aurora" aria-hidden="true" />
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#b9c4bf]">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </BentoCard>
  );
}
