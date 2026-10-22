import { Outlet } from "react-router";

import { SavedStaysProvider } from "~/components/site/saved-stays";
import { SiteFooter } from "~/components/site/site-footer";
import { SiteHeader } from "~/components/site/site-header";
import { ToastProvider } from "~/components/site/toast";
import { WhatsAppButton } from "~/components/site/whatsapp-button";
import siteCss from "~/styles/site.css?url";

import type { Route } from "./+types/_site";

// The concept stylesheet only loads on public pages (AGENTS.md section 5.1).
export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: siteCss },
];

export default function SiteLayout() {
  return (
    <ToastProvider>
      <SavedStaysProvider>
        <SiteHeader />
        <Outlet />
        <SiteFooter />
        <WhatsAppButton />
      </SavedStaysProvider>
    </ToastProvider>
  );
}
