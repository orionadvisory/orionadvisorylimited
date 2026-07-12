import { auth } from "@orion/auth";
import { Sidebar, SidebarProvider } from "@/components/layout/sidebar";
import { MainContent } from "@/components/layout/main-content";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-indigo-50/40">
        <Sidebar user={userInfo} startup={null} />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
}
