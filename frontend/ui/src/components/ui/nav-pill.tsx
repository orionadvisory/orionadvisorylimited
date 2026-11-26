import { cn } from "@orion/ui/utils";

type LinkLike = React.ElementType<{
  href: string;
  className?: string;
  title?: string;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
  children?: React.ReactNode;
}>;

export interface NavPillProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  /** Optional count badge (hidden when 0 / undefined). */
  count?: number;
  /** Icon-only rail mode. */
  collapsed?: boolean;
  onClick?: () => void;
  /** Pass next/link's `Link`. Defaults to `<a>`. */
  linkComponent?: LinkLike;
}

/**
 * Sidebar item for the dark ink rail. The active item becomes a cream pill
 * (Flux-style) and an optional count badge sits on the right.
 */
export function NavPill({
  href,
  label,
  icon: Icon,
  active = false,
  count,
  collapsed = false,
  onClick,
  linkComponent: Comp = "a",
}: NavPillProps) {
  const showCount = typeof count === "number" && count > 0;
  return (
    <Comp
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? (showCount ? `${label} (${count})` : label) : undefined}
      className={cn(
        "focus-ring group relative flex items-center rounded-full text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-aurora",
        collapsed ? "mx-auto h-11 w-11 justify-center" : "h-11 gap-3 pl-2 pr-3",
        active
          ? "bg-canvas text-ink shadow-[0_6px_20px_-8px_rgb(0_0_0/0.5)]"
          : "text-[#c7d0cb] hover:bg-white/[0.07] hover:text-white"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
          active ? "bg-ink text-aurora" : "text-[#8fa19a] group-hover:text-white"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {showCount && (
        <span
          aria-hidden={collapsed ? true : undefined}
          className={cn(
            "flex items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
            collapsed
              ? "absolute -right-0.5 -top-0.5 h-5 min-w-5 bg-aurora px-1 text-ink"
              : "h-6 min-w-6 px-1.5",
            !collapsed && (active ? "bg-ink text-aurora" : "bg-aurora text-ink")
          )}
        >
          {count! > 99 ? "99+" : count}
        </span>
      )}
    </Comp>
  );
}
