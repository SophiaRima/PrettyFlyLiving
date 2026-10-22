import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";

// No global stylesheet here on purpose: the public site links styles/site.css
// from routes/_site.tsx and the admin links styles/admin.css from its layout
// (AGENTS.md section 5.1). Root only loads the concept's fonts.
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Poppins:wght@300;400;500;600;700&display=swap",
  },
  { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
  { rel: "icon", href: "/brand/icon-512.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/brand/apple-touch-icon.png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f6f3ed" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page not found" : "Error";
    details =
      error.status === 404
        ? "The page you were looking for could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      style={{
        fontFamily: "Poppins, sans-serif",
        maxWidth: 640,
        margin: "80px auto",
        padding: "0 24px",
        color: "#242820",
      }}
    >
      <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
        {message}
      </h1>
      <p>{details}</p>
      <p>
        <a href="/">Back to Pretty Fly Living</a>
      </p>
      {stack && (
        <pre style={{ overflowX: "auto", fontSize: 12 }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
