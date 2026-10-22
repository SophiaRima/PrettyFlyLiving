import { ExternalLinkIcon } from "lucide-react";
import { Link, Outlet } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { getGuideById } from "~/.server/queries/content";
import { dbFromContext, idParam } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { AdminTabs } from "~/components/admin/admin-tabs";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";

import type { Route } from "./+types/guide";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [{ title: `${loaderData?.guide.title ?? "Guide"}  -  Pretty Fly Living admin` }];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const guide = await getGuideById(dbFromContext(context), idParam(params.id));
  if (!guide) throw new Response("Not found", { status: 404 });
  return { guide: { id: guide.id, title: guide.title, slug: guide.slug, isPublished: guide.isPublished } };
}

/** Shared header and Details · Photos tabs for one guide. */
export default function AdminGuide({ loaderData }: Route.ComponentProps) {
  const { guide } = loaderData;
  const base = `/admin/guides/${guide.id}`;
  return (
    <>
      <p className="mb-2 text-sm">
        <Link to="/admin/guides" className="text-muted-foreground hover:text-foreground">
          ← Nairobi guides
        </Link>
      </p>
      <AdminPageHeader
        title={guide.title}
        description={guide.isPublished ? <Badge>Published</Badge> : <Badge variant="outline">Hidden from the website</Badge>}
      >
        {guide.isPublished && (
          <a href={`/things-to-do/${guide.slug}`} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
            View on website
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
        )}
      </AdminPageHeader>
      <AdminTabs
        tabs={[
          { to: base, label: "Details", end: true },
          { to: `${base}/photos`, label: "Photos" },
        ]}
      />
      <Outlet />
    </>
  );
}
