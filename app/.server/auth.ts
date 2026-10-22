import { and, count, eq, gt, lt, ne, sql } from "drizzle-orm";
import { redirect, type RouterContextProvider } from "react-router";

import { adminUserContext, type AdminUser } from "~/context";

import type { Database } from "./db/client";
import { adminUsers, loginAttempts, sessions } from "./db/schema";
import { hashPassword, verifyPassword } from "./password";

/*
 * Admin sessions (AGENTS.md section 9): a 32-byte random token in an
 * HttpOnly cookie. D1 only stores its SHA-256 hash, with a 30-day sliding
 * expiry. Logout deletes the row.
 */

const SESSION_COOKIE = "pfl_admin_session";
const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Extend the expiry at most once a day, to save D1 writes. */
const REFRESH_AFTER_MS = DAY_MS;

const LOGIN_MAX_FAILURES = 5;
const LOGIN_WINDOW = "-15 minutes";

/**
 * Valid-format hash of a random password. Checked when the email is unknown
 * so a login takes the same time whether or not the account exists.
 */
const DUMMY_HASH =
  "pbkdf2-sha256$100000$3q2+7wAAAAAAAAAAAAAAAA==$7cq0eJv3yS1nV5VvM0KQyq3Bv6pX9mW0FQm8bN0kH1A=";

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function sessionCookie(token: string, maxAgeSeconds: number): string {
  return `${SESSION_COOKIE}=${token}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function readSessionToken(request: Request): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return rest.join("=") || null;
  }
  return null;
}

/** Visitor IP as seen by Cloudflare; "local" in `npm run dev`. */
export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "local";
}

/** True when the request's Origin header is this site (CSRF check for admin POSTs). */
export function isSameOrigin(request: Request): boolean {
  return request.headers.get("Origin") === new URL(request.url).origin;
}

// ------------------------------------------------------------------ sessions

/** Starts a session and returns its Set-Cookie header. */
export async function createSession(db: Database, userId: number): Promise<string> {
  const token = newToken();
  await db.insert(sessions).values({
    id: await sha256Hex(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_DAYS * DAY_MS).toISOString(),
  });
  return sessionCookie(token, SESSION_DAYS * 24 * 60 * 60);
}

export interface SessionCheck {
  user: AdminUser;
  /** Set-Cookie header when the expiry was extended. */
  refreshedCookie?: string;
}

/** The signed-in admin for this request, or null. Slides the expiry forward. */
export async function getSession(db: Database, request: Request): Promise<SessionCheck | null> {
  const token = readSessionToken(request);
  if (!token || token.length > 100) return null;

  const id = await sha256Hex(token);
  const [row] = await db
    .select({ userId: sessions.userId, expiresAt: sessions.expiresAt, email: adminUsers.email })
    .from(sessions)
    .innerJoin(adminUsers, eq(adminUsers.id, sessions.userId))
    .where(eq(sessions.id, id))
    .limit(1);
  if (!row) return null;

  const now = Date.now();
  const expiresAt = Date.parse(row.expiresAt);
  if (!(expiresAt > now)) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  const user = { id: row.userId, email: row.email };
  const fullExpiry = now + SESSION_DAYS * DAY_MS;
  if (fullExpiry - expiresAt < REFRESH_AFTER_MS) return { user };

  await db
    .update(sessions)
    .set({ expiresAt: new Date(fullExpiry).toISOString() })
    .where(eq(sessions.id, id));
  return { user, refreshedCookie: sessionCookie(token, SESSION_DAYS * 24 * 60 * 60) };
}

/** Ends the current session and returns the Set-Cookie header that clears it. */
export async function destroySession(db: Database, request: Request): Promise<string> {
  const token = readSessionToken(request);
  if (token) await db.delete(sessions).where(eq(sessions.id, await sha256Hex(token)));
  // Expired rows from abandoned sessions are tidied up here too.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date().toISOString()));
  return sessionCookie("", 0);
}

/**
 * The admin set by the admin layout's middleware. Every admin loader and
 * action calls this, so a route can never run without a valid session.
 */
export function requireAdmin(context: Readonly<RouterContextProvider>): AdminUser {
  const user = context.get(adminUserContext);
  if (!user) throw redirect("/admin/login");
  return user;
}

// --------------------------------------------------------------------- login

/** True after 5 failed logins from this IP in the last 15 minutes. */
export async function isLoginThrottled(db: Database, ip: string): Promise<boolean> {
  const [row] = await db
    .select({ failures: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.ip, ip),
        gt(loginAttempts.attemptedAt, sql`datetime('now', ${LOGIN_WINDOW})`),
      ),
    );
  return (row?.failures ?? 0) >= LOGIN_MAX_FAILURES;
}

export async function recordLoginFailure(db: Database, ip: string): Promise<void> {
  await db.batch([
    db.insert(loginAttempts).values({ ip }),
    db.delete(loginAttempts).where(lt(loginAttempts.attemptedAt, sql`datetime('now', '-1 day')`)),
  ]);
}

export async function clearLoginFailures(db: Database, ip: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.ip, ip));
}

/** The admin whose email and password match, or null. */
export async function authenticate(
  db: Database,
  email: string,
  password: string,
): Promise<AdminUser | null> {
  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return user && valid ? { id: user.id, email: user.email } : null;
}

// ------------------------------------------------------------------ account

/** True when `password` is this admin's current password. */
export async function checkAdminPassword(
  db: Database,
  userId: number,
  password: string,
): Promise<boolean> {
  const [user] = await db
    .select({ passwordHash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return Boolean(user) && valid;
}

/** Changes the login email; "taken" when another admin already uses it. */
export async function changeAdminEmail(
  db: Database,
  userId: number,
  email: string,
): Promise<"changed" | "taken"> {
  const [other] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.email, email), ne(adminUsers.id, userId)))
    .limit(1);
  if (other) return "taken";
  await db.update(adminUsers).set({ email }).where(eq(adminUsers.id, userId));
  return "changed";
}

/**
 * Saves a new password and signs out every other session for this admin,
 * keeping the one making the request.
 */
export async function changeAdminPassword(
  db: Database,
  request: Request,
  userId: number,
  password: string,
): Promise<void> {
  const token = readSessionToken(request);
  const currentId = token ? await sha256Hex(token) : "";
  await db.batch([
    db.update(adminUsers).set({ passwordHash: await hashPassword(password) }).where(eq(adminUsers.id, userId)),
    db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.id, currentId))),
  ]);
}
