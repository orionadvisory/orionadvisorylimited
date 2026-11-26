import { auth } from "@orion/session";
import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";
import { displayFont } from "@/components/layout/fonts";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const userInfo = {
    name: session?.user?.name ?? "Admin",
    email: session?.user?.email ?? "",
    role: (session?.user?.role ?? "admin") as "member" | "admin",
    status: (session?.user?.status ?? "active") as "active" | "suspended",
  };

  return (
    <SidebarProvider userName={userInfo.name} userEmail={userInfo.email}>
      <div className={`${displayFont.variable} min-h-screen bg-orion-canvas text-ink-soft`}>
        <Sidebar user={userInfo} startup={null} />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
