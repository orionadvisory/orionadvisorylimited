import { cn } from "@orion/ui/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-canvas text-ink-soft",
    success: "bg-brand-soft text-brand",
    warning: "bg-gold-soft text-gold-deep",
    danger: "bg-ember-soft text-ember-deep",
    info: "bg-[#e3eef0] text-[#145560]",
    outline: "border border-line text-ink-soft bg-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
