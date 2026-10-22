import { ExternalLinkIcon, PencilIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { buttonVariants } from "~/components/ui/button";

/** Right-aligned buttons at the end of a table row. */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-1">{children}</div>;
}

/** Opens an item in the dashboard (Edit, Manage, Open…). */
export function EditLink({
  to,
  itemName,
  label = "Edit",
  icon: Icon = PencilIcon,
}: {
  to: string;
  /** For screen readers, e.g. "Edit The Lennox Residence". */
  itemName: string;
  label?: string;
  icon?: LucideIcon;
}) {
  return (
    <Link to={to} className={buttonVariants({ variant: "outline", size: "sm" })} aria-label={`${label} ${itemName}`}>
      <Icon data-icon="inline-start" />
      {label}
    </Link>
  );
}

/** Opens an item's public page in a new tab. */
export function ViewLink({ href, itemName }: { href: string; itemName: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "ghost", size: "sm" })}
      aria-label={`View ${itemName} on the website`}
    >
      View
      <ExternalLinkIcon data-icon="inline-end" />
    </a>
  );
}
