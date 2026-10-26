import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImageUpIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useFetcher } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { AdminActionResult } from "~/lib/forms";
import { mediaUrl } from "~/lib/media";

import { useSuccessToast } from "./form-fields";
import { prepareImage } from "./prepare-image";

export interface ManagedPhoto {
  id: number;
  key: string;
  alt: string;
}

export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Uploads one or more photos. With JavaScript each file is resized to WebP
 * and sent on its own with its small copy ("thumb"); without it the form
 * posts the original files and the server stores each one as its own copy.
 */
export function PhotoUploader({
  intent = "upload",
  label = "Add photos",
  multiple = true,
  fields = {},
}: {
  intent?: string;
  label?: string;
  multiple?: boolean;
  /** Extra values posted with each upload, e.g. which item the photo is for. */
  fields?: Record<string, string>;
}) {
  const fetcher = useFetcher<AdminActionResult>();
  const [progress, setProgress] = useState<string | null>(null);
  useSuccessToast(fetcher.data);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("photo");
    const files = input instanceof HTMLInputElement && input.files ? [...input.files] : [];
    if (files.length === 0) return;

    for (const [index, file] of files.entries()) {
      setProgress(files.length > 1 ? `Uploading ${index + 1} of ${files.length}…` : "Uploading…");
      const body = new FormData();
      body.set("intent", intent);
      for (const [name, value] of Object.entries(fields)) body.set(name, value);
      const { photo, thumb } = await prepareImage(file);
      body.set("photo", photo);
      body.set("thumb", thumb);
      await fetcher.submit(body, { method: "post", encType: "multipart/form-data" });
    }
    setProgress(null);
    form.reset();
  }

  const busy = progress !== null || fetcher.state !== "idle";
  return (
    <fetcher.Form
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-card p-4"
    >
      <input type="hidden" name="intent" value={intent} />
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input
        type="file"
        name="photo"
        accept={PHOTO_ACCEPT}
        multiple={multiple}
        required
        aria-label={label}
        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
      />
      <Button type="submit" disabled={busy}>
        <ImageUpIcon data-icon="inline-start" />
        {progress ?? (busy ? "Uploading…" : label)}
      </Button>
      <p className="w-full text-xs text-muted-foreground">
        JPEG, PNG or WebP, up to 10 MB. Resized to 2000px and saved as WebP.
      </p>
      {fetcher.data && !fetcher.data.ok && (
        <p role="alert" className="w-full text-sm text-destructive">
          {fetcher.data.message}
        </p>
      )}
    </fetcher.Form>
  );
}

function PhotoCard({
  photo,
  index,
  count,
  firstIsCover,
}: {
  photo: ManagedPhoto;
  index: number;
  count: number;
  firstIsCover: boolean;
}) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const busy = fetcher.state !== "idle";

  function confirmDelete(event: FormEvent<HTMLFormElement>): void {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === "delete-photo") {
      if (!window.confirm("Delete this photo? This can’t be undone.")) event.preventDefault();
    }
  }

  return (
    <li className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10" aria-busy={busy}>
      <div className="relative aspect-4/3 bg-muted">
        <img src={mediaUrl(photo.key)} alt={photo.alt} loading="lazy" className="size-full object-cover" />
        {firstIsCover && index === 0 && (
          <Badge className="absolute top-2 left-2">
            <StarIcon data-icon="inline-start" />
            Cover
          </Badge>
        )}
      </div>
      <fetcher.Form method="post" onSubmit={confirmDelete} className="grid gap-2 p-3">
        <input type="hidden" name="photoId" value={photo.id} />
        <label className="text-xs font-medium" htmlFor={`alt-${photo.id}`}>
          Description (alt text)
        </label>
        <div className="flex gap-2">
          <Input id={`alt-${photo.id}`} name="alt" defaultValue={photo.alt} maxLength={200} placeholder="e.g. Bright living room with sofa" />
          <Button type="submit" name="intent" value="photo-alt" variant="outline" disabled={busy}>
            Save
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button type="submit" name="intent" value="photo-earlier" variant="ghost" size="icon-sm" disabled={busy || index === 0} aria-label="Move earlier">
            <ArrowLeftIcon />
          </Button>
          <Button type="submit" name="intent" value="photo-later" variant="ghost" size="icon-sm" disabled={busy || index === count - 1} aria-label="Move later">
            <ArrowRightIcon />
          </Button>
          {index > 0 && (
            <Button type="submit" name="intent" value="photo-cover" variant="ghost" size="sm" disabled={busy}>
              {firstIsCover ? "Make cover" : "Move to front"}
            </Button>
          )}
          <Button type="submit" name="intent" value="delete-photo" variant="destructive" size="sm" disabled={busy} className="ml-auto">
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </div>
        {fetcher.data && !fetcher.data.ok && (
          <p role="alert" className="text-xs text-destructive">
            {fetcher.data.message}
          </p>
        )}
      </fetcher.Form>
    </li>
  );
}

/** Gallery editor: upload, describe, reorder and delete photos. */
export function PhotoManager({
  photos,
  emptyText,
  firstIsCover = true,
}: {
  photos: ManagedPhoto[];
  emptyText: string;
  /** Properties use their first photo as the cover; guides have a separate cover. */
  firstIsCover?: boolean;
}) {
  return (
    <div className="grid gap-6">
      <PhotoUploader />
      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {photos.map((photo, index) => (
            <PhotoCard key={photo.id} photo={photo} index={index} count={photos.length} firstIsCover={firstIsCover} />
          ))}
        </ul>
      )}
    </div>
  );
}
