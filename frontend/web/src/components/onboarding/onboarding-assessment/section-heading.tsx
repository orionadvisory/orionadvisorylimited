/** Serif section title with its description as a quiet left-bordered note. */
export function SectionHeading({
  index,
  total,
  title,
  description,
}: {
  index: number;
  total: number;
  title: string;
  description: string | null;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <header className="mb-8">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">
        Section {pad(index + 1)} <span className="text-mist">/ {pad(total)}</span>
      </p>
      <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink text-balance sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl border-l-2 border-brand/40 pl-4 text-sm leading-relaxed text-mist">
          {description}
        </p>
      )}
    </header>
  );
}
