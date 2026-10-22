import { useEffect, useRef } from "react";
import { data, useFetcher } from "react-router";

import {
  changeAdminEmail,
  changeAdminPassword,
  checkAdminPassword,
  clientIp,
  isLoginThrottled,
  recordLoginFailure,
  requireAdmin,
} from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { FormError, FormSection, TextField, useSuccessToast } from "~/components/admin/form-fields";
import { Button } from "~/components/ui/button";
import type { AdminActionResult, FormFailure } from "~/lib/forms";
import {
  ADMIN_PASSWORD_MIN_LENGTH,
  adminEmailChangeSchema,
  adminPasswordChangeSchema,
} from "~/lib/validation";

import type { Route } from "./+types/settings";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Settings  -  Pretty Fly Living admin" }];
}

export function loader({ context }: Route.LoaderArgs) {
  return { email: requireAdmin(context).email };
}

const PASSWORD_FIELDS = ["currentPassword", "newPassword", "confirmPassword"];

/** Never send typed passwords back to the browser in a failure. */
function withoutPasswords(failure: FormFailure): FormFailure {
  const values = { ...failure.values };
  for (const field of PASSWORD_FIELDS) delete values[field];
  return { ...failure, values };
}

function fail(
  message: string,
  values: Record<string, string>,
  fieldErrors: FormFailure["fieldErrors"] = {},
  status = 400,
) {
  return data(withoutPasswords(formFailure(message, values, fieldErrors)), { status });
}

const WRONG_PASSWORD = { currentPassword: "That isn’t your current password." };
const THROTTLED = "Too many wrong passwords. Please wait 15 minutes and try again.";

export async function action({ request, context }: Route.ActionArgs) {
  const admin = requireAdmin(context);
  const db = dbFromContext(context);
  const ip = clientIp(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // A wrong current password counts towards the login lockout, so this page
  // can't be used to guess the password.
  const confirmCurrent = async (password: string): Promise<boolean> => {
    if (await checkAdminPassword(db, admin.id, password)) return true;
    await recordLoginFailure(db, ip);
    return false;
  };

  if (intent === "email") {
    const form = readAdminForm(formData, adminEmailChangeSchema);
    if (form.kind === "invalid") return data(withoutPasswords(form.failure), { status: 400 });
    const { values } = form;
    if (form.data.email === admin.email) {
      return fail("Please check the highlighted fields.", values, { email: "That’s already your login email." });
    }
    if (await isLoginThrottled(db, ip)) return fail(THROTTLED, values, {}, 429);
    if (!(await confirmCurrent(form.data.currentPassword))) {
      return fail("Please check the highlighted fields.", values, WRONG_PASSWORD, 401);
    }
    if ((await changeAdminEmail(db, admin.id, form.data.email)) === "taken") {
      return fail("Please check the highlighted fields.", values, { email: "Another admin account already uses this email." });
    }
    return { ok: true as const, message: `Your login email is now ${form.data.email}` };
  }

  if (intent === "password") {
    const form = readAdminForm(formData, adminPasswordChangeSchema);
    if (form.kind === "invalid") return data(withoutPasswords(form.failure), { status: 400 });
    if (await isLoginThrottled(db, ip)) return fail(THROTTLED, form.values, {}, 429);
    if (!(await confirmCurrent(form.data.currentPassword))) {
      return fail("Please check the highlighted fields.", form.values, WRONG_PASSWORD, 401);
    }
    await changeAdminPassword(db, request, admin.id, form.data.newPassword);
    return { ok: true as const, message: "Password changed. Any other devices have been signed out." };
  }

  return fail("Unknown action.", {});
}

/** A settings form that clears itself after a successful save. */
function useSettingsForm() {
  const fetcher = useFetcher<AdminActionResult>();
  const formRef = useRef<HTMLFormElement>(null);
  useSuccessToast(fetcher.data);
  useEffect(() => {
    if (fetcher.data?.ok) formRef.current?.reset();
  }, [fetcher.data]);
  const failure = fetcher.data && !fetcher.data.ok ? fetcher.data : undefined;
  return { fetcher, formRef, failure, busy: fetcher.state !== "idle" };
}

function EmailForm({ email }: { email: string }) {
  const { fetcher, formRef, failure, busy } = useSettingsForm();
  return (
    <fetcher.Form method="post" ref={formRef}>
      <FormSection title="Login email" description={`You currently sign in as ${email}.`}>
        <TextField idPrefix="email" failure={failure} name="email" label="New email" type="email" autoComplete="email" required />
        <TextField
          idPrefix="email"
          failure={failure}
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          hint="To confirm it’s you."
        />
        <FormError failure={failure} />
        <div>
          <Button type="submit" name="intent" value="email" disabled={busy}>
            Change email
          </Button>
        </div>
      </FormSection>
    </fetcher.Form>
  );
}

function PasswordForm() {
  const { fetcher, formRef, failure, busy } = useSettingsForm();
  return (
    <fetcher.Form method="post" ref={formRef}>
      <FormSection title="Password" description="Changing it signs you out on every other device.">
        <TextField
          idPrefix="password"
          failure={failure}
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
        />
        <TextField
          idPrefix="password"
          failure={failure}
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          hint={`At least ${ADMIN_PASSWORD_MIN_LENGTH} characters. A short sentence is easy to remember and hard to guess.`}
        />
        <TextField
          idPrefix="password"
          failure={failure}
          name="confirmPassword"
          label="Repeat new password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FormError failure={failure} />
        <div>
          <Button type="submit" name="intent" value="password" disabled={busy}>
            Change password
          </Button>
        </div>
      </FormSection>
    </fetcher.Form>
  );
}

export default function AdminSettings({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <AdminPageHeader title="Settings" description="Your login details for this dashboard." />
      <div className="grid max-w-xl gap-6">
        <EmailForm email={loaderData.email} />
        <PasswordForm />
      </div>
    </>
  );
}
