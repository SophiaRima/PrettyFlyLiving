import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  GripIcon,
  ImageUpIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
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
  dragDisabled,
}: {
  photo: ManagedPhoto;
  index: number;
  count: number;
  firstIsCover: boolean;
  /** While a dragged order is still saving. */
  dragDisabled: boolean;
}) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const busy = fetcher.state !== "idle";
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
    disabled: dragDisabled || busy,
  });

  function confirmDelete(event: FormEvent<HTMLFormElement>): void {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.value === "delete-photo") {
      if (!window.confirm("Delete this photo? This can’t be undone.")) event.preventDefault();
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 ${isDragging ? "relative z-10 opacity-80 shadow-xl ring-primary" : ""}`}
      aria-busy={busy}
    >
      {/* The photo is the drag handle: drag it (or hold it on a phone) to a
          new place. With a keyboard: Space to pick up, arrows, Space to drop. */}
      <div
        {...attributes}
        {...listeners}
        aria-label={`Photo ${index + 1} of ${count}. Drag to change the order.`}
        className="relative aspect-4/3 cursor-grab touch-manipulation bg-muted outline-none select-none focus-visible:ring-3 focus-visible:ring-ring active:cursor-grabbing"
      >
        <img
          src={mediaUrl(photo.key)}
          alt={photo.alt}
          loading="lazy"
          draggable={false}
          className="pointer-events-none size-full object-cover"
        />
        {firstIsCover && index === 0 && (
          <Badge className="absolute top-2 left-2">
            <StarIcon data-icon="inline-start" />
            Cover
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2" aria-hidden="true">
          <GripIcon data-icon="inline-start" />
          Drag
        </Badge>
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

/**
 * Gallery editor: upload, describe, reorder (drag, or the arrow buttons) and
 * delete photos. A drop shows the new order at once and saves it in the
 * background; if the save fails, the saved order comes back.
 */
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
  const moveFetcher = useFetcher<AdminActionResult>();
  useSuccessToast(moveFetcher.data);
  const savedOrder = photos.map((photo) => photo.id);
  const savedKey = savedOrder.join(",");
  const [order, setOrder] = useState(savedOrder);

  // Follow the saved order after every save, upload or delete, and go back
  // to it when a dragged order couldn't be saved.
  useEffect(() => setOrder(savedKey ? savedKey.split(",").map(Number) : []), [savedKey]);
  useEffect(() => {
    if (moveFetcher.data && !moveFetcher.data.ok) setOrder(savedKey ? savedKey.split(",").map(Number) : []);
  }, [moveFetcher.data, savedKey]);

  const sensors = useSensors(
    // A small movement starts a mouse drag, so clicks still work; on a phone
    // the photo is held for a moment first, so the page can still scroll.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent): void {
    if (!over || active.id === over.id) return;
    const from = order.indexOf(Number(active.id));
    const to = order.indexOf(Number(over.id));
    if (from === -1 || to === -1) return;
    setOrder(arrayMove(order, from, to));
    moveFetcher.submit({ intent: "photo-move", photoId: String(active.id), toIndex: String(to) }, { method: "post" });
  }

  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const shown = order.flatMap((id) => byId.get(id) ?? []);

  return (
    // @container: the photo columns follow the space this panel has (not the
    // window), so the sidebar doesn't leave three huge tiles on a big monitor.
    <div className="@container grid gap-6">
      <PhotoUploader />
      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <>
          <p className="-mb-2 text-sm text-muted-foreground">
            Drag a photo to change the order{firstIsCover ? "; the first one is the cover" : ""}.
          </p>
          {moveFetcher.data && !moveFetcher.data.ok && (
            <p role="alert" className="text-sm text-destructive">
              {moveFetcher.data.message}
            </p>
          )}
          {/* A fixed id keeps dnd-kit's screen-reader ids the same on the server and in the browser. */}
          <DndContext id="photo-order" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={rectSortingStrategy}>
              <ul className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
                {shown.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    count={shown.length}
                    firstIsCover={firstIsCover}
                    dragDisabled={moveFetcher.state !== "idle"}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
