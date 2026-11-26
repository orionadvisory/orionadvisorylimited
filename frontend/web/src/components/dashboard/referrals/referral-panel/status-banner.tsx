import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@orion/ui/utils";

/** Inline success (teal) / error (ember) banner shown above the request form. */
export function StatusBanner({ tone, message }: { tone: "success" | "error"; message: string }) {
  if (!message) return null;
  const isError = tone === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-bento-sm border px-4 py-3.5",
        isError ? "border-ember/20 bg-ember-soft" : "border-brand/15 bg-brand-soft"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full bg-white",
          isError ? "text-ember-deep" : "text-brand"
        )}
      >
        <Icon className="size-4" />
      </span>
      <p className={cn("pt-1 text-sm", isError ? "text-ember-deep" : "text-ink")}>{message}</p>
    </div>
  );
}
