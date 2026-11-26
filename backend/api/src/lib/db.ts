/**
 * Lazily load the Drizzle client. `@orion/db` creates its Neon connection at import
 * time, so importing it eagerly would crash boot when DATABASE_URL is unset (local dev,
 * tests). Every repo goes through this instead of importing `@orion/db` directly.
 */
export async function getDb() {
  const { db } = await import("@orion/db");
  return db;
}
