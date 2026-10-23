import { redirect } from "react-router";

import { destroySession, requireAdmin } from "~/.server/auth";
import { dbFromContext } from "~/.server/request";
import { safeAdminPath } from "~/lib/admin";

import type { Route } from "./+types/logout";

export function loader(): never {
  throw redirect("/admin");
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  // Settings sends `next` so "Sign in again" returns there afterwards.
  const next = (await request.formData()).get("next");
  const login = typeof next === "string" && next ? `/admin/login?next=${encodeURIComponent(safeAdminPath(next))}` : "/admin/login";
  return redirect(login, {
    headers: { "Set-Cookie": await destroySession(dbFromContext(context), request) },
  });
}
