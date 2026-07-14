import { db } from "@orion/db";
import { partners } from "@orion/db/schema";
import { eq } from "drizzle-orm";
import { getFileBuffer } from "@orion/core/storage/r2";

/**
 * GET /api/partners/[id]/logo
 * Public: streams a partner logo from R2 (private bucket) with a long,
 * immutable cache so the landing-page marquee stays cheap.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id))
    .limit(1);

  if (!partner) {
    return new Response("partner-not-found", { status: 404 });
  }

  try {
    const buffer = await getFileBuffer(partner.logoStorageKey);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": partner.logoContentType || "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("partner logo fetch from R2 failed:", err);
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : "unknown";
    return new Response(`logo-fetch-failed: ${detail}`, { status: 502 });
  }
}
