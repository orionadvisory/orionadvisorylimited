import { requireActiveAdmin } from "@orion/session/admin";
import { listAdminPartners } from "@/app/actions/admin";
import { Topbar } from "@/components/layout/topbar";
import PartnersManager from "@/components/admin/partners-manager";

export default async function AdminPartnersPage() {
  await requireActiveAdmin();

  const rows = await listAdminPartners();

  return (
    <div>
      <Topbar
        title="Organizations"
        subtitle="Logos shown in the landing page marquee"
      />
      <div className="p-6">
        <PartnersManager
          apiUrl={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}
          initial={rows.map((r) => ({ id: r.id, name: r.name }))}
        />
      </div>
    </div>
  );
}
