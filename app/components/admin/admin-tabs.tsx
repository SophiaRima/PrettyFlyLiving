import { NavLink } from "react-router";

import { cn } from "~/lib/utils";

/**
 * Tabs that are routes (e.g. a property's Details · Photos · Calendar), so
 * each tab has its own URL and action. Styled like the shadcn Tabs line variant.
 */
export function AdminTabs({ tabs }: { tabs: { to: string; label: string; end?: boolean }[] }) {
  return (
    <nav aria-label="Sections" className="mb-6 flex gap-1 overflow-x-auto border-b">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          preventScrollReset
          className={({ isActive }) =>
            cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
              isActive
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
