import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Database = DrizzleD1Database<typeof schema>;

export function getDb(env: Env): Database {
  return drizzle(env.DB, { schema });
}
