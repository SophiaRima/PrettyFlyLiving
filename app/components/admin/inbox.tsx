import { CheckIcon, MailIcon, MessageCircleIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import type { FormEvent } from "react";
import { Link, useFetcher } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import type { ReplyLink } from "~/lib/admin";
import type { BookingStatus } from "~/lib/constants";
import type { AdminActionResult } from "~/lib/forms";
import { cn } from "~/lib/utils";

import { useSuccessToast } from "./form-fields";

const BOOKING_STATUS: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  new: { label: "New", variant: "default" },
  contacted: { label: "Contacted", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "outline" },
  declined: { label: "Declined", variant: "destructive" },
};

export const bookingStatusLabel = (status: BookingStatus): string => BOOKING_STATUS[status].label;

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { label, variant } = BOOKING_STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function HandledBadge({ status }: { status: "new" | "handled" }) {
  return status === "new" ? <Badge>New</Badge> : <Badge variant="outline">Handled</Badge>;
}

/** Filter row: links that set ?status= (or another param), with optional counts. "all" clears it. */
export function FilterTabs({
  options,
  active,
  param = "status",
}: {
  options: { value: string; label: string; count?: number }[];
  active: string;
  param?: string;
}) {
  return (
    <nav aria-label="Filter" className="mb-6 flex gap-1 overflow-x-auto border-b">
      {options.map((option) => (
        <Link
          key={option.value}
          to={option.value === "all" ? "?" : `?${param}=${option.value}`}
          aria-current={option.value === active ? "page" : undefined}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors",
            option.value === active
              ? "border-primary font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{option.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

/** Opens the admin's own email app or WhatsApp with a prefilled reply. */
export function ReplyButton({ link, label }: { link: ReplyLink; label?: string }) {
  const Icon = link.kind === "email" ? MailIcon : MessageCircleIcon;
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
      <Icon data-icon="inline-start" />
      {label ?? (link.kind === "email" ? "Reply by email" : "Reply on WhatsApp")}
    </a>
  );
}

/** Deletes one inbox item (intent=delete) after a confirm prompt. */
export function DeleteItemButton({
  id,
  confirmMessage,
  itemName,
  size = "default",
}: {
  id: number;
  confirmMessage: string;
  /** For screen readers, e.g. "request from Amina". */
  itemName?: string;
  size?: "default" | "sm";
}) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    if (!window.confirm(confirmMessage)) event.preventDefault();
  }

  return (
    <fetcher.Form method="post" onSubmit={onSubmit}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        name="intent"
        value="delete"
        variant="ghost"
        size={size}
        disabled={fetcher.state !== "idle"}
        aria-label={itemName ? `Delete ${itemName}` : undefined}
        className="text-destructive"
      >
        <Trash2Icon data-icon="inline-start" />
        Delete
      </Button>
    </fetcher.Form>
  );
}

/** Mark handled + Delete, top right of a message or enquiry card. */
export function InboxItemActions({ id, status, confirmDelete }: { id: number; status: "new" | "handled"; confirmDelete: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      <HandledToggle id={id} status={status} />
      <DeleteItemButton id={id} confirmMessage={confirmDelete} />
    </div>
  );
}

/** Marks a message or enquiry handled (or new again). */
export function HandledToggle({ id, status }: { id: number; status: "new" | "handled" }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const next = status === "new" ? "handled" : "new";
  return (
    <fetcher.Form method="post">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />
      <Button type="submit" variant={status === "new" ? "default" : "ghost"} disabled={fetcher.state !== "idle"}>
        {status === "new" ? <CheckIcon data-icon="inline-start" /> : <RotateCcwIcon data-icon="inline-start" />}
        {status === "new" ? "Mark handled" : "Mark as new"}
      </Button>
    </fetcher.Form>
  );
}
