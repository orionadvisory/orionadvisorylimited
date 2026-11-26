import { ArrowUpRight, Briefcase, Building2, FileText, Handshake, Lightbulb, PieChart, ShieldCheck } from "lucide-react";
import { IconChip } from "@orion/ui/components/ui/bento-card";
import { templates } from "@orion/core/documents/templates";
import type { DocumentTemplate } from "@orion/core/documents/templates";
import { RecommendedSection } from "./recommended-section";
import type { RecommendedDoc } from "./use-document-generator";

const categoryMeta: Record<string, { label: string; icon: React.ElementType; tone: "teal" | "gold" | "ember" | "canvas" }> = {
  contracts: { label: "Contracts", icon: Handshake, tone: "teal" },
  incorporation: { label: "Incorporation", icon: Building2, tone: "gold" },
  equity: { label: "Equity", icon: PieChart, tone: "ember" },
  employment: { label: "Employment", icon: Briefcase, tone: "teal" },
  ip: { label: "Intellectual Property", icon: Lightbulb, tone: "gold" },
  data_privacy: { label: "Data & Privacy", icon: ShieldCheck, tone: "ember" },
};

export function categoryFor(category: string) {
  return categoryMeta[category] ?? { label: category, icon: FileText, tone: "canvas" as const };
}

function TemplateTile({ template, onSelect }: { template: DocumentTemplate; onSelect: () => void }) {
  const meta = categoryFor(template.category);
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="focus-ring group flex h-full min-w-0 flex-col rounded-bento-sm border border-line bg-white p-4 text-left shadow-bento transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-bento-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <IconChip tone={meta.tone}>
          <Icon />
        </IconChip>
        <span className="grid size-8 place-items-center rounded-full border border-line text-mist transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-cloud">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <h4 className="mt-4 text-[0.95rem] font-semibold leading-snug text-ink">{template.name}</h4>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mist">{template.description}</p>
      <p className="mt-auto pt-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-mist/80">
        {template.fields.length} fields · {template.type}
      </p>
    </button>
  );
}

/** Template gallery: recommended (ink anchor) first, then bento tiles grouped by category. */
export function TemplateGallery({
  onSelect,
  recommended,
}: {
  onSelect: (template: DocumentTemplate) => void;
  recommended: RecommendedDoc[];
}) {
  const recommendedIds = new Set(recommended.map((r) => r.templateId));
  const otherTemplates = templates.filter((t) => !recommendedIds.has(t.id));

  // Group by category
  const grouped: Record<string, DocumentTemplate[]> = {};
  for (const t of otherTemplates) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  }

  return (
    <div className="space-y-8">
      <RecommendedSection recommended={recommended} onSelect={onSelect} />

      {Object.entries(grouped).map(([category, categoryTemplates]) => (
        <section key={category} aria-labelledby={`cat-${category}`}>
          <div className="mb-3 flex items-center gap-3">
            <h3 id={`cat-${category}`} className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
              {categoryFor(category).label}
            </h3>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="font-mono text-[0.65rem] text-mist">{categoryTemplates.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categoryTemplates.map((t) => (
              <TemplateTile key={t.id} template={t} onSelect={() => onSelect(t)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
