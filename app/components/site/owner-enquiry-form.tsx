import { useEffect, useRef, useState, type ReactNode } from "react";
import { Form } from "react-router";

import {
  OWNER_UNIT_ROWS_MAX,
  ownerContactMethods,
  ownerFurnishingOptions,
  ownerListedOnlineOptions,
  ownerPropertyTypes,
  ownerSameLocationOptions,
  ownerSupportOptions,
} from "~/lib/constants";
import type { FormFailure } from "~/lib/forms";

import { FormGuard, FormStatus, fieldHelpers } from "./form-parts";

interface OwnerEnquiryFormProps {
  failure?: FormFailure;
  sent: boolean;
  sending: boolean;
  siteKey: string;
  /** Changes after each submit, so Turnstile hands out a fresh token. */
  resetKey: unknown;
}

/** How many "type + units" rows to show: at least one, or as many as were filled in. */
function filledRows(values: Record<string, string>): number {
  let rows = 1;
  for (let i = 1; i <= OWNER_UNIT_ROWS_MAX; i++) {
    if (values[`unitType${i}`] || values[`unitCount${i}`]) rows = i;
  }
  return rows;
}

/**
 * A radio or checkbox list in the concept's form style. Checkboxes post under
 * numbered names (support1, support2 …), see gatherOwnerLists in validation.ts.
 */
