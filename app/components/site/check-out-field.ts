import { earliestCheckOut } from "~/lib/dates";

/**
 * After a new check-in date, keeps the same form's `out` date at least
 * `minNights` later: sets its earliest date and clears one that is too soon.
 * For the uncontrolled search forms (home search, /stays filter).
 */
export function keepCheckOutAfter(checkIn: HTMLInputElement, minNights: number): void {
  const checkOut = checkIn.form?.elements.namedItem("out");
  if (!(checkOut instanceof HTMLInputElement) || !checkIn.value) return;
  const earliest = earliestCheckOut(checkIn.value, minNights);
  checkOut.min = earliest;
  if (checkOut.value && checkOut.value < earliest) checkOut.value = "";
}
