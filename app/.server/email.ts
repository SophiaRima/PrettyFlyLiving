/**
 * Email alerts to Sophiah via Resend's REST API (no SDK, keeps the Worker
 * small). Called inside ctx.waitUntil so a slow or failed send never delays
 * or breaks the response, and the saved record is never lost.
 *
 * Until a real RESEND_API_KEY is set (the .dev.vars placeholder starts with
 * "re_placeholder"), emails are printed to the terminal instead of sent.
 */

export interface Notification {
  subject: string;
  /** Label/value rows shown in the email body. */
  rows: [label: string, value: string][];
  /** Link to the record in the admin dashboard. */
  adminPath: string;
  /** Reply-To, so Sophiah can answer the guest directly. */
  replyTo?: string;
  /** Stable key so a retried send doesn't email twice. */
  idempotencyKey: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHtml(notification: Notification, adminUrl: string): string {
  const rows = notification.rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#73766c;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:8px 0;color:#242820;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f7f5ef;font-family:Arial,sans-serif;font-size:14px;line-height:1.5"><div style="max-width:560px;margin:0 auto;padding:28px 20px"><h1 style="font-size:20px;font-weight:normal;color:#242820;margin:0 0 18px">${escapeHtml(notification.subject)}</h1><table style="border-collapse:collapse;width:100%">${rows}</table><p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#536653;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px">Open in dashboard</a></p></div></body></html>`;
}

function renderText(notification: Notification, adminUrl: string): string {
  const rows = notification.rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  return `${notification.subject}\n\n${rows}\n\nOpen in dashboard: ${adminUrl}\n`;
}

export async function sendNotification(env: Env, notification: Notification): Promise<void> {
  const adminUrl = new URL(notification.adminPath, env.SITE_URL).toString();
  const text = renderText(notification, adminUrl);

  if (!env.RESEND_API_KEY || env.RESEND_API_KEY.startsWith("re_placeholder")) {
    console.log(`[email not sent: no RESEND_API_KEY]\nTo: ${env.NOTIFY_EMAIL}\n${text}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": notification.idempotencyKey,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [env.NOTIFY_EMAIL],
      subject: notification.subject,
      html: renderHtml(notification, adminUrl),
      text,
      ...(notification.replyTo ? { reply_to: notification.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text()}`);
  }
}

/** Sends after the response, logging (never throwing) on failure. */
export function notifyInBackground(
  env: Env,
  ctx: ExecutionContext,
  notification: Notification,
): void {
  ctx.waitUntil(
    sendNotification(env, notification).catch((error: unknown) => {
      console.error(`Email alert failed (${notification.idempotencyKey})`, error);
    }),
  );
}
