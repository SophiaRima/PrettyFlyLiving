import { data } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure, readAdminForm } from "~/.server/forms";
import {
  createBlock,
  deleteBlock,
  getBlocks,
  isRangeBlocked,
  unblockRange,
} from "~/.server/queries/availability";
import { getPropertyById } from "~/.server/queries/properties";
import { dbFromContext, idParam, nairobiToday } from "~/.server/request";
import { BlockCalendar } from "~/components/admin/block-calendar";
import { addDays } from "~/lib/dates";
import { calendarRangeSchema } from "~/lib/validation";

import type { Route } from "./+types/property-calendar";

export async function loader({ params, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const today = nairobiToday();
  return { today, blocks: await getBlocks(dbFromContext(context), idParam(params.id), today) };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  requireAdmin(context);
  const db = dbFromContext(context);
  const property = await getPropertyById(db, idParam(params.id));
  if (!property) throw new Response("Not found", { status: 404 });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "remove-block") {
    await deleteBlock(db, property.id, Number(formData.get("blockId")));
    return { ok: true as const, message: "Dates unblocked" };
  }

  const form = readAdminForm(formData, calendarRangeSchema);
  if (form.kind === "invalid") return data(form.failure, { status: 400 });
  const start = form.data.first;
  const end = addDays(form.data.last, 1);

  if (intent === "block") {
    if (await isRangeBlocked(db, property.id, start, end)) {
      return data(
        formFailure("Some of these nights are already blocked. Unblock them first, or pick other dates.", form.values),
        { status: 400 },
      );
    }
    await createBlock(db, { propertyId: property.id, startDate: start, endDate: end, source: "admin", note: form.data.note });
    return { ok: true as const, message: "Dates blocked" };
  }

  if (intent === "unblock") {
    const changed = await unblockRange(db, property.id, start, end);
    return changed > 0
      ? { ok: true as const, message: "Dates unblocked" }
      : data(formFailure("None of these nights were blocked.", form.values), { status: 400 });
  }

  return data(formFailure("Unknown action.", form.values), { status: 400 });
}

export default function AdminPropertyCalendar({ loaderData }: Route.ComponentProps) {
  return <BlockCalendar blocks={loaderData.blocks} today={loaderData.today} />;
}
