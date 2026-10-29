import { useState } from "react";

import {
  addMonths,
  canPickCheckOut,
  daysInMonth,
  firstWeekdayOfMonth,
  formatMonthLabel,
  nextStayDates,
  toIsoDate,
  yearMonthOf,
  type StayDates,
} from "~/lib/dates";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface AvailabilityCalendarProps {
  /** Today in Nairobi (YYYY-MM-DD), from the loader. */
  today: string;
  /** Availability is known up to (not including) this date. */
  until: string;
  /** Unavailable nights (YYYY-MM-DD). */
  blocked: ReadonlySet<string>;
  dates: StayDates;
  onChange: (dates: StayDates) => void;
}

/**
 * The concept's `.calendar` grid with month navigation added (monthly stays
 * span several months). The first tap picks check-in, the next later one
 * check-out (client, 2026-10-29), and the nights between are highlighted.
 * Past and blocked days are disabled, except a blocked day that can be the
 * check-out (the guest leaves that day).
 */
export function AvailabilityCalendar({
  today,
  until,
  blocked,
  dates,
  onChange,
}: AvailabilityCalendarProps) {
  const { checkIn, checkOut } = dates;
  const current = yearMonthOf(today);
  const [shown, setShown] = useState(current);
  const isCurrentMonth =
    shown.year === current.year && shown.month === current.month;
  const next = addMonths(shown, 1);
  const isLastMonth = toIsoDate(next.year, next.month, 1) >= until;
  const leading = firstWeekdayOfMonth(shown);
  const days = daysInMonth(shown);
  const monthLabel = formatMonthLabel(shown);

  return (
    <>
      <div className="calendar-head">
        <button
          type="button"
          aria-label="Previous month"
          disabled={isCurrentMonth}
          onClick={() => setShown(addMonths(shown, -1))}
        >
          ‹
        </button>
        <strong aria-live="polite">{monthLabel}</strong>
        <button
          type="button"
          aria-label="Next month"
          disabled={isLastMonth}
          onClick={() => setShown(addMonths(shown, 1))}
        >
          ›
        </button>
      </div>
      <div className="calendar">
        {DAY_LABELS.map((label, i) => (
          <span className="day-label" key={i}>
            {label}
          </span>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = toIsoDate(shown.year, shown.month, i + 1);
          // Past days and days beyond the known window can't be chosen.
          const isPast = date < today || date >= until;
          const isBlocked = !isPast && blocked.has(date);
          const unavailable = isPast || (isBlocked && !canPickCheckOut(dates, date, blocked));
          const isEnd = date === checkIn || date === checkOut;
          const inRange = checkOut !== "" && date > checkIn && date < checkOut;
          const classes = [
            isPast ? "past" : "",
            isBlocked ? "blocked" : "",
            isEnd ? "selected" : "",
            inRange ? "in-range" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const role = date === checkIn ? ", check-in" : date === checkOut ? ", check-out" : "";
          const status = !isBlocked ? "" : unavailable ? ", unavailable" : ", available as check-out";
          return (
            <button
              key={date}
              type="button"
              className={classes || undefined}
              disabled={unavailable}
              data-date={date}
              // Starts with the visible day number, so the spoken name matches it.
              aria-label={`${i + 1} ${monthLabel}${status}${role}`}
              aria-pressed={isEnd}
              onClick={() => onChange(nextStayDates(dates, date, blocked))}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </>
  );
}
