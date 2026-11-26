import { cn } from "@orion/ui/utils";

interface PageHeroProps {
  /** Small mono kicker above the title, e.g. "Workspace · Documents". */
  kicker?: string;
  /** Serif display title. Wrap a word in <em> for the italic accent. */
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Chips or buttons under the description. */
  actions?: React.ReactNode;
  /** Right-hand slot on wide screens: headline numerals, a CTA… */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * The "Orion bento" page opener shared by every dashboard sub-page: serif display
 * title on the warm canvas, matching the overview's "Welcome back" header.
 */
export function PageHero({ kicker, title, description, actions, aside, className }: PageHeroProps) {
  return (
    <section className={cn("grid gap-6 xl:grid-cols-12 xl:items-end", className)}>
      <div className="min-w-0 xl:col-span-8">
        {kicker && (
          <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-brand">{kicker}</p>
        )}
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl [&_em]:text-brand">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-pretty text-mist">{description}</p>}
        {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {aside && <div className="min-w-0 xl:col-span-4 xl:justify-self-end">{aside}</div>}
    </section>
  );
}
