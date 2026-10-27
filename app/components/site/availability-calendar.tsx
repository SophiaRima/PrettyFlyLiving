import { useState } from "react";

import {
  addMonths,
  daysInMonth,
  firstWeekdayOfMonth,
  formatMonthLabel,
  toIsoDate,
  yearMonthOf,
} from "~/lib/dates";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface AvailabilityCalendarProps {
  /** Today in Nairobi (YYYY-MM-DD), from the loader. */
  today: string;
  /** Availability is known up to (not including) this date. */
  until: string;
  /** Unavailable nights (YYYY-MM-DD). */
  blocked: ReadonlySet<string>;
  selected: string;
  onSelect: (date: string) => void;
}

/**
 * The concept's `.calendar` grid with month navigation added (monthly stays
 * span several months). Past and blocked days are disabled.
 */
export function AvailabilityCalendar({
  today,
  until,
  blocked,
  selected,
  onSelect,
}: AvailabilityCalendarProps) {
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
          const unavailable = isPast || isBlocked;
          const classes = [
            isPast ? "past" : "",
            isBlocked ? "blocked" : "",
            date === selected ? "selected" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={date}
              type="button"
              className={classes || undefined}
              disabled={unavailable}
              data-date={date}
              // Starts with the visible day number, so the spoken name matches it.
              aria-label={`${i + 1} ${monthLabel}${isBlocked ? ", unavailable" : ""}`}
              aria-pressed={date === selected}
              onClick={() => onSelect(date)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </>
  );
}
