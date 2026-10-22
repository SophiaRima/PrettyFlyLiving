import { useState, type FormEvent } from "react";
import { Form, useNavigation, useSubmit } from "react-router";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import type { FormFailure } from "~/lib/forms";

import { CheckboxField, FormError, FormSection, TextAreaField, TextField } from "./form-fields";
import { PHOTO_ACCEPT } from "./photo-manager";
import { prepareImage } from "./prepare-image";

const PROPERTY_TYPES = ["Apartment", "Loft", "Studio", "Penthouse", "Townhouse", "Villa"];

export interface PropertyFormValues {
  name: string;
  slug: string;
  area: string;
  address: string;
  mapUrl: string | null;
  propertyType: string;
  tag: string | null;
  rating: number | null;
  description: string;
  goodToKnow: string | null;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  monthlyPriceKes: number;
  minNights: number;
  amenities: string[];
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

/** Photo picker for a new property; uploaded together with the details. */
function NewPropertyPhotos({ failure }: { failure?: FormFailure }) {
  const [count, setCount] = useState(0);
  const error = failure?.fieldErrors.photos;
  return (
    <FormSection title="Photos" description="The first photo becomes the cover. You can add, reorder and describe photos later on the Photos tab.">
      <div className="grid gap-2">
        <Label htmlFor="field-photos">Choose photos</Label>
        <input
          id="field-photos"
          name="photos"
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          onChange={(event) => setCount(event.currentTarget.files?.length ?? 0)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "field-photos-error" : undefined}
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        {error ? (
          <p id="field-photos-error" className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {count > 0 ? `${count} photo${count === 1 ? "" : "s"} selected. ` : ""}
            JPEG, PNG or WebP, up to 10 MB each. Resized to 2000px and saved as WebP.
            {failure && " If you had chosen photos, please choose them again."}
          </p>
        )}
      </div>
    </FormSection>
  );
}

/** Details form for a new or existing property. New properties can include photos. */
export function PropertyForm({
  values,
  areas,
  failure,
  submitLabel,
  withPhotos = false,
}: {
  values?: PropertyFormValues;
  areas: string[];
  failure?: FormFailure;
  submitLabel: string;
  /** Show the photo picker (New property page). */
  withPhotos?: boolean;
}) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const [preparing, setPreparing] = useState(false);
  const saving = preparing || navigation.state === "submitting";
  const common = { failure };

  // With JavaScript, resize the chosen photos to WebP before sending them.
  // Without it, the form posts the original files and the server checks them.
  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    const form = event.currentTarget;
    const input = form.elements.namedItem("photos");
    const files = input instanceof HTMLInputElement && input.files ? [...input.files] : [];
    if (files.length === 0) return;
    event.preventDefault();
    setPreparing(true);
    try {
      const body = new FormData(form);
      body.delete("photos");
      for (const file of files) body.append("photos", await prepareImage(file));
      await submit(body, { method: "post", encType: "multipart/form-data" });
    } finally {
      setPreparing(false);
    }
  }

  return (
    <Form
      method="post"
      encType={withPhotos ? "multipart/form-data" : undefined}
      onSubmit={withPhotos ? onSubmit : undefined}
      className="grid max-w-3xl gap-6"
    >
      <FormSection title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField {...common} name="name" label="Property name" defaultValue={values?.name} required />
          <TextField
            {...common}
            name="slug"
            label="URL name"
            defaultValue={values?.slug}
            placeholder="made from the name"
            hint="The page address: /stays/url-name. Changing it breaks old links."
          />
          <TextField {...common} name="area" label="Area" defaultValue={values?.area} list="property-areas" required hint="e.g. Kilimani. Powers the area search." />
          <TextField {...common} name="propertyType" label="Property type" defaultValue={values?.propertyType ?? "Apartment"} list="property-types" required />
          <TextField {...common} name="address" label="Address" defaultValue={values?.address} hint="Shown as the location line on the stay page." />
          <TextField {...common} name="mapUrl" label="Map link" type="url" defaultValue={values?.mapUrl} placeholder="https://maps.app.goo.gl/…" />
        </div>
        <datalist id="property-areas">
          {areas.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
        <datalist id="property-types">
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </FormSection>

      <FormSection title="Size and price">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField {...common} name="bedrooms" label="Bedrooms" type="number" min={0} defaultValue={values?.bedrooms ?? 1} required />
          <TextField {...common} name="bathrooms" label="Bathrooms" type="number" min={0} defaultValue={values?.bathrooms ?? 1} required />
          <TextField {...common} name="sleeps" label="Sleeps (guests)" type="number" min={1} defaultValue={values?.sleeps ?? 2} required />
          <TextField {...common} name="monthlyPriceKes" label="Monthly price (KES)" type="number" min={1} defaultValue={values?.monthlyPriceKes} required />
          <TextField {...common} name="minNights" label="Minimum stay (nights)" type="number" min={1} defaultValue={values?.minNights ?? 30} required />
        </div>
      </FormSection>

      <FormSection title="Listing" description="What guests read on the card and the stay page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField {...common} name="tag" label="Card tag" defaultValue={values?.tag} placeholder="e.g. Guest favourite" hint="Optional pill on the photo. Leave blank to hide it." />
          <TextField
            {...common}
            name="rating"
            label="Rating"
            type="number"
            step="0.1"
            min={1}
            max={5}
            defaultValue={values?.rating}
            placeholder="e.g. 4.9"
            hint="Only enter a real rating from guest reviews. Leave blank to hide it."
          />
        </div>
        <TextAreaField {...common} name="description" label="Description" rows={5} defaultValue={values?.description} required />
        <TextAreaField
          {...common}
          name="amenities"
          label="Amenities"
          rows={6}
          defaultValue={values?.amenities.join("\n")}
          hint="One per line, e.g. Fast Wi-Fi."
        />
        <TextAreaField
          {...common}
          name="goodToKnow"
          label="Good to know"
          rows={3}
          defaultValue={values?.goodToKnow}
          hint="Leave blank to show the standard text about minimum stays, availability and house rules."
        />
      </FormSection>

      {withPhotos && <NewPropertyPhotos failure={failure} />}

      <FormSection title="Visibility">
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField {...common} name="isPublished" label="Published" defaultChecked={values?.isPublished ?? false} hint="Shown on the website. Unpublish to hide it without losing anything." />
          <CheckboxField {...common} name="isFeatured" label="Featured on Home" defaultChecked={values?.isFeatured ?? false} hint="Home shows four stays, featured ones first." />
        </div>
        <TextField
          {...common}
          name="sortOrder"
          label="Sort order"
          type="number"
          min={0}
          defaultValue={values?.sortOrder ?? 0}
          className="max-w-40"
          hint="Lower numbers come first."
        />
      </FormSection>

      <div className="grid gap-3">
        <FormError failure={failure} />
        <div>
          <Button type="submit" size="lg" disabled={saving}>
            {preparing ? "Preparing photos…" : saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </Form>
  );
}
