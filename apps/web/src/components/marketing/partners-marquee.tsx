import { db } from "@orion/db";
import { partners } from "@orion/db/schema";
import { asc } from "drizzle-orm";
import { PartnerLogo } from "./partner-logo";

export default async function PartnersMarquee() {
  // A logo strip must never take the landing page down with it.
  let rows: { id: string; name: string }[] = [];
  try {
    rows = await db
      .select({ id: partners.id, name: partners.name })
      .from(partners)
      .orderBy(asc(partners.orderIndex), asc(partners.createdAt));
  } catch (error) {
    console.error("[partners-marquee] failed to load partners", error);
    return null;
  }

  if (rows.length === 0) return null;

  // Duplicate the list so the horizontal scroll loops seamlessly.
  const items = [...rows, ...rows];

  return (
    <section className="py-14" aria-label="Organisations we work with">
      <p className="kicker mb-10 text-center text-mist/70">Trusted by teams we work with</p>
      <div className="marquee">
        <div className="marquee-track" aria-hidden={rows.length < 2 ? undefined : true}>
          {items.map((p, i) => (
            <PartnerLogo key={`${p.id}-${i}`} src={`/api/partners/${p.id}/logo`} alt={p.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
