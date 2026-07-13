import { cn } from "@orion/ui/utils";

/**
 * Orion logo mark. The logo art is a light teal/white gradient, so it is
 * rendered on a dark navy "chip" to stay legible on any background.
 */
export function Logo({
  size = 28,
  className,
  rounded = "rounded-lg",
}: {
  size?: number;
  className?: string;
  rounded?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-[#1a1a2e] p-1 shadow-sm",
        rounded,
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/images/logo/orion-new-logo.png"
        alt="Orion"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
