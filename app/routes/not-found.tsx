import { data } from "react-router";

/**
 * Catch-all for unknown public URLs. Throwing a 404 here shows the site-styled
 * page from routes/_site.tsx's ErrorBoundary (which also sets its title and
 * noindex) with a real 404 status.
 */
export function loader(): never {
  throw data(null, { status: 404 });
}

export default function NotFound() {
  return null;
}
