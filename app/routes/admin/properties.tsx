import { ImageOffIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { getAdminProperties } from "~/.server/queries/properties";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { EditLink, RowActions, ViewLink } from "~/components/admin/row-actions";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { mediaUrl } from "~/lib/media";
import { formatKes } from "~/lib/site";

import type { Route } from "./+types/properties";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Properties  -  Pretty Fly Living admin" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  return { properties: await getAdminProperties(dbFromContext(context)) };
}

export default function AdminProperties({ loaderData }: Route.ComponentProps) {
  const { properties } = loaderData;
  return (
    <>
      <AdminPageHeader
        title="Properties"
        description="Stays shown on the website. Click Edit to change a property’s details, photos or calendar, including published ones. Unpublish a property to hide it."
      >
        <Link to="/admin/properties/new" className={buttonVariants({ size: "lg" })}>
          <PlusIcon data-icon="inline-start" />
          New property
        </Link>
      </AdminPageHeader>

      {properties.length === 0 ? (
        <p className="text-sm text-muted-foreground">No properties yet. Add the first one.</p>
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead className="hidden md:table-cell text-right">Per month</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Order</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    {property.coverKey ? (
                      <img
                        src={mediaUrl(property.coverKey)}
                        alt=""
                        width={64}
                        height={48}
                        loading="lazy"
                        className="h-12 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded-md bg-muted text-muted-foreground" title="No photos yet">
                        <ImageOffIcon className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Link to={`/admin/properties/${property.id}`} className="font-medium text-primary hover:underline">
                      {property.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {property.photoCount} photo{property.photoCount === 1 ? "" : "s"}
                    </div>
                    {/* Phones: the hidden columns, in one line. */}
                    <div className="mt-1 text-xs text-muted-foreground md:hidden">
                      {property.area} · {formatKes(property.monthlyPriceKes)}
                      {!property.isPublished && " · Hidden"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{property.area}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{formatKes(property.monthlyPriceKes)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {property.isPublished ? <Badge>Published</Badge> : <Badge variant="outline">Hidden</Badge>}
                      {property.isFeatured && <Badge variant="secondary">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground">{property.sortOrder}</TableCell>
                  <TableCell>
                    <RowActions>
                      <EditLink to={`/admin/properties/${property.id}`} itemName={property.name} />
                      {property.isPublished && <ViewLink href={`/stays/${property.slug}`} itemName={property.name} />}
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
