import { data, Form, redirect, useNavigation, useSearchParams } from "react-router";

import {
  authenticate,
  clearLoginFailures,
  clientIp,
  createSession,
  getSession,
  isLoginThrottled,
  recordLoginFailure,
} from "~/.server/auth";
import { dbFromContext } from "~/.server/request";
import { verifyTurnstile } from "~/.server/turnstile";
import { Turnstile } from "~/components/site/turnstile";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cloudflareContext } from "~/context";
import { safeAdminPath } from "~/lib/admin";
import { TURNSTILE_FIELD } from "~/lib/forms";
import { adminLoginSchema } from "~/lib/validation";

import type { Route } from "./+types/login";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Sign in  -  Pretty Fly Living admin" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  if (await getSession(dbFromContext(context), request)) {
    throw redirect(safeAdminPath(new URL(request.url).searchParams.get("next")));
  }
  return { turnstileSiteKey: context.get(cloudflareContext).env.TURNSTILE_SITE_KEY };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const db = dbFromContext(context);
  const ip = clientIp(request);
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const fail = (message: string, status = 400) => data({ message, email }, { status });

  if (await isLoginThrottled(db, ip)) {
    return fail("Too many failed attempts. Please wait 15 minutes and try again.", 429);
  }
  if (!(await verifyTurnstile(request, formData.get(TURNSTILE_FIELD), "login", env))) {
    return fail("Please complete the security check and try again.");
  }
  const parsed = adminLoginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return fail("Please enter your email and password.");

  const user = await authenticate(db, parsed.data.email, parsed.data.password);
  if (!user) {
    await recordLoginFailure(db, ip);
    return fail("That email and password don’t match.", 401);
  }

  await clearLoginFailures(db, ip);
  return redirect(safeAdminPath(String(formData.get("next") ?? "")), {
    headers: { "Set-Cookie": await createSession(db, user.id) },
  });
}

export default function AdminLogin({ loaderData, actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const signingIn = useNavigation().state !== "idle";

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <img
            src="/brand/logo.png"
            alt="Pretty Fly Living"
            width={109}
            height={78}
            className="mx-auto mb-2 h-16 w-auto"
          />
          <CardTitle className="text-2xl">Admin sign in</CardTitle>
          <CardDescription>Manage stays, bookings and site content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="grid gap-4">
            <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                defaultValue={actionData?.email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Turnstile siteKey={loaderData.turnstileSiteKey} action="login" resetKey={actionData} />
            {actionData && (
              <p role="alert" className="text-sm text-destructive">
                {actionData.message}
              </p>
            )}
            <Button type="submit" size="lg" disabled={signingIn}>
              {signingIn ? "Signing in…" : "Sign in"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
