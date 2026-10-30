import { Outlet, redirect } from "react-router";

import { getSession, requireAdmin } from "~/.server/auth";
import { dbFromContext } from "~/.server/request";
import { AdminShell } from "~/components/admin/admin-shell";
import { adminUserContext } from "~/context";

import type { Route } from "./+types/_authed";

/** Every dashboard page needs a valid session; otherwise go to the login page. */
const requireSession: Route.MiddlewareFunction = async ({ request, context }, next) => {
  const session = await getSession(dbFromContext(context), request);
  if (!session) {
    const url = new URL(request.url);
    const back = url.pathname.replace(/\.data$/, "") + url.search;
    throw redirect(`/admin/login?next=${encodeURIComponent(back)}`);
  }
  context.set(adminUserContext, session.user);
  return next();
};

export const middleware: Route.MiddlewareFunction[] = [requireSession];

// A loader makes client-side navigations hit the server, so the session
// middleware runs on every page change, not just full page loads.
export function loader({ context }: Route.LoaderArgs) {
  return { email: requireAdmin(context).email };
}

export default function AuthedLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AdminShell email={loaderData.email}>
      <Outlet />
    </AdminShell>
  );
}
