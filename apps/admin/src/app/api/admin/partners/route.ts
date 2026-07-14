import { auth } from "@orion/auth";
import { db } from "@orion/db";
import { partners } from "@orion/db/schema";
import { uploadFile } from "@orion/core/storage/r2";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

const MAX_LOGO_SIZE = 3 * 1024 * 1024; // 3 MB

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin" || session.user.status !== "active") {
    return null;
  }
  return session.user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(partners)
    .orderBy(asc(partners.orderIndex), asc(partners.createdAt));
  return Response.json({ partners: rows });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const name = (form.get("name") as string | null)?.trim();
  const file = form.get("logo") as File | null;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (!file) {
    return Response.json({ error: "Logo is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Logo must be an image" }, { status: 400 });
  }
  if (file.size > MAX_LOGO_SIZE) {
    return Response.json({ error: "Logo too large (max 3 MB)" }, { status: 400 });
  }

  const id = randomUUID();
  const ext =
    (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "png";
  const key = `partners/${id}/logo.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadFile(key, buffer, file.type);
  } catch (err) {
    console.error("partner logo upload failed:", err);
    return Response.json({ error: "Failed to upload logo" }, { status: 500 });
  }

  const existing = await db.select({ id: partners.id }).from(partners);
  await db.insert(partners).values({
    id,
    name,
    logoStorageKey: key,
    logoContentType: file.type,
    orderIndex: existing.length,
  });

  return Response.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orderedIds } = (await req.json()) as { orderedIds?: string[] };
  if (!Array.isArray(orderedIds)) {
    return Response.json({ error: "orderedIds is required" }, { status: 400 });
  }
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(partners)
        .set({ orderIndex: index, updatedAt: new Date() })
        .where(eq(partners.id, id))
    )
  );
  return Response.json({ ok: true });
}
