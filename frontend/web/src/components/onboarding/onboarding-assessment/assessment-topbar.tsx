import { Progress } from "@orion/ui/components/ui/progress";
import { BrandMark } from "../parts/brand-mark";

interface AssessmentTopbarProps {
  title: string;
  /** Right-aligned slot (draft status, save & exit). */
  actions?: React.ReactNode;
  /** Progress bar + mono status line, e.g. "Section 2 of 7 · 9 of 31 answered". */
  progress?: { percent: number; status: string };
}

/** Sticky frosted bar: brand + title, thin teal progress and a mono status line. */
export function AssessmentTopbar({ title, actions, progress }: AssessmentTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <BrandMark title={title} />
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {progress && (
          <>
            <Progress value={progress.percent} label="Assessment progress" className="mt-3 h-1 bg-line/70" />
            <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
              <p className="truncate">{progress.status}</p>
              <p className="tabular-nums text-ink-soft">{Math.round(progress.percent)}%</p>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
