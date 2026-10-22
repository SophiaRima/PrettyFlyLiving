const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/** Turnstile `action` per form, checked against the siteverify result. */
export type TurnstileAction = "booking" | "contact" | "owner" | "login";

interface SiteverifyResult {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
  metadata?: { result_with_testing_key?: boolean };
}

/**
 * Verifies a Turnstile token with Cloudflare (fails closed). The token must
 * pass, come from this site's hostname and match the form's action. Results
 * from Cloudflare's test keys (which report hostname "example.com" and no
 * action) are only accepted when the site itself runs on localhost.
 */
export async function verifyTurnstile(
  request: Request,
  token: FormDataEntryValue | null,
  action: TurnstileAction,
  env: Env,
): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;

  const hostname = new URL(request.url).hostname;
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.set("remoteip", ip);

  let result: SiteverifyResult;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`siteverify ${response.status}`);
    result = await response.json();
  } catch (error) {
    console.error("Turnstile siteverify failed", error);
    return false;
  }

  if (!result.success) return false;
  if (result.metadata?.result_with_testing_key) return LOCAL_HOSTS.has(hostname);
  return result.hostname === hostname && result.action === action;
}
