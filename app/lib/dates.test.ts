import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  expandNights,
  daysInMonth,
  firstWeekdayOfMonth,
  formatMonthLabel,
  isIsoDate,
  nextStayDates,
  nightsBetween,
  rangeHasBlockedNight,
  rangesOverlap,
  stayRangeError,
  subtractRange,
  toIsoDate,
  yearMonthOf,
} from "./dates";

describe("isIsoDate", () => {
  it("accepts real calendar dates", () => {
    expect(isIsoDate("2026-10-21")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true);
  });

  it("rejects malformed or impossible dates", () => {
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("21/10/2026")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });
});

describe("month helpers", () => {
  it("pads dates", () => {
    expect(toIsoDate(2026, 3, 7)).toBe("2026-03-07");
  });

  it("reads the month of a date", () => {
    expect(yearMonthOf("2026-10-21")).toEqual({ year: 2026, month: 10 });
  });

  it("moves across year boundaries", () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths({ year: 2026, month: 10 }, 15)).toEqual({ year: 2028, month: 1 });
  });

  it("knows month lengths, including leap years", () => {
    expect(daysInMonth({ year: 2026, month: 2 })).toBe(28);
    expect(daysInMonth({ year: 2028, month: 2 })).toBe(29);
    expect(daysInMonth({ year: 2026, month: 10 })).toBe(31);
  });

  it("finds the weekday the month starts on (0 = Sunday)", () => {
    expect(firstWeekdayOfMonth({ year: 2026, month: 10 })).toBe(4); // Thu 1 Oct 2026
    expect(firstWeekdayOfMonth({ year: 2026, month: 11 })).toBe(0); // Sun 1 Nov 2026
  });

  it("labels the month for the calendar header", () => {
    expect(formatMonthLabel({ year: 2026, month: 10 })).toBe("October 2026");
  });
});

describe("addDays and nightsBetween", () => {
  it("crosses month, year and leap-day boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts nights", () => {
    expect(nightsBetween("2026-11-01", "2026-12-01")).toBe(30);
    expect(nightsBetween("2026-11-01", "2026-11-01")).toBe(0);
    expect(nightsBetween("2026-11-02", "2026-11-01")).toBe(-1);
  });
});

describe("rangesOverlap (half-open ranges)", () => {
  it("detects shared nights", () => {
    expect(rangesOverlap("2026-11-01", "2026-11-10", "2026-11-09", "2026-11-20")).toBe(true);
    expect(rangesOverlap("2026-11-05", "2026-11-06", "2026-11-01", "2026-11-30")).toBe(true);
  });

  it("lets a check-out day be the next check-in day", () => {
    expect(rangesOverlap("2026-11-01", "2026-11-10", "2026-11-10", "2026-11-20")).toBe(false);
    expect(rangesOverlap("2026-11-10", "2026-11-20", "2026-11-01", "2026-11-10")).toBe(false);
  });
});

describe("expandNights", () => {
  it("lists each night, excluding the check-out day", () => {
    expect(expandNights("2026-11-29", "2026-12-02", "2026-01-01", "2027-01-01")).toEqual([
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
    ]);
  });

  it("clips to the window", () => {
    expect(expandNights("2026-10-01", "2026-12-01", "2026-11-29", "2026-11-30")).toEqual([
      "2026-11-29",
    ]);
    expect(expandNights("2026-10-01", "2026-10-05", "2026-11-01", "2026-12-01")).toEqual([]);
  });
});

describe("stayRangeError", () => {
  const today = "2026-10-22";

  it("accepts a valid stay", () => {
    expect(stayRangeError("2026-11-01", "2026-12-01", today, 30)).toBeNull();
    expect(stayRangeError(today, "2026-11-21", today, 30)).toBeNull();
  });

  it("rejects bad, past, reversed and short stays", () => {
    expect(stayRangeError("2026-11-31", "2026-12-31", today, 30)).toMatch(/valid dates/);
    expect(stayRangeError("2026-10-21", "2026-12-01", today, 30)).toMatch(/past/);
    expect(stayRangeError("2026-11-10", "2026-11-10", today, 1)).toMatch(/after your check-in/);
    expect(stayRangeError("2026-11-01", "2026-11-30", today, 30)).toMatch(/minimum of 30 nights/);
  });
});

describe("subtractRange", () => {
  const block = ["2026-11-01", "2026-12-01"] as const;

  it("keeps the block when the cut doesn't touch it", () => {
    expect(subtractRange(...block, "2026-12-01", "2026-12-05")).toEqual([
      { start: "2026-11-01", end: "2026-12-01" },
    ]);
  });

  it("removes the whole block when the cut covers it", () => {
    expect(subtractRange(...block, "2026-10-20", "2026-12-10")).toEqual([]);
    expect(subtractRange(...block, ...block)).toEqual([]);
  });

  it("trims the start or the end", () => {
    expect(subtractRange(...block, "2026-10-25", "2026-11-05")).toEqual([
      { start: "2026-11-05", end: "2026-12-01" },
    ]);
    expect(subtractRange(...block, "2026-11-20", "2026-12-03")).toEqual([
      { start: "2026-11-01", end: "2026-11-20" },
    ]);
  });

  it("splits the block when the cut is in the middle", () => {
    expect(subtractRange(...block, "2026-11-10", "2026-11-12")).toEqual([
      { start: "2026-11-01", end: "2026-11-10" },
      { start: "2026-11-12", end: "2026-12-01" },
    ]);
  });
});

describe("calendar date picking", () => {
  const none = { checkIn: "", checkOut: "" };
  const blocked = new Set(["2026-11-20", "2026-11-21"]);

  it("finds blocked nights in a stay, but not on the check-out day", () => {
    expect(rangeHasBlockedNight("2026-11-01", "2026-11-25", blocked)).toBe(true);
    expect(rangeHasBlockedNight("2026-11-01", "2026-11-20", blocked)).toBe(false);
  });

  it("picks check-in first, then a later day as check-out", () => {
    const first = nextStayDates(none, "2026-11-01", blocked);
    expect(first).toEqual({ checkIn: "2026-11-01", checkOut: "" });
    expect(nextStayDates(first, "2026-11-15", blocked)).toEqual({ checkIn: "2026-11-01", checkOut: "2026-11-15" });
  });

  it("allows a blocked day as check-out when the nights before it are free", () => {
    expect(nextStayDates({ checkIn: "2026-11-01", checkOut: "" }, "2026-11-20", blocked)).toEqual({
      checkIn: "2026-11-01",
      checkOut: "2026-11-20",
    });
  });

  it("starts again on an earlier day, after a full pick, or across blocked nights", () => {
    const picking = { checkIn: "2026-11-10", checkOut: "" };
    expect(nextStayDates(picking, "2026-11-05", blocked)).toEqual({ checkIn: "2026-11-05", checkOut: "" });
    expect(nextStayDates(picking, "2026-11-10", blocked)).toEqual({ checkIn: "2026-11-10", checkOut: "" });
    expect(nextStayDates(picking, "2026-11-25", blocked)).toEqual({ checkIn: "2026-11-25", checkOut: "" });
    const picked = { checkIn: "2026-11-01", checkOut: "2026-11-15" };
    expect(nextStayDates(picked, "2026-12-01", blocked)).toEqual({ checkIn: "2026-12-01", checkOut: "" });
  });

  it("ignores a blocked day that can't be a check-out", () => {
    const picked = { checkIn: "2026-11-01", checkOut: "2026-11-15" };
    expect(nextStayDates(picked, "2026-11-21", blocked)).toBe(picked);
    expect(nextStayDates(none, "2026-11-20", blocked)).toBe(none);
  });
});
