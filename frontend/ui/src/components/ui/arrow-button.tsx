import { cn } from "@orion/ui/utils";

type LinkLike = React.ElementType<{
  href: string;
  className?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
}>;

export interface ArrowButtonProps {
  href: string;
  /** Accessible name — required because the button is icon-only. */
  label: string;
  /** Pass next/link's `Link` for client-side navigation. Defaults to `<a>`. */
  linkComponent?: LinkLike;
  tone?: "light" | "dark" | "brand";
  size?: "sm" | "md";
  className?: string;
}

const tones = {
  light: "bg-white text-ink border border-line hover:bg-ink hover:text-white hover:border-ink",
  dark: "bg-ink text-white hover:bg-brand",
  brand: "bg-white/10 text-[#f4efe6] hover:bg-aurora hover:text-ink",
};

/** The ↗ circle link used in the corner of bento cards. */
export function ArrowButton({
  href,
  label,
  linkComponent: Comp = "a",
  tone = "light",
  size = "md",
  className,
}: ArrowButtonProps) {
    return (
      <Comp
        href={href}
        aria-label={label}
        className={cn(
          "focus-ring inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200",
          size === "md" ? "h-11 w-11" : "h-9 w-9",
          tones[tone],
          className
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={size === "md" ? "h-[18px] w-[18px]" : "h-4 w-4"}
        >
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      </Comp>
    );
}
