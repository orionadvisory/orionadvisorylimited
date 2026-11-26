import Link from "next/link";

/** The form half of the auth screen. */
export function AuthPanel({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  footer: { text: string; href: string; cta: string };
}) {
  return (
    <main className="flex flex-col px-3 pb-6 pt-10 sm:px-8 lg:min-h-[calc(100svh-1.5rem)] lg:justify-center lg:px-12 lg:py-10">
      <div className="mx-auto w-full max-w-[26rem]">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-brand">{kicker}</p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.02em]">{title}</h1>
        <p className="mt-3 text-mist">{subtitle}</p>
        <div className="mt-9">{children}</div>
        <p className="mt-8 border-t border-line pt-6 text-sm text-mist">
          {footer.text}{" "}
          <Link href={footer.href} className="font-medium text-ink underline decoration-brand/40 underline-offset-4 transition-colors hover:text-brand">
            {footer.cta}
          </Link>
        </p>
      </div>
    </main>
  );
}
