/** Small pure helpers for the admin dashboard. */

/**
 * Where to go after logging in. Only paths inside the dashboard are allowed,
 * so a crafted `?next=` link can't send Sophiah to another site.
 */
export function safeAdminPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/admin") || value.startsWith("/admin/login")) return "/admin";
  if (/[\\\s]/.test(value) || value.startsWith("//")) return "/admin";
  if (value !== "/admin" && !/^\/admin[/?#]/.test(value)) return "/admin";
  return value;
}

/** URL slug from a name: "The Lennox Residence" → "the-lennox-residence". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** One entry per non-empty line, e.g. the amenities textarea. */
export function parseLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

// ------------------------------------------------------------- replies
// The dashboard replies through the admin's own email app or WhatsApp
// (no in-app email client, AGENTS.md section 1).

/**
 * Digits for a wa.me link. Kenyan local numbers (07…, 01…) get the 254
 * country code. Null when it doesn't look like a phone number.
 */
export function whatsappNumberFor(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  if (/^[1-9]\d{8,14}$/.test(digits)) return digits;
  return null;
}

export function emailReplyUrl(to: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function whatsappReplyUrl(phone: string, text: string): string | null {
  const number = whatsappNumberFor(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

export interface ReplyLink {
  kind: "email" | "whatsapp";
  href: string;
}

/**
 * Reply link for a booking request's single "Email or phone" field:
 * email when it contains "@", WhatsApp otherwise (AGENTS.md section 6).
 */
export function contactReplyLink(contact: string, subject: string, body: string): ReplyLink | null {
  const value = contact.trim();
  if (value.includes("@")) return { kind: "email", href: emailReplyUrl(value, subject, body) };
  const href = whatsappReplyUrl(value, body);
  return href ? { kind: "whatsapp", href } : null;
}

/** "22 Oct 2026, 11:20" in Nairobi time, from a SQLite CURRENT_TIMESTAMP (UTC). */
export function formatReceived(timestamp: string): string {
  const date = new Date(`${timestamp.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

/**
 * The ids in their new order after moving `id` to `toIndex` (clamped).
 * Used to reorder photos, FAQs and other sorted lists.
 */
export function moveItem<T>(ids: readonly T[], id: T, toIndex: number): T[] {
  if (!ids.includes(id)) return [...ids];
  const next = ids.filter((item) => item !== id);
  const to = Math.max(0, Math.min(toIndex, next.length));
  next.splice(to, 0, id);
  return next;
}
