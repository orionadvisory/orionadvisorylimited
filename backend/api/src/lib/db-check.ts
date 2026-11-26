import { sql } from "drizzle-orm";
import { getDb } from "./db";

const TIMEOUT_MS = 2_000;

/**
 * Returns true if Postgres answers `select 1` within the timeout.
 * `@orion/db` is imported lazily so the API can boot (and /healthz can answer)
 * even when DATABASE_URL is missing in local dev.
 */
export async function checkDatabase(): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;
  try {
    const db = await getDb();
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("database check timed out")), TIMEOUT_MS);
    });
    await Promise.race([db.execute(sql`select 1`), timeout]);
    return true;
  } catch (err) {
    console.error(JSON.stringify({ level: "error", msg: "database check failed", err: String(err) }));
    return false;
  } finally {
    clearTimeout(timer);
  }
}
