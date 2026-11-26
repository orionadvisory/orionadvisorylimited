import { AlertTriangle, ArrowUpRight, Sparkles } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { getTemplate } from "@orion/core/documents/templates";
import type { DocumentTemplate } from "@orion/core/documents/templates";
import type { RecommendedDoc } from "./use-document-generator";

const severityTone: Record<string, "ember" | "gold" | "teal"> = {
  critical: "ember",
  high: "gold",
  medium: "teal",
};

/** The single ink anchor card: templates flagged as missing by the health check. */
export function RecommendedSection({
  recommended,
  onSelect,
}: {
  recommended: RecommendedDoc[];
  onSelect: (template: DocumentTemplate) => void;
}) {
  if (recommended.length === 0) return null;

  return (
    <BentoCard variant="ink" as="section" className="overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-aurora/15 blur-3xl"
      />
      <BentoCardHeader
        onInk
        className="relative"
        icon={
          <IconChip tone="on-ink">
            <Sparkles />
          </IconChip>
        }
        title="Recommended for you"
        description="Flagged as missing in your legal health check — generating them lifts your score."
        action={<Chip tone="on-ink">{recommended.length} missing</Chip>}
      />
      <div className="relative mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {recommended.map((rec) => {
          const template = getTemplate(rec.templateId);
          if (!template) return null;
          return (
            <button
              key={rec.issueId}
              type="button"
              onClick={() => onSelect(template)}
              className="focus-ring group flex min-w-0 items-start gap-3 rounded-bento-sm border border-white/10 bg-white/[0.06] p-4 text-left transition-colors duration-300 hover:border-aurora/40 hover:bg-white/[0.1]"
            >
              <IconChip tone="on-ink" size="sm">
                <AlertTriangle />
              </IconChip>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold text-[#f4efe6]">{template.name}</span>
                  <Chip tone={severityTone[rec.severity] ?? "neutral"} className="capitalize">
                    {rec.severity}
                  </Chip>
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#b9c4bf]">{rec.issueTitle}</span>
              </span>
              <ArrowUpRight
                className="mt-1 size-4 shrink-0 text-[#b9c4bf] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-aurora"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </BentoCard>
  );
}
