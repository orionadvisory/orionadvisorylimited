import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load the shared env from the repo root so db tooling has DATABASE_URL.
config({ path: "../../.env" });

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
