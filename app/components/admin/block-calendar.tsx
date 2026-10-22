import { useEffect, useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";
import { useFetcher } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { addDays, formatShortDate, isIsoDate, nightsBetween, toIsoDate } from "~/lib/dates";
import type { AdminActionResult } from "~/lib/forms";

import { useSuccessToast } from "./form-fields";

export interface CalendarBlock {
  id: number;
  startDate: string;
  /** Exclusive: the first free night. */
  endDate: string;
  source: "admin" | "booking" | "ical";
  note: string | null;
}

const SOURCE_LABELS: Record<CalendarBlock["source"], string> = {
  admin: "Blocked by you",
  booking: "Confirmed booking",
  ical: "Calendar sync",
};

// DayPicker works with local Date objects; the app uses YYYY-MM-DD strings.
function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Range calendar to block or unblock nights, plus the list of current blocks. */
export function BlockCalendar({ blocks, today }: { blocks: CalendarBlock[]; today: string }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  // Clear the selection once a block/unblock has been saved.
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setFirst("");
      setLast("");
    }
  }, [fetcher.state, fetcher.data]);

  const selected: DateRange | undefined = isIsoDate(first)
    ? { from: toDate(first), to: isIsoDate(last) ? toDate(last) : toDate(first) }
    : undefined;

  function onSelect(range: DateRange | undefined): void {
    setFirst(range?.from ? toIso(range.from) : "");
    setLast(range?.to ? toIso(range.to) : range?.from ? toIso(range.from) : "");
  }

  const blocked = blocks.map((b) => ({ from: toDate(b.startDate), to: toDate(addDays(b.endDate, -1)) }));
  const failure = fetcher.data && !fetcher.data.ok ? fetcher.data : undefined;
  const busy = fetcher.state !== "idle";
  const nights = isIsoDate(first) && isIsoDate(last) && last >= first ? nightsBetween(first, last) + 1 : 0;

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <div className="w-fit rounded-xl bg-card p-2 ring-1 ring-foreground/10">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={selected}
            onSelect={onSelect}
            today={toDate(today)}
            disabled={{ before: toDate(today) }}
            defaultMonth={toDate(first || today)}
            modifiers={{ blocked }}
            modifiersClassNames={{
              blocked: "bg-destructive/12 [&_button]:text-destructive [&_button]:line-through",
            }}
            className="[--cell-size:--spacing(9)]"
          />
          <div className="flex gap-4 px-3 pt-1 pb-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-destructive/20" /> Blocked
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-primary" /> Selected
            </span>
          </div>
        </div>

        <fetcher.Form method="post" className="grid max-w-sm content-start gap-4">
          <p className="text-sm text-muted-foreground">
            Pick the first and last <strong>night</strong> on the calendar (or type the dates).
            Blocked nights can’t be requested on the website. A guest’s check-out day is not a
            night, so it stays free for the next arrival.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="block-first">First night</Label>
              <Input id="block-first" name="first" type="date" value={first} min={today} onChange={(e) => setFirst(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="block-last">Last night</Label>
              <Input id="block-last" name="last" type="date" value={last} min={first || undefined} onChange={(e) => setLast(e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="block-note">Note (optional)</Label>
            <Input id="block-note" name="note" maxLength={200} placeholder="e.g. Maintenance, owner stay" />
          </div>
          {nights > 0 && (
            <p className="text-sm">
              {nights} night{nights === 1 ? "" : "s"}: {formatShortDate(first)} to {formatShortDate(last)}
            </p>
          )}
          {failure && (
            <p role="alert" className="text-sm text-destructive">
              {failure.fieldErrors.first ?? failure.fieldErrors.last ?? failure.message}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="intent" value="block" disabled={busy}>
              Block these nights
            </Button>
            <Button type="submit" name="intent" value="unblock" variant="outline" disabled={busy}>
              Unblock these nights
            </Button>
          </div>
        </fetcher.Form>
      </div>

      <BlockList blocks={blocks} />
    </div>
  );
}

function BlockList({ blocks }: { blocks: CalendarBlock[] }) {
  return (
    <section>
      <h2 className="mb-3 font-heading text-xl">Blocked dates</h2>
      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing blocked from today onwards. Every night is open for requests.</p>
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nights</TableHead>
                <TableHead>Free again</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <BlockRow key={block.id} block={block} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function BlockRow({ block }: { block: CalendarBlock }) {
  const fetcher = useFetcher<AdminActionResult>();
  useSuccessToast(fetcher.data);
  const nights = nightsBetween(block.startDate, block.endDate);

  function confirmRemove(event: FormEvent<HTMLFormElement>): void {
    const what = block.source === "booking" ? "This was a confirmed booking. Unblock all of its nights?" : "Unblock all of these nights?";
    if (!window.confirm(what)) event.preventDefault();
  }

  return (
    <TableRow className={fetcher.state !== "idle" ? "opacity-50" : undefined}>
      <TableCell>
        {formatShortDate(block.startDate)} – {formatShortDate(addDays(block.endDate, -1))}
        <span className="text-muted-foreground"> · {nights} night{nights === 1 ? "" : "s"}</span>
      </TableCell>
      <TableCell>{formatShortDate(block.endDate)}</TableCell>
      <TableCell>
        <Badge variant={block.source === "booking" ? "default" : "outline"}>{SOURCE_LABELS[block.source]}</Badge>
        {block.note && <span className="ml-2 text-muted-foreground">{block.note}</span>}
      </TableCell>
      <TableCell className="text-right">
        {block.source !== "ical" && (
          <fetcher.Form method="post" onSubmit={confirmRemove}>
            <input type="hidden" name="blockId" value={block.id} />
            <Button type="submit" name="intent" value="remove-block" variant="ghost" size="sm">
              Unblock
            </Button>
          </fetcher.Form>
        )}
      </TableCell>
    </TableRow>
  );
}
