import { redirect } from "react-router";

import { destroySession, requireAdmin } from "~/.server/auth";
import { dbFromContext } from "~/.server/request";

import type { Route } from "./+types/logout";

export function loader(): never {
  throw redirect("/admin");
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  return redirect("/admin/login", {
    headers: { "Set-Cookie": await destroySession(dbFromContext(context), request) },
  });
}
