import { Logo } from "@orion/ui/components/ui/logo";

/** Orion mark on an ink coin (the logo needs a dark surface) + wordmark + page title. */
export function BrandMark({ title }: { title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink">
        <Logo size={22} />
      </span>
      <span className="font-display text-xl leading-none text-ink">Orion</span>
      <span aria-hidden="true" className="hidden h-4 w-px bg-line-strong sm:block" />
      <span className="hidden truncate text-sm font-medium text-ink-soft sm:block">{title}</span>
    </div>
  );
}
