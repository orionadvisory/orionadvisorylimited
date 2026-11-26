/** Shared class names for admin data tables inside a BentoCard. */
export const tableClasses = {
  wrap: "overflow-x-auto",
  table: "min-w-full text-sm",
  thead: "text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-mist",
  th: "px-4 py-3 font-semibold first:pl-0 last:pr-0",
  tbody: "divide-y divide-line",
  td: "px-4 py-3.5 align-top first:pl-0 last:pr-0",
} as const;

export const searchInputClass =
  "w-full rounded-full border border-line bg-canvas px-4 py-2 text-sm text-ink placeholder:text-mist outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20";
