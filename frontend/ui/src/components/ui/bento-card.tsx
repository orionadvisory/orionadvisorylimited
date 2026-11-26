import { cn } from "@orion/ui/utils";

export type BentoVariant =
  | "surface"
  | "tinted-teal"
  | "tinted-gold"
  | "tinted-ember"
  | "ink";

const variantClasses: Record<BentoVariant, string> = {
  surface: "bg-white text-ink border border-line shadow-bento",
  "tinted-teal": "bg-brand-soft text-ink border border-brand/10",
  "tinted-gold": "bg-gold-soft text-ink border border-gold/15",
  "tinted-ember": "bg-ember-soft text-ink border border-ember/15",
  ink: "bg-ink text-[#f4efe6] border border-white/5 shadow-bento-lift",
};

type BentoElement = "div" | "section" | "article" | "aside" | "li";

export interface BentoCardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: BentoVariant;
  /** Semantic element to render. Defaults to `div`. */
  as?: BentoElement;
  /** Inner padding preset. `none` lets tables/lists run edge-to-edge. */
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4 sm:p-5",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/**
 * The base tile of the Orion bento grid: a softly rounded card on the warm
 * canvas. Use `ink` for the single dark anchor card on a page.
 */
export function BentoCard({
  variant = "surface",
  as: Comp = "div",
  padding = "md",
  className,
  children,
  ...props
}: BentoCardProps) {
  return (
    <Comp
      data-variant={variant}
      className={cn(
        "relative min-w-0 rounded-bento",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export interface BentoCardHeaderProps {
  title: React.ReactNode;
  /** Small muted line under the title. */
  description?: React.ReactNode;
  /** Right-aligned slot — typically an ArrowButton or Chip. */
  action?: React.ReactNode;
  /** Optional round icon chip before the title. */
  icon?: React.ReactNode;
  /** Heading level for document outline. Defaults to h2. */
  level?: "h2" | "h3";
  /** Set when the card uses the `ink` variant so muted text stays readable. */
  onInk?: boolean;
  className?: string;
}

export function BentoCardHeader({
  title,
  description,
  action,
  icon,
  level: Heading = "h2",
  onInk = false,
  className,
}: BentoCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <Heading
            className={cn(
              "truncate text-base font-semibold tracking-tight",
              onInk ? "text-[#f4efe6]" : "text-ink"
            )}
          >
            {title}
          </Heading>
          {description && (
            <p
              className={cn(
                "mt-0.5 text-xs leading-5",
                onInk ? "text-[#b9c4bf]" : "text-mist"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Round icon chip used in list rows and card headers. */
export function IconChip({
  children,
  tone = "white",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  tone?: "white" | "canvas" | "teal" | "gold" | "ember" | "ink" | "on-ink";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones = {
    white: "bg-white text-ink border border-line",
    canvas: "bg-canvas text-ink",
    teal: "bg-brand-soft text-brand",
    gold: "bg-gold-soft text-gold-deep",
    ember: "bg-ember-soft text-ember-deep",
    ink: "bg-ink text-[#f4efe6]",
    "on-ink": "bg-white/10 text-[#f4efe6]",
  };
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4",
        tones[tone],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
