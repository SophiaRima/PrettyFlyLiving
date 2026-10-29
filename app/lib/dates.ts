/**
 * Date helpers for YYYY-MM-DD strings (Nairobi local dates, no time zones).
 * All arithmetic uses UTC so results never shift with the runtime's zone.
 */

export interface YearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function yearMonthOf(isoDate: string): YearMonth {
  const [year, month] = isoDate.split("-").map(Number);
  return { year, month };
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function daysInMonth({ year, month }: YearMonth): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = Sunday … 6 = Saturday, matching the concept's S M T W T F S grid. */
export function firstWeekdayOfMonth({ year, month }: YearMonth): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

export function formatMonthLabel({ year, month }: YearMonth): string {
  return new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

// ------------------------------------------------------------ stay ranges
// Stays and availability blocks are half-open ranges [start, end): `end` is
// the check-out day, which is free for the next guest's check-in.

const DAY_MS = 86_400_000;

function toUtcMs(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(toUtcMs(isoDate) + days * DAY_MS);
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Nights between check-in and check-out (negative if reversed). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((toUtcMs(checkOut) - toUtcMs(checkIn)) / DAY_MS);
}

/** True when two half-open ranges share at least one night. */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Every night in [start, end), limited to the window [from, to). Used to turn
 * availability blocks into the days shown on the calendar.
 */
export function expandNights(start: string, end: string, from: string, to: string): string[] {
  const nights: string[] = [];
  let night = start > from ? start : from;
  const stop = end < to ? end : to;
  while (night < stop) {
    nights.push(night);
    night = addDays(night, 1);
  }
  return nights;
}

/**
 * Why a requested stay is not valid, or null when it is. Checked on the
 * server before a booking request is saved.
 */
export function stayRangeError(
  checkIn: string,
  checkOut: string,
  today: string,
  minNights: number,
): string | null {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return "Please choose valid dates.";
  if (checkIn < today) return "Your check-in date can’t be in the past.";
  if (checkOut <= checkIn) return "Please choose a check-out date after your check-in date.";
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < minNights) {
    return `This stay has a minimum of ${minNights} night${minNights === 1 ? "" : "s"}.`;
  }
  return null;
}

/** The dates picked on a stay's calendar; "" while not chosen yet. */
export interface StayDates {
  checkIn: string;
  checkOut: string;
}

/** True when any night in [checkIn, checkOut) is blocked. */
export function rangeHasBlockedNight(
  checkIn: string,
  checkOut: string,
  blocked: ReadonlySet<string>,
): boolean {
  for (let night = checkIn; night < checkOut; night = addDays(night, 1)) {
    if (blocked.has(night)) return true;
  }
  return false;
}

/**
 * True when a tap on `date` would set the check-out: a check-in is picked
 * but no check-out yet, and every night from check-in up to `date` is free.
 * The check-out day's own night may be blocked (the guest leaves that day).
 */
export function canPickCheckOut(
  current: StayDates,
  date: string,
  blocked: ReadonlySet<string>,
): boolean {
  return (
    current.checkIn !== "" &&
    current.checkOut === "" &&
    date > current.checkIn &&
    !rangeHasBlockedNight(current.checkIn, date, blocked)
  );
}

/**
 * The dates after a tap on the calendar: the first tap picks check-in, the
 * next later one check-out. Any other tap (both already picked, a day on or
 * before check-in, or a stay across a blocked night) starts again with the
 * tapped day as check-in, unless that night is blocked.
 */
export function nextStayDates(
  current: StayDates,
  date: string,
  blocked: ReadonlySet<string>,
): StayDates {
  if (canPickCheckOut(current, date, blocked)) return { checkIn: current.checkIn, checkOut: date };
  if (blocked.has(date)) return current;
  return { checkIn: date, checkOut: "" };
}

/** "12 Nov 2026", for emails and messages. */
export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(toUtcMs(isoDate)));
}

/**
 * What is left of the block [start, end) after removing [cutStart, cutEnd):
 * nothing, one shorter range, or two ranges when the cut is in the middle.
 * Used to unblock part of an availability block.
 */
export function subtractRange(
  start: string,
  end: string,
  cutStart: string,
  cutEnd: string,
): { start: string; end: string }[] {
  if (!rangesOverlap(start, end, cutStart, cutEnd)) return [{ start, end }];
  const pieces: { start: string; end: string }[] = [];
  if (start < cutStart) pieces.push({ start, end: cutStart });
  if (cutEnd < end) pieces.push({ start: cutEnd, end });
  return pieces;
}
