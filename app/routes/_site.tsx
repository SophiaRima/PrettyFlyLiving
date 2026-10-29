import type { ReactNode } from "react";
import { isRouteErrorResponse, Link, Outlet, useLocation } from "react-router";

import { PageHero } from "~/components/site/page-hero";
import { SavedStaysProvider } from "~/components/site/saved-stays";
import { SiteFooter } from "~/components/site/site-footer";
import { SiteHeader } from "~/components/site/site-header";
import { ToastProvider } from "~/components/site/toast";
import { WhatsAppButton } from "~/components/site/whatsapp-button";
import { whatsappMessages, whatsappUrl } from "~/lib/site";
import siteCss from "~/styles/site.css?url";

import type { Route } from "./+types/_site";

// The concept stylesheet only loads on public pages (AGENTS.md section 5.1).
export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: siteCss },
];

/**
 * Only used for the error page below: every public route exports its own
 * meta, which replaces this one. Routes below an error boundary don't get
 * their meta rendered, so the error page's title has to come from here.
 */
export function meta({ error }: Route.MetaArgs): Route.MetaDescriptors {
  if (!error) return [];
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return [
    { title: `${notFound ? "Page not found" : "Something went wrong"}  -  Pretty Fly Living` },
    { name: "robots", content: "noindex" },
  ];
}

/** Header, footer and the floating WhatsApp button around every public page. */
function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SavedStaysProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <div id="main" tabIndex={-1} className="skip-target">
          {children}
        </div>
        <SiteFooter />
        <WhatsAppButton />
      </SavedStaysProvider>
    </ToastProvider>
  );
}

export default function SiteLayout() {
  return (
    <SiteFrame>
      <Outlet />
    </SiteFrame>
  );
}

/**
 * Public 404 and error page. It replaces the layout when any public route
 * throws (including the catch-all in routes/not-found.tsx), so it draws the
 * site frame itself.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const location = useLocation();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const stack = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  return (
    <SiteFrame>
      <main>
        {notFound ? (
          <PageHero
            eyebrow="Page not found"
            title="This page isn’t here."
            intro="The link may be old, or the page may have moved."
            action={
              <div className="cta-actions">
                <Link viewTransition className="btn" to="/">
                  Back to home ↗
                </Link>
                <Link viewTransition className="btn btn-light" to="/stays">
                  Browse our stays ↗
                </Link>
              </div>
            }
          />
        ) : (
          <PageHero
            eyebrow="Something went wrong"
            title="We couldn’t load this page."
            intro="Please try again in a moment, or message us if it keeps happening."
            action={
              <div className="cta-actions">
                <a className="btn" href={location.pathname + location.search}>
                  Try again ↗
                </a>
                <a
                  className="btn btn-light"
                  href={whatsappUrl(whatsappMessages.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message us on WhatsApp ↗
                </a>
              </div>
            }
          />
        )}
        {stack && (
          <section className="section">
            <div className="container">
              <pre style={{ overflowX: "auto", fontSize: 12 }}>
                <code>{stack}</code>
              </pre>
            </div>
          </section>
        )}
      </main>
    </SiteFrame>
  );
}
