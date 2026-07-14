import { db } from "@orion/db";
import { partners } from "@orion/db/schema";
import { asc } from "drizzle-orm";

export default async function PartnersMarquee() {
  const rows = await db
    .select({ id: partners.id, name: partners.name })
    .from(partners)
    .orderBy(asc(partners.orderIndex), asc(partners.createdAt));

  if (rows.length === 0) return null;

  // Duplicate the list so the horizontal scroll loops seamlessly.
  const items = [...rows, ...rows];

  return (
    <section
      className="border-b border-[#17211b]/15 bg-[#fdfbf7] py-10"
      aria-label="Organisations we work with"
    >
      <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#17211b]/50">
        Trusted by teams we work with
      </p>
      <div className="marquee">
        <div className="marquee-track" aria-hidden={rows.length < 2 ? undefined : true}>
          {items.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${p.id}-${i}`}
              src={`/api/partners/${p.id}/logo`}
              alt={p.name}
              className="partner-logo"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
