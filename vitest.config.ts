import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so unit tests don't boot the Cloudflare or
// React Router plugins. Tests cover pure logic only (AGENTS.md section 2).
export default defineConfig({
  resolve: {
    alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) },
  },
  test: {
    include: ["app/**/*.test.ts"],
    environment: "node",
  },
});
