"use client";

import { Check } from "lucide-react";
import { cn } from "@orion/ui/utils";

const tileBase =
  "group focus-ring flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm leading-snug transition-all duration-200";
const tileIdle = "border-line bg-white text-ink-soft hover:border-line-strong hover:shadow-bento";
const tileSelected = "border-brand bg-brand-soft font-medium text-ink ring-2 ring-brand/20";

/** Two columns only when every choice is short enough to sit side by side. */
function gridClass(choices: string[]) {
  const twoUp = choices.length >= 4 && choices.every((c) => c.length <= 36);
  return cn("grid gap-2.5", twoUp && "sm:grid-cols-2");
}

export function SingleChoiceTiles({
  label,
  choices,
  value,
  onSelect,
}: {
  label: string;
  choices: string[];
  value: string | string[] | undefined;
  onSelect: (choice: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={gridClass(choices)}>
      {choices.map((choice) => {
        const selected = value === choice;
        return (
          <button
            key={choice}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(choice)}
            className={cn(tileBase, selected ? tileSelected : tileIdle)}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                selected ? "border-brand bg-brand" : "border-line-strong bg-white group-hover:border-mist"
              )}
            >
              {selected && <span className="size-2 rounded-full bg-white" />}
            </span>
            <span className="min-w-0">{choice}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MultiChoiceTiles({
  label,
  choices,
  value,
  onToggle,
}: {
  label: string;
  choices: string[];
  value: string[];
  onToggle: (choice: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className={gridClass(choices)}>
      {choices.map((choice) => {
        const selected = value.includes(choice);
        return (
          <button
            key={choice}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => onToggle(choice)}
            className={cn(tileBase, selected ? tileSelected : tileIdle)}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
                selected ? "border-brand bg-brand text-white" : "border-line-strong bg-white group-hover:border-mist"
              )}
            >
              {selected && <Check className="size-3.5" strokeWidth={3} />}
            </span>
            <span className="min-w-0">{choice}</span>
          </button>
        );
      })}
    </div>
  );
}
