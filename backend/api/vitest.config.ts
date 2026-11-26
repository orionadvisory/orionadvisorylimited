import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Auth tests use real cost-12 bcrypt hashes (to prove old passwords still work); under
    // parallel load a single hash can approach the 5s default, so allow headroom.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
