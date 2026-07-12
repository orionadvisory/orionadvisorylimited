export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-indigo-50/40">
      {children}
    </div>
  );
}
