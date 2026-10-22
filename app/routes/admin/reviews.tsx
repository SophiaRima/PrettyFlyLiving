import { PencilIcon, StarIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { data, useFetcher } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import {
  createReview,
  deleteReview,
  getAdminReviews,
  moveRow,
  updateReview,
} from "~/.server/queries/content";
import { getPropertyOptions } from "~/.server/queries/properties";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import {
  CheckboxField,
  FormError,
  SelectField,
  TextAreaField,
  TextField,
  useSuccessToast,
} from "~/components/admin/form-fields";
import { ItemControls } from "~/components/admin/item-controls";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import type { AdminActionResult } from "~/lib/forms";
import { cn } from "~/lib/utils";
import { reviewSchema } from "~/lib/validation";

import type { Route } from "./+types/reviews";

type Review = Route.ComponentProps["loaderData"]["reviews"][number];
type PropertyOption = Route.ComponentProps["loaderData"]["properties"][number];

export function meta(): Route.MetaDescriptors {
  return [{ title: "Reviews  -  Pretty Fly Living admin" }];
}

export async function loader({ context }: Route.LoaderArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const [reviews, properties] = await Promise.all([getAdminReviews(db), getPropertyOptions(db)]);
  return { reviews, properties };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const form = readAdminForm(formData, reviewSchema);
    if (form.kind === "invalid") return data(form.failure, { status: 400 });
    await createReview(db, form.data);
    return { ok: true as const, message: "Review added" };
  }

  const ids = (await getAdminReviews(db)).map((r) => r.id);
  const id = Number(formData.get("id"));
  if (!ids.includes(id)) return data(formFailure("That review no longer exists. Please reload the page.", {}), { status: 404 });

  switch (intent) {
    case "update": {
      const form = readAdminForm(formData, reviewSchema);
      if (form.kind === "invalid") return data(form.failure, { status: 400 });
      await updateReview(db, id, form.data);
      return { ok: true as const, message: "Review saved" };
    }
    case "move-up":
    case "move-down":
      await moveRow(db, "reviews", ids, id, intent === "move-up" ? -1 : 1);
      return { ok: true as const, message: "Order saved" };
    case "delete":
      await deleteReview(db, id);
      return { ok: true as const, message: "Review deleted" };
    default:
      return data(formFailure("Unknown action.", {}), { status: 400 });
  }
}

function ReviewFields({
  review,
  properties,
  result,
  idPrefix,
}: {
  review?: Review;
  properties: PropertyOption[];
  result?: AdminActionResult;
  idPrefix: string;
}) {
  const failure = result && !result.ok ? result : undefined;
  const common = { failure, idPrefix };
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...common} name="guestName" label="Guest name" defaultValue={review?.guestName} required placeholder="e.g. Amara K." />
        <TextField {...common} name="context" label="Line under the name" defaultValue={review?.context} placeholder="e.g. Recent Nairobi stay" />
        <SelectField
          {...common}
          name="rating"
          label="Rating"
          defaultValue={review?.rating ?? 5}
          options={["5", "4", "3", "2", "1"].map((v) => ({ value: v, label: `${v} star${v === "1" ? "" : "s"}` }))}
        />
        <SelectField
          {...common}
          name="propertyId"
          label="Property (optional)"
          defaultValue={review?.propertyId ?? ""}
          options={[{ value: "", label: "Not linked to a property" }, ...properties.map((p) => ({ value: String(p.id), label: p.name }))]}
        />
      </div>
      <TextAreaField {...common} name="body" label="Review" rows={4} defaultValue={review?.body} required hint="Use the guest’s real words. Never write or edit a review on their behalf." />
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckboxField failure={failure} name="isPublished" label="Published" defaultChecked={review?.isPublished ?? true} hint="Shown on the Why Us page." />
        <CheckboxField failure={failure} name="isFeatured" label="Featured on Home" defaultChecked={review?.isFeatured ?? false} hint="Home shows the first featured review." />
      </div>
      <FormError failure={failure} />
    </>
  );
}

function ReviewItem({ review, properties, index, count }: { review: Review; properties: PropertyOption[]; index: number; count: number }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  return (
    <li className="flex items-start gap-1 rounded-xl bg-card pr-2 ring-1 ring-foreground/10">
      <details className="group min-w-0 flex-1">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
          <span>
            <span className="flex flex-wrap items-center gap-2 font-medium">
              {review.guestName}
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <StarIcon className="size-3.5 fill-current" />
                {review.rating}
              </span>
              {review.isFeatured && <Badge variant="secondary">Featured</Badge>}
              {!review.isPublished && <Badge variant="outline">Hidden</Badge>}
            </span>
            <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{review.body}</span>
          </span>
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>
            <PencilIcon data-icon="inline-start" />
            <span className="group-open:hidden">Edit</span>
            <span className="hidden group-open:inline">Close</span>
          </span>
        </summary>
        <fetcher.Form method="post" className="grid gap-4 border-t p-4" key={JSON.stringify(review)}>
          <input type="hidden" name="id" value={review.id} />
          <ReviewFields review={review} properties={properties} result={fetcher.data} idPrefix={`review-${review.id}`} />
          <div>
            <Button type="submit" name="intent" value="update" disabled={fetcher.state !== "idle"}>
              Save
            </Button>
          </div>
        </fetcher.Form>
      </details>
      <div className="shrink-0 pt-3.5">
        <ItemControls id={review.id} index={index} count={count} confirmDelete="Delete this review?" />
      </div>
    </li>
  );
}

function AddReview({ properties }: { properties: PropertyOption[] }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) formRef.current?.reset();
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form ref={formRef} method="post" className="grid gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="font-heading text-lg">Add a review</h2>
      <ReviewFields properties={properties} result={fetcher.data} idPrefix="new-review" />
      <div>
        <Button type="submit" name="intent" value="create" disabled={fetcher.state !== "idle"}>
          Add review
        </Button>
      </div>
    </fetcher.Form>
  );
}

export default function AdminReviews({ loaderData }: Route.ComponentProps) {
  const { reviews, properties } = loaderData;
  return (
    <>
      <AdminPageHeader title="Reviews" description="Guest reviews on the Why Us page, in the order shown." />
      <div className="grid max-w-3xl gap-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="grid gap-3">
            {reviews.map((review, index) => (
              <ReviewItem key={review.id} review={review} properties={properties} index={index} count={reviews.length} />
            ))}
          </ul>
        )}
        <AddReview properties={properties} />
      </div>
    </>
  );
}
