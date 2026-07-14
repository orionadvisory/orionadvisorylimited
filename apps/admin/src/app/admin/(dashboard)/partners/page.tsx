import { requireActiveAdmin } from "@orion/auth/admin";
import { db } from "@orion/db";
import { partners } from "@orion/db/schema";
import { asc } from "drizzle-orm";
import { Topbar } from "@/components/layout/topbar";
import PartnersManager from "@/components/admin/partners-manager";

export default async function AdminPartnersPage() {
  await requireActiveAdmin();

  const rows = await db
    .select()
    .from(partners)
    .orderBy(asc(partners.orderIndex), asc(partners.createdAt));

  return (
    <div>
      <Topbar
        title="Organizations"
        subtitle="Logos shown in the landing page marquee"
      />
      <div className="p-6">
        <PartnersManager
          webUrl={process.env.NEXT_PUBLIC_WEB_URL ?? ""}
          initial={rows.map((r) => ({ id: r.id, name: r.name }))}
        />
      </div>
    </div>
  );
}
