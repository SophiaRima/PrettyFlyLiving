import type { RouterContextProvider } from "react-router";

import { cloudflareContext } from "~/context";

import { getDb, type Database } from "./db/client";

/** Database for the current request. */
export function dbFromContext(context: Readonly<RouterContextProvider>): Database {
  return getDb(context.get(cloudflareContext).env);
}

/** Today's date (YYYY-MM-DD) in Nairobi, so server and client agree. */
export function nairobiToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** A positive integer route param, e.g. /admin/properties/:id. Anything else is a 404. */
export function idParam(value: string | undefined): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new Response("Not found", { status: 404 });
  return id;
}
