import { createRequestHandler, RouterContextProvider } from "react-router";

import { cloudflareContext } from "~/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const mainHost = "prettyflyliving.com";
/** Hosts that permanently redirect to the main domain (AGENTS.md section 1). */
const redirectHosts = new Set(["www.prettyflyliving.com"]);

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Plain http:// on the live domains goes to https://prettyflyliving.com.
    if (redirectHosts.has(url.hostname) || (url.hostname === mainHost && url.protocol === "http:")) {
      url.protocol = "https:";
      url.hostname = mainHost;
      return Response.redirect(url.toString(), 301);
    }

    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
