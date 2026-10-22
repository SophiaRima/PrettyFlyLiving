import { createContext } from "react-router";

export interface CloudflareContext {
  env: Env;
  ctx: ExecutionContext;
}

/** Worker bindings and execution context, set per request in workers/app.ts. */
export const cloudflareContext = createContext<CloudflareContext>();

export interface AdminUser {
  id: number;
  email: string;
}

/** The signed-in admin, set by the middleware in routes/admin/_authed.tsx. */
export const adminUserContext = createContext<AdminUser | null>(null);