function ChoiceGroup({
  legend,
  name,
  options,
  multiple = false,
  hint,
  values,
  errorId,
  error,
  columns = 1,
  legendHidden = false,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  multiple?: boolean;
  hint?: string;
  values: Record<string, string>;
  errorId: string;
  error: ReactNode;
  columns?: 1 | 2;
  /** For a group whose question is already the step heading above it. */
  legendHidden?: boolean;
}) {
  return (
    <fieldset className="choice-group" aria-describedby={error ? errorId : undefined}>
      <legend className={legendHidden ? "sr-only" : undefined}>{legend}</legend>
      {hint && <span className="form-hint">{hint}</span>}
      <div className={columns === 2 ? "choice-list two-col" : "choice-list"}>
        {options.map((option, i) => {
          const inputName = multiple ? `${name}${i + 1}` : name;
          return (
            <label className="choice" key={option}>
              <input
                type={multiple ? "checkbox" : "radio"}
                name={inputName}
                value={option}
                defaultChecked={values[inputName] === option}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      {error}
    </fieldset>
  );
}

/** Property Management Enquiry Form, in the client's wording (2026-10). */
export function OwnerEnquiryForm({ failure, sent, sending, siteKey, resetKey }: OwnerEnquiryFormProps) {
  const { field, error } = fieldHelpers("owner", failure);
  const values = failure?.values ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [rows, setRows] = useState(() => filledRows(values));
  // "+ Add another property type" needs JavaScript; without it one row shows.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (failure) setRows(filledRows(failure.values));
  }, [failure]);

  useEffect(() => {
    if (!sent) return;
    formRef.current?.reset();
    setRows(1);
  }, [sent, resetKey]);

  return (
    <Form method="post" id="owner-form" ref={formRef} preventScrollReset>
      <div className="form-grid">
        <h3 className="form-step">1. About your property</h3>
        <div className="form-group">
          <label htmlFor="owner-location">Where is your property located? *</label>
          <input {...field("location")} required placeholder="City and neighbourhood" />
          {error("location")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-units">How many units would you like us to manage? *</label>
          <input
            {...field("units")}
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            required
            placeholder="Enter the number of units."
          />
          {error("units")}
        </div>

        <div className="form-group full">
          <label htmlFor="owner-type">What type of property do you have? *</label>
          <span className="form-hint">For a single unit, select one:</span>
          <select {...field("type")}>
            <option value="">Select a property type</option>
            {ownerPropertyTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          {error("type")}
        </div>

        <div className="form-group full">
          <span className="form-hint" id="owner-unit-rows-hint">
            For multiple units, add each applicable property type and quantity:
          </span>
          <div className="unit-rows" role="group" aria-describedby="owner-unit-rows-hint">
            <div className="unit-row unit-row-head" aria-hidden="true">
              <span>Property type</span>
              <span>Number of units of that type</span>
            </div>
            {Array.from({ length: rows }, (_, i) => {
              const n = i + 1;
              return (
                <div className="unit-row" key={n}>
                  <select
                    name={`unitType${n}`}
                    defaultValue={values[`unitType${n}`] ?? ""}
                    aria-label={`Property type, row ${n}`}
                    aria-invalid={failure?.fieldErrors.unitRows ? true : undefined}
                  >
                    <option value="">Property type</option>
                    {ownerPropertyTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    name={`unitCount${n}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={500}
                    defaultValue={values[`unitCount${n}`]}
                    placeholder="Units"
                    aria-label={`Number of units of that type, row ${n}`}
                    aria-invalid={failure?.fieldErrors.unitRows ? true : undefined}
                  />
                </div>
              );
            })}
            {hydrated && rows < OWNER_UNIT_ROWS_MAX && (
              <button type="button" className="add-row" onClick={() => setRows((count) => count + 1)}>
                + Add another property type
              </button>
            )}
          </div>
          {error("unitRows")}
        </div>

        <div className="form-group full">
          <ChoiceGroup
            legend="Are your units in the same location?"
            name="sameLocation"
            options={ownerSameLocationOptions}
            values={values}
            errorId="owner-sameLocation-error"
            error={error("sameLocation")}
          />
        </div>
        <div className="form-group full">
          <ChoiceGroup
            legend="What is the furnishing status of your property?"
            name="furnishing"
            options={ownerFurnishingOptions}
            values={values}
            errorId="owner-furnishing-error"
            error={error("furnishing")}
          />
        </div>
        <div className="form-group full">
          <ChoiceGroup
            legend="Is your property currently listed online?"
            name="listedOnline"
            options={ownerListedOnlineOptions}
            values={values}
            errorId="owner-listedOnline-error"
            error={error("listedOnline")}
          />
        </div>
        <div className="form-group full">
          <label htmlFor="owner-listingLinks">Existing listing link(s) (Optional)</label>
          <textarea {...field("listingLinks")} rows={2} style={{ minHeight: 70 }} placeholder="https://" />
          {error("listingLinks")}
        </div>

        <h3 className="form-step">2. What support do you need?</h3>
        <div className="form-group full">
          <ChoiceGroup
            legend="What support do you need?"
            legendHidden
            hint="Select all that apply."
            name="support"
            multiple
            columns={2}
            options={ownerSupportOptions}
            values={values}
            errorId="owner-support-error"
            error={error("support")}
          />
        </div>

        <h3 className="form-step">3. Tell us more</h3>
        <div className="form-group full">
          <label htmlFor="owner-message">What would you like help with? (Optional)</label>
          <textarea
            {...field("message")}
            placeholder="Share your goals, any challenges you’re experiencing or anything else you’d like us to know."
          />
          {error("message")}
        </div>

        <h3 className="form-step">4. Your contact details</h3>
        <div className="form-group full">
          <label htmlFor="owner-name">Full name *</label>
          <input {...field("name")} required autoComplete="name" />
          {error("name")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-email">Email address *</label>
          <input {...field("email")} type="email" required placeholder="you@example.com" autoComplete="email" />
          {error("email")}
        </div>
        <div className="form-group">
          <label htmlFor="owner-phone">Phone number / WhatsApp number *</label>
          <input {...field("phone")} type="tel" required placeholder="+254…" autoComplete="tel" />
          {error("phone")}
        </div>
        <div className="form-group full">
          <ChoiceGroup
            legend="Preferred contact method (WhatsApp, phone call or email)"
            name="preferredContact"
            options={ownerContactMethods}
            values={values}
            errorId="owner-preferredContact-error"
            error={error("preferredContact")}
          />
        </div>

        <div className="form-group full">
          <FormGuard siteKey={siteKey} action="owner" resetKey={resetKey} />
          <button className="btn" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Submit enquiry ↗"}
          </button>
          {sent && (
            <FormStatus tone="success">
              Thank you for your interest in Pretty Fly Living. We’ll review your
              enquiry and get in touch to discuss your property and management
              needs.
            </FormStatus>
          )}
          {failure && <FormStatus tone="error">{failure.message}</FormStatus>}
        </div>
      </div>
    </Form>
  );
}
