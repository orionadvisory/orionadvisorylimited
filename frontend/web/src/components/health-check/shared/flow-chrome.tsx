import { Logo } from "@orion/ui/components/ui/logo";
import { Progress } from "@orion/ui/components/ui/progress";
import { cn } from "@orion/ui/utils";

/** The Orion mark in its ink chip, so the light logo reads on the warm canvas. */
export function LogoChip({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-ink", className)}>
      <Logo size={22} />
    </span>
  );
}

interface FlowTopBarProps {
  title: string;
  /** 0–100. Omit to hide the progress bar. */
  progress?: number;
  /** Mono status line under the bar, e.g. "Section 2 of 6 · 9 of 24 answered". */
  meta?: React.ReactNode;
  /** Right-aligned slot (chip or actions). */
  aside?: React.ReactNode;
  /** Tailwind max-width class for the inner container. */
  width?: string;
  className?: string;
}

/** Sticky frosted bar shared by the public health check screens. */
export function FlowTopBar({
  title,
  progress,
  meta,
  aside,
  width = "max-w-5xl",
  className,
}: FlowTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-line/70 bg-canvas/80 backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/65",
        className
      )}
    >
      <div className={cn("mx-auto px-4 py-3 sm:px-6", width)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <LogoChip />
            <p className="truncate text-sm font-semibold tracking-tight text-ink">{title}</p>
          </div>
          {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
        </div>
        {progress !== undefined && (
          <Progress
            value={progress}
            label={`${title} progress`}
            className="mt-3 h-1 bg-line/70"
            indicatorClassName="bg-brand"
          />
        )}
        {meta && (
          <p className="mt-2 flex items-center justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist">
            {meta}
          </p>
        )}
      </div>
    </header>
  );
}

/** Frosted fixed footer that holds the Back / Next pills. */
export function FlowFooter({
  children,
  width = "max-w-5xl",
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line/70 bg-canvas/80 backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/65">
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6",
          width
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Serif section title with its description as a quiet left-bordered note. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      {eyebrow && (
        <p className="mb-3 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brand">
          {icon}
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl leading-[1.02] tracking-tight text-balance text-ink sm:text-5xl">
        {title}
      </h1>
      {description && (
        <div className="mt-4 max-w-2xl border-l-2 border-brand/30 pl-4">
          <p className="text-sm leading-6 text-mist">{description}</p>
        </div>
      )}
    </div>
  );
}

/** Error note — shows API messages verbatim (e.g. the health-check rate-limit text). */
export function FlowError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={cn(
        "rounded-2xl border border-ember/20 bg-ember-soft px-4 py-3 text-sm text-ember-deep",
        className
      )}
    >
      {message}
    </p>
  );
}
