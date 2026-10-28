import {
  BuildingIcon,
  CalendarCheckIcon,
  ExternalLinkIcon,
  HandshakeIcon,
  CircleHelpIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MapIcon,
  MenuIcon,
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Form, Link, NavLink, useLocation } from "react-router";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "~/components/ui/sheet";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";

const navGroups: { label: string; items: { to: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Inbox",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboardIcon },
      { to: "/admin/bookings", label: "Booking requests", icon: CalendarCheckIcon },
      { to: "/admin/messages", label: "Messages", icon: MailIcon },
      { to: "/admin/enquiries", label: "Owner enquiries", icon: HandshakeIcon },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/properties", label: "Properties", icon: BuildingIcon },
      { to: "/admin/guides", label: "Nairobi guides", icon: MapIcon },
      { to: "/admin/reviews", label: "Reviews", icon: StarIcon },
      { to: "/admin/faqs", label: "FAQs", icon: CircleHelpIcon },
      { to: "/admin/extra-services", label: "Extra services", icon: SparklesIcon },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/admin/settings", label: "Settings", icon: SettingsIcon }],
  },
];

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      prefetch="intent"
      className={({ isActive }) =>
        cn(
          "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-secondary font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  );
}

/** The nav item for the current page, for the phone/tablet top bar. */
function currentNavItem(pathname: string): { label: string; icon: LucideIcon } | undefined {
  const items = navGroups.flatMap((group) => group.items);
  return items.find((item) => (item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to)));
}

function AdminLogo() {
  return (
    <Link to="/admin" className="flex items-center gap-3">
      <img src="/brand/logo.png" alt="Pretty Fly Living" width={56} height={40} className="h-10 w-auto" />
      <span className="text-xs tracking-wide text-muted-foreground uppercase">Admin</span>
    </Link>
  );
}

/** Grouped section links, then View website, Log out and the signed-in email. */
function AdminNav({ email }: { email: string }) {
  return (
    <>
      <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</p>
            {group.items.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLinkIcon className="size-4" />
          View website
        </a>
        <Form method="post" action="/admin/logout">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOutIcon className="size-4" />
            Log out
          </button>
        </Form>
        <p className="truncate px-3 pt-2 text-xs text-muted-foreground" title={email}>
          {email}
        </p>
      </div>
    </>
  );
}

/**
 * Dashboard frame: a sidebar from 1024px. Phones and tablets get a top bar
 * with the current section and a Menu button that opens the same links.
 */
export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = currentNavItem(pathname);
  const CurrentIcon = current?.icon;

  // Close the menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[15rem_1fr]">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-card px-4 py-2.5 lg:hidden">
        <AdminLogo />
        {current && CurrentIcon && (
          <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium">
            <CurrentIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{current.label}</span>
          </p>
        )}
        <Button variant="outline" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen}>
          <MenuIcon data-icon="inline-start" />
          Menu
        </Button>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 gap-0 pb-0 lg:hidden">
          <div className="px-5 pt-4 pb-5">
            <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
            <AdminLogo />
          </div>
          <AdminNav email={email} />
        </SheetContent>
      </Sheet>

      <aside className="hidden border-r bg-card lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col">
        <div className="px-5 py-5">
          <AdminLogo />
        </div>
        <AdminNav email={email} />
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 md:px-8 lg:px-10 lg:py-10">{children}</main>
      <Toaster position="top-right" />
    </div>
  );
}

/** Page title row with optional actions on the right. */
export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
