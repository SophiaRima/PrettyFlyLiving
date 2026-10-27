import { createRequestHandler, RouterContextProvider } from "react-router";

import { getContentVersion } from "~/.server/content-version";
import { getDb } from "~/.server/db/client";
import { nairobiToday } from "~/.server/request";
import { cloudflareContext } from "~/context";

import { cachedPage, isCacheablePageRequest } from "./page-cache";

const loadBuild = () => import("virtual:react-router/server-build");
const requestHandler = createRequestHandler(loadBuild, import.meta.env.MODE);

const mainHost = "prettyflyliving.com";
/** Hosts that permanently redirect to the main domain (AGENTS.md section 1). */
const redirectHosts = new Set(["www.prettyflyliving.com"]);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Plain http:// on the live domains goes to https://prettyflyliving.com.
    if (redirectHosts.has(url.hostname) || (url.hostname === mainHost && url.protocol === "http:")) {
      url.protocol = "https:";
      url.hostname = mainHost;
      return Response.redirect(url.toString(), 301);
    }

    const render = (): Promise<Response> => {
      const context = new RouterContextProvider();
      context.set(cloudflareContext, { env, ctx });
      return requestHandler(request, context);
    };
    // Public pages on the live domain come from the edge cache (workers/page-cache.ts),
    // filed under the content version, today's date and this deploy's build (cached
    // pages link the build's CSS and JS files, which the next deploy replaces).
    // If the version can't be read, the page is simply rendered.
    if (url.hostname === mainHost && isCacheablePageRequest(request, url)) {
      const version = await getContentVersion(getDb(env)).catch((error: unknown) => {
        console.error("Couldn't read the content version", error);
        return null;
      });
      if (version !== null) {
        const { assets } = await loadBuild();
        return cachedPage(url, `v${version}-${nairobiToday()}-${assets.version}`, ctx, render);
      }
    }
    return render();
  },
} satisfies ExportedHandler<Env>;
