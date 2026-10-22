import { defineConfig } from "drizzle-kit";

// drizzle-kit only generates SQL here; migrations are applied to D1 with
// `npm run db:migrate:local` / `db:migrate:remote` (wrangler d1 migrations).
export default defineConfig({
  dialect: "sqlite",
  schema: "./app/.server/db/schema.ts",
  out: "./drizzle",
});
