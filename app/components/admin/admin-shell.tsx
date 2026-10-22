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
  SettingsIcon,
  SparklesIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Form, Link, NavLink } from "react-router";

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

/** Dashboard frame: sidebar on desktop, scrollable nav row on phones. */
export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="min-h-svh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b bg-card md:sticky md:top-0 md:flex md:h-svh md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-5">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/brand/logo.png" alt="Pretty Fly Living" width={56} height={40} className="h-10 w-auto" />
            <span className="text-xs tracking-wide text-muted-foreground uppercase">Admin</span>
          </Link>
          <Form method="post" action="/admin/logout" className="md:hidden">
            <button type="submit" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <LogOutIcon className="size-4" />
              Log out
            </button>
          </Form>
        </div>

        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-5 md:overflow-y-auto md:pb-0">
          {navGroups.map((group) => (
            <div key={group.label} className="flex gap-1 md:flex-col">
              <p className="hidden px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase md:block">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          ))}
        </nav>

        <div className="hidden border-t px-3 py-4 md:block">
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
      </aside>

      <main className="min-w-0 px-4 py-6 md:px-10 md:py-10">{children}</main>
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
