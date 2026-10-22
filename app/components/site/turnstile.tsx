import { useEffect, useRef } from "react";

interface TurnstileApi {
  render(
    element: HTMLElement,
    options: { sitekey: string; action: string; theme: "light"; size: "flexible" },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoading: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptLoading;
}

interface TurnstileProps {
  siteKey: string;
  /** Checked on the server against the siteverify result. */
  action: string;
  /** Any value that changes after each submission; a used token is single-use. */
  resetKey?: unknown;
}

/**
 * Cloudflare Turnstile widget, rendered explicitly so it also works after
 * client-side navigation. It adds the `cf-turnstile-response` field to the
 * surrounding form.
 */
export function Turnstile({ siteKey, action, resetKey }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
        });
      })
      .catch((error: unknown) => console.error(error));
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (resetKey !== undefined && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  return <div className="turnstile" ref={container} />;
}
