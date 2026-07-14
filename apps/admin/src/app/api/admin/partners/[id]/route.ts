import { auth } from "@orion/auth";
import { db } from "@orion/db";
import { partners } from "@orion/db/schema";
import { deleteFile } from "@orion/core/storage/r2";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin" || session.user.status !== "active") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id))
    .limit(1);

  if (!partner) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await deleteFile(partner.logoStorageKey);
  } catch (err) {
    console.error("partner logo delete failed:", err);
  }

  await db.delete(partners).where(eq(partners.id, id));
  return Response.json({ ok: true });
}
