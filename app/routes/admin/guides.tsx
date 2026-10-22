import { ImageOffIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { getAdminGuides } from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { EditLink, RowActions, ViewLink } from "~/components/admin/row-actions";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { mediaUrl } from "~/lib/media";

import type { Route } from "./+types/guides";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Nairobi guides  -  Pretty Fly Living admin" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  return { guides: await getAdminGuides(dbFromContext(context)) };
}

export default function AdminGuides({ loaderData }: Route.ComponentProps) {
  const { guides } = loaderData;
  return (
    <>
      <AdminPageHeader
        title="Nairobi guides"
        description="Things to Do articles. Click Edit to change a guide’s text or photos, including published ones. Unpublish a guide to hide it."
      >
        <Link to="/admin/guides/new" className={buttonVariants({ size: "lg" })}>
          <PlusIcon data-icon="inline-start" />
          New guide
        </Link>
      </AdminPageHeader>

      {guides.length === 0 ? (
        <p className="text-sm text-muted-foreground">No guides yet. Write the first one.</p>
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Order</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell>
                    {guide.coverKey ? (
                      <img src={mediaUrl(guide.coverKey)} alt="" width={64} height={48} loading="lazy" className="h-12 w-16 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded-md bg-muted text-muted-foreground" title="No cover photo yet">
                        <ImageOffIcon className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Link to={`/admin/guides/${guide.id}`} className="font-medium text-primary hover:underline">
                      {guide.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground md:hidden">
                      {guide.category}
                      {!guide.isPublished && " · Hidden"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{guide.category}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {guide.isPublished ? <Badge>Published</Badge> : <Badge variant="outline">Hidden</Badge>}
                      {guide.isFeatured && <Badge variant="secondary">Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground">{guide.sortOrder}</TableCell>
                  <TableCell>
                    <RowActions>
                      <EditLink to={`/admin/guides/${guide.id}`} itemName={guide.title} />
                      {guide.isPublished && <ViewLink href={`/things-to-do/${guide.slug}`} itemName={guide.title} />}
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
