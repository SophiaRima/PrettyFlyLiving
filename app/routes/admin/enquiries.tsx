import { data } from "react-router";

import { requireAdmin } from "~/.server/auth";
import { formFailure } from "~/.server/forms";
import { getOwnerEnquiries, parseHandledStatus, setOwnerEnquiryStatus } from "~/.server/queries/inbox";
import { dbFromContext } from "~/.server/request";
import { AdminPageHeader } from "~/components/admin/admin-shell";
import { FilterTabs, HandledBadge, HandledToggle, ReplyButton } from "~/components/admin/inbox";
import { Badge } from "~/components/ui/badge";
import { emailReplyUrl, formatReceived, whatsappReplyUrl } from "~/lib/admin";
import { replyMessages } from "~/lib/site";

import type { Route } from "./+types/enquiries";

export function meta(): Route.MetaDescriptors {
  return [{ title: "Owner enquiries  -  Pretty Fly Living admin" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  requireAdmin(context);
  const status = parseHandledStatus(new URL(request.url).searchParams.get("status"));
  return { enquiries: await getOwnerEnquiries(dbFromContext(context), status), status: status ?? "all" };
}

export async function action({ request, context }: Route.ActionArgs) {
  requireAdmin(context);
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const status = parseHandledStatus(formData.get("status"));
  if (!Number.isSafeInteger(id) || !status) return data(formFailure("Unknown action.", {}), { status: 400 });
  await setOwnerEnquiryStatus(dbFromContext(context), id, status);
  return { ok: true as const, message: status === "handled" ? "Marked as handled" : "Marked as new" };
}

/** One answer from the form; older enquiries don't have the newer answers. */
function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function AdminEnquiries({ loaderData }: Route.ComponentProps) {
  const { enquiries, status } = loaderData;
  return (
    <>
      <AdminPageHeader title="Owner enquiries" description="Property owners asking about management, from the Property Management page." />
      <FilterTabs
        active={status}
        options={[
          { value: "all", label: "All" },
          { value: "new", label: "New" },
          { value: "handled", label: "Handled" },
        ]}
      />
      {enquiries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No owner enquiries here.</p>
      ) : (
        <ul className="grid gap-4">
          {enquiries.map((enquiry) => {
            const opening = replyMessages.owner(enquiry.name, enquiry.propertyArea);
            const whatsapp = whatsappReplyUrl(enquiry.phone, opening);
            return (
              <li key={enquiry.id} className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {enquiry.name}
                      <HandledBadge status={enquiry.status} />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {enquiry.email} · {enquiry.phone} · {formatReceived(enquiry.createdAt)}
                    </p>
                  </div>
                  <HandledToggle id={enquiry.id} status={enquiry.status} />
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  <Detail label="Location" value={enquiry.propertyArea} />
                  <Detail label="Units" value={enquiry.units} />
                  <Detail label="Property type" value={enquiry.propertyType} />
                  <Detail label="Same location" value={enquiry.sameLocation} />
                  <Detail label="Furnishing" value={enquiry.furnishing} />
                  <Detail label="Listed online" value={enquiry.listedOnline} />
                  <Detail label="Preferred contact" value={enquiry.preferredContact} />
                </dl>
                {enquiry.listingLinks && (
                  <div className="mt-3 text-sm">
                    <p className="text-xs text-muted-foreground">Listing links</p>
                    <p className="break-all whitespace-pre-wrap">{enquiry.listingLinks}</p>
                  </div>
                )}
                {enquiry.supportNeeded && enquiry.supportNeeded.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Support needed</p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {enquiry.supportNeeded.map((item) => (
                        <li key={item}>
                          <Badge variant="secondary">{item}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {enquiry.message && <p className="mt-4 text-sm whitespace-pre-wrap">{enquiry.message}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <ReplyButton
                    link={{ kind: "email", href: emailReplyUrl(enquiry.email, "Property management with Pretty Fly Living", opening) }}
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
