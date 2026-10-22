import { data } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure } from "~/.server/forms";
import { getContactMessages, parseHandledStatus, setContactMessageStatus } from "~/.server/queries/inbox";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { FilterTabs, HandledBadge, HandledToggle, ReplyButton } from "~/components/admin/inbox";
import { Badge } from "~/components/ui/badge";
import { emailReplyUrl, formatReceived, whatsappReplyUrl } from "~/lib/admin";
import { replyMessages } from "~/lib/site";

import type { Route } from "./+types/messages";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Messages  -  Pretty Fly Living admin" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const status = parseHandledStatus(new URL(request.url).searchParams.get("status"));
  return { messages: await getContactMessages(dbFromContext(context), status), status: status ?? "all" };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const status = parseHandledStatus(formData.get("status"));
  if (!Number.isSafeInteger(id) || !status) return data(formFailure("Unknown action.", {}), { status: 400 });
  await setContactMessageStatus(dbFromContext(context), id, status);
  return { ok: true as const, message: status === "handled" ? "Marked as handled" : "Marked as new" };
}

export default function AdminMessages({ loaderData }: Route.ComponentProps) {
  const { messages, status } = loaderData;
  return (
    <>
      <AdminPageHeader title="Messages" description="Enquiries from the contact form." />
      <FilterTabs
        active={status}
        options={[
          { value: "all", label: "All" },
          { value: "new", label: "New" },
          { value: "handled", label: "Handled" },
        ]}
      />
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages here.</p>
      ) : (
        <ul className="grid gap-4">
          {messages.map((message) => {
            const whatsapp = message.phone ? whatsappReplyUrl(message.phone, replyMessages.contact(message.name)) : null;
            return (
              <li key={message.id} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {message.name}
                      <HandledBadge status={message.status} />
                      <Badge variant="secondary">{message.enquiryType}</Badge>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {message.email}
                      {message.phone && ` · ${message.phone}`} · {formatReceived(message.createdAt)}
                    </p>
                  </div>
                  <HandledToggle id={message.id} status={message.status} />
                </div>
                <p className="mt-4 text-sm whitespace-pre-wrap">{message.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ReplyButton
                    link={{
                      kind: "email",
                      href: emailReplyUrl(message.email, `Re: ${message.enquiryType}`, replyMessages.contact(message.name)),
                    }}
                  />
                  {whatsapp && <ReplyButton link={{ kind: "whatsapp", href: whatsapp }} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
