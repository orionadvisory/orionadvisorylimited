import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/env";

describe("loadEnv", () => {
  it("applies defaults for local dev", () => {
    const env = loadEnv({});
    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:3000", "http://localhost:3001"]);
  });

  it("splits and trims CORS_ORIGINS", () => {
    const env = loadEnv({ CORS_ORIGINS: " https://orion.africa , https://admin.orion.africa ,," });
    expect(env.CORS_ORIGINS).toEqual(["https://orion.africa", "https://admin.orion.africa"]);
  });

  it("requires DATABASE_URL in production", () => {
    expect(() => loadEnv({ NODE_ENV: "production" })).toThrow(/DATABASE_URL is required/);
  });

  it("rejects a non-numeric PORT", () => {
    expect(() => loadEnv({ PORT: "abc" })).toThrow(/PORT/);
  });
});
