/** Split auth screen: night-sky showcase on one half, the form on the other (each page renders both). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-canvas p-3 text-ink lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-3">
      {children}
    </div>
  );
}
