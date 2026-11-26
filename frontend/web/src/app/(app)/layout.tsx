import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";
import { PersistGuestCheck } from "@/components/health-check/persist-guest-check";
import { getDashboardData } from "@/app/actions/dashboard";
import { MainContent } from "@/components/layout/main-content";
import { VerifyEmailBanner } from "@/components/auth/email-verification/verify-email-banner";
import { auth } from "@orion/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const unverifiedEmail = session && !session.user.emailVerified ? session.user.email : null;

  const userInfo = data
    ? {
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        status: data.user.status,
      }
    : { name: "User", email: "", role: "member" as const, status: "active" as const };

  const startupInfo = data?.startup
    ? { name: data.startup.name, stage: data.startup.stage }
    : null;

  // Count badges for the sidebar (rendering only — derived from the same data).
  const navCounts = {
    "/dashboard": data?.stats.issueCount ?? 0,
    "/dashboard/documents": data?.stats.documentCount ?? 0,
  };

  return (
    <SidebarProvider userName={userInfo.name} userEmail={userInfo.email}>
      <div className="min-h-screen bg-orion-canvas text-ink-soft">
        <PersistGuestCheck />
        <Sidebar user={userInfo} startup={startupInfo} counts={navCounts} />
        <MainContent>
          {unverifiedEmail && <VerifyEmailBanner email={unverifiedEmail} />}
          {children}
        </MainContent>
      </div>
    </SidebarProvider>
  );
}
