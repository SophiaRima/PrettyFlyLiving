import { ExternalLinkIcon } from "lucide-react";
import { Link, Outlet } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { getPropertyById } from "~/.server/queries/properties";
import { dbFromContext, idParam } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { AdminTabs } from "~/components/admin/admin-tabs";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";

import type { Route } from "./+types/property";

export function meta({ loaderData }: Route.MetaArgs): Route.MetaDescriptors {
  return [{ title: `${loaderData?.property.name ?? "Property"}  -  Pretty Fly Living admin` }];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const property = await getPropertyById(dbFromContext(context), idParam(params.id));
  if (!property) throw new Response("Not found", { status: 404 });
  return {
    property: {
      id: property.id,
      name: property.name,
      slug: property.slug,
      isPublished: property.isPublished,
    },
  };
}

/** Shared header and Details · Photos · Calendar tabs for one property. */
export default function AdminProperty({ loaderData }: Route.ComponentProps) {
  const { property } = loaderData;
  const base = `/admin/properties/${property.id}`;
  return (
    <>
      <p className="mb-2 text-sm">
        <Link to="/admin/properties" className="text-muted-foreground hover:text-foreground">
          ← Properties
        </Link>
      </p>
      <AdminPageHeader
        title={property.name}
        description={
          property.isPublished ? (
            <Badge>Published</Badge>
          ) : (
            <Badge variant="outline">Hidden from the website</Badge>
          )
        }
      >
        {property.isPublished && (
          <a
            href={`/stays/${property.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            View on website
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
        )}
      </AdminPageHeader>
      <AdminTabs
        tabs={[
          { to: base, label: "Details", end: true },
          { to: `${base}/photos`, label: "Photos" },
          { to: `${base}/calendar`, label: "Calendar" },
        ]}
      />
      <Outlet />
    </>
  );
}
