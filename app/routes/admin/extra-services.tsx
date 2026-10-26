import { ImageOffIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { data, useFetcher } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import { deleteImageIfUnused, storeImage } from "~/.server/media";
import {
  createExtraService,
  deleteExtraService,
  getAdminExtraServices,
  moveRow,
  setExtraServiceImage,
  updateExtraService,
} from "~/.server/queries/content";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { CheckboxField, FormError, TextAreaField, TextField, useSuccessToast } from "~/components/admin/form-fields";
import { ItemControls } from "~/components/admin/item-controls";
import { PhotoUploader } from "~/components/admin/photo-manager";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cloudflareContext } from "~/context";
import type { AdminActionResult } from "~/lib/forms";
import { mediaUrl } from "~/lib/media";
import { extraServiceSchema } from "~/lib/validation";

import type { Route } from "./+types/extra-services";

type Service = Route.ComponentProps["loaderData"]["services"][number];

export function meta(): Route.MetaDescriptors {
  return [{ title: "Extra services  -  Pretty Fly Living admin" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  return { services: await getAdminExtraServices(dbFromContext(context)) };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const bucket = context.get(cloudflareContext).env.MEDIA;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const form = readAdminForm(formData, extraServiceSchema);
    if (form.kind === "invalid") return data(form.failure, { status: 400 });
    await createExtraService(db, form.data);
    return { ok: true as const, message: "Service added. Now add a photo." };
  }

  const ids = (await getAdminExtraServices(db)).map((s) => s.id);
  const id = Number(formData.get("id"));
  if (!ids.includes(id)) return data(formFailure("That service no longer exists. Please reload the page.", {}), { status: 404 });

  switch (intent) {
    case "update": {
      const form = readAdminForm(formData, extraServiceSchema);
      if (form.kind === "invalid") return data(form.failure, { status: 400 });
      await updateExtraService(db, id, form.data);
      return { ok: true as const, message: "Service saved" };
    }
    case "image": {
      const stored = await storeImage(bucket, "services", formData.get("photo"), formData.get("thumb"));
      if (!stored.ok) return data(formFailure(stored.message, {}), { status: 400 });
      const old = await setExtraServiceImage(db, id, stored);
      if (old !== stored.key) await deleteImageIfUnused(bucket, db, old);
      return { ok: true as const, message: "Photo saved" };
    }
    case "move-up":
    case "move-down":
      await moveRow(db, "extraServices", ids, id, intent === "move-up" ? -1 : 1);
      return { ok: true as const, message: "Order saved" };
    case "delete": {
      const key = await deleteExtraService(db, id);
      await deleteImageIfUnused(bucket, db, key);
      return { ok: true as const, message: "Service deleted" };
    }
    default:
      return data(formFailure("Unknown action.", {}), { status: 400 });
  }
}

function ServiceFields({ service, result, idPrefix }: { service?: Service; result?: AdminActionResult; idPrefix: string }) {
  const failure = result && !result.ok ? result : undefined;
  return (
    <>
      <TextField idPrefix={idPrefix} failure={failure} name="eyebrow" label="Small label above the title (optional)" defaultValue={service?.eyebrow} placeholder="e.g. See the city differently" />
      <TextField idPrefix={idPrefix} failure={failure} name="title" label="Title" defaultValue={service?.title} required placeholder="e.g. Airport Transfers" />
      <TextAreaField idPrefix={idPrefix} failure={failure} name="description" label="Description" rows={3} defaultValue={service?.description} required />
      <TextField idPrefix={idPrefix} failure={failure} name="details" label="Details line (optional)" defaultValue={service?.details} placeholder="e.g. Available on request · Additional charges apply" />
      <TextField
        idPrefix={idPrefix}
        failure={failure}
        name="ctaLabel"
        label="Button text (optional)"
        defaultValue={service?.ctaLabel}
        placeholder="e.g. Enquire about airport transfers"
        hint="The button opens WhatsApp with a message about this service. Leave blank for no button."
      />
      <CheckboxField failure={failure} name="isPublished" label="Published" defaultChecked={service?.isPublished ?? true} hint="Shown on the Why Us page." />
      <FormError failure={failure} />
    </>
  );
}

function ServiceItem({ service, index, count }: { service: Service; index: number; count: number }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  return (
    <li className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid gap-4 p-4 sm:grid-cols-[12rem_1fr]">
        <div className="grid content-start gap-2">
          {service.imageR2Key ? (
            <img src={mediaUrl(service.imageR2Key)} alt="" loading="lazy" className="aspect-4/3 w-full rounded-lg object-cover" />
          ) : (
            <div className="flex aspect-4/3 w-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
              <ImageOffIcon className="mr-1.5 size-4" /> No photo yet
            </div>
          )}
        </div>
        <fetcher.Form method="post" className="grid content-start gap-4" key={JSON.stringify(service)}>
          <input type="hidden" name="id" value={service.id} />
          <ServiceFields service={service} result={fetcher.data} idPrefix={`service-${service.id}`} />
          <div className="flex items-center gap-2">
            <Button type="submit" name="intent" value="update" disabled={fetcher.state !== "idle"}>
              Save
            </Button>
            {!service.isPublished && <Badge variant="outline">Hidden</Badge>}
          </div>
        </fetcher.Form>
      </div>
      <div className="border-t p-4">
        <PhotoUploader intent="image" label={service.imageR2Key ? "Replace photo" : "Add photo"} multiple={false} fields={{ id: String(service.id) }} />
      </div>
      <div className="flex justify-end border-t px-3 py-1.5">
        <ItemControls id={service.id} index={index} count={count} confirmDelete="Delete this service and its photo?" />
      </div>
    </li>
  );
}

function AddService() {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) formRef.current?.reset();
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form ref={formRef} method="post" className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="font-heading text-lg">Add a service</h2>
      <ServiceFields result={fetcher.data} idPrefix="new-service" />
      <div>
        <Button type="submit" name="intent" value="create" disabled={fetcher.state !== "idle"}>
          Add service
        </Button>
      </div>
    </fetcher.Form>
  );
}

export default function AdminExtraServices({ loaderData }: Route.ComponentProps) {
  const { services } = loaderData;
  return (
    <>
      <AdminPageHeader title="Extra services" description="Photo cards in the Extra services section of the Why Us page." />
      <div className="grid max-w-4xl gap-6">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No extra services yet.</p>
        ) : (
          <ul className="grid gap-4">
            {services.map((service, index) => (
              <ServiceItem key={service.id} service={service} index={index} count={services.length} />
            ))}
          </ul>
        )}
        <AddService />
      </div>
    </>
  );
}
