import { cn } from "@orion/ui/utils";

/**
 * Orion logo mark (light teal/white gradient on transparent). It needs to sit
 * on a dark surface to read well — the surrounding nav/topbar/header provides
 * that background, so the mark itself is rendered without its own chip.
 */
export function Logo({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/images/logo/orion-new-logo.png"
      alt="Orion"
      style={{ width: size, height: size }}
      className={cn("object-contain", className)}
    />
  );
}
