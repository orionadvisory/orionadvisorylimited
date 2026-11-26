import { asc, eq } from "drizzle-orm";
import { getDb } from "../../lib/db";

export type PartnerRow = { id: string; name: string };
export type PartnerLogo = { bytes: Uint8Array<ArrayBuffer>; contentType: string };

export interface PartnersRepo {
  list(): Promise<PartnerRow[]>;
  /** Returns null when the partner doesn't exist; throws when storage fails. */
  getLogo(id: string): Promise<PartnerLogo | null>;
}

export const partnersRepo: PartnersRepo = {
  async list() {
    const db = await getDb();
    const { partners } = await import("@orion/db/schema");
    return db
      .select({ id: partners.id, name: partners.name })
      .from(partners)
      .orderBy(asc(partners.orderIndex), asc(partners.createdAt));
  },

  async getLogo(id) {
    const db = await getDb();
    const { partners } = await import("@orion/db/schema");
    const [partner] = await db
      .select({ key: partners.logoStorageKey, contentType: partners.logoContentType })
      .from(partners)
      .where(eq(partners.id, id))
      .limit(1);
    if (!partner) return null;

    const { getFileBuffer } = await import("@orion/core/storage/r2");
    const buffer = await getFileBuffer(partner.key);
    return { bytes: Uint8Array.from(buffer), contentType: partner.contentType || "image/png" };
  },
};
