import { isRouteErrorResponse, Link, Outlet } from "react-router";

import { isSameOrigin } from "~/.server/auth";
import adminCss from "~/styles/admin.css?url";

import type { Route } from "./+types/_layout";

// Wraps every /admin page, including the login page. The admin stylesheet
// only loads here (AGENTS.md section 5.1); routes/admin/_authed.tsx adds the
// session check and the dashboard shell.
export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: adminCss }];

/** CSRF check on every admin mutation, and keep admin pages out of caches and search. */
const adminRequest: Route.MiddlewareFunction = async ({ request }, next) => {
  if (request.method !== "GET" && request.method !== "HEAD" && !isSameOrigin(request)) {
    throw new Response("Forbidden", { status: 403 });
  }
  const response = await next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
};

export const middleware: Route.MiddlewareFunction[] = [adminRequest];

export default function AdminRoot() {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? "Not found" : "Something went wrong";
  const details = notFound
    ? "This item doesn’t exist or was removed."
    : isRouteErrorResponse(error)
      ? error.statusText || `Error ${error.status}`
      : import.meta.env.DEV && error instanceof Error
        ? error.message
        : "An unexpected error occurred. Please try again.";

  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <meta name="robots" content="noindex, nofollow" />
      <h1 className="font-heading text-3xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{details}</p>
      <Link to="/admin" className="mt-6 inline-block text-primary underline-offset-4 hover:underline">
        Back to the dashboard
      </Link>
    </main>
  );
}
