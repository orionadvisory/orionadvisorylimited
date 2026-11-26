import type { ObligationDto } from "@orion/contracts";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { CompleteObligationButton } from "./complete-obligation-button";

const STATUS_LABELS: Record<ObligationDto["status"], string> = {
  needs_confirmation: "Needs confirmation",
  upcoming: "Upcoming",
  in_progress: "In progress",
  awaiting_documents: "Awaiting documents",
  ready_for_filing: "Ready for filing",
  submitted: "Submitted",
  completed: "Completed",
  overdue: "Overdue",
  not_applicable: "Not applicable",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

function statusTone(item: ObligationDto) {
  if (item.status === "overdue") return "ember" as const;
  if (item.status === "completed") return "teal" as const;
  return item.dateStatus === "pending_confirmation" ? ("gold" as const) : ("teal" as const);
}

export function ObligationRow({ item, canProgress }: { item: ObligationDto; canProgress: boolean }) {
  const completed = item.status === "completed";
  const confirmed = item.dateStatus === "confirmed";

  return (
    <article className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6">
      <IconChip tone={completed ? "teal" : confirmed ? "canvas" : "gold"}>
        {completed ? <CheckCircle2 /> : confirmed ? <Clock3 /> : <AlertCircle />}
      </IconChip>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-ink">{item.title}</h2>
          <Chip tone={statusTone(item)}>{STATUS_LABELS[item.status]}</Chip>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {item.entityName}
          {item.regulator ? ` · ${item.regulator}` : ""}
        </p>
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-mist">
          {item.dueAt ? dateFormat.format(new Date(item.dueAt)) : "Date pending confirmation"} · {item.category.replaceAll("_", " ")}
        </p>
        {item.explanation && <p className="mt-2 max-w-2xl text-xs leading-5 text-mist">{item.explanation}</p>}
      </div>
      {completed ? (
        <span className="text-xs text-mist">Completed</span>
      ) : canProgress ? (
        <CompleteObligationButton id={item.id} />
      ) : null}
    </article>
  );
}
