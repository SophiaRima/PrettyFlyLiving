import { requireAdmin } from "~/.server/auth";
import { renderGuideMarkdown } from "~/.server/markdown";

import type { Route } from "./+types/guide-preview";

/** POST-only: renders guide Markdown for the editor's Preview tab. */
export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const body = String((await request.formData()).get("bodyMd") ?? "").slice(0, 20_000);
  return { html: renderGuideMarkdown(body) };
}
