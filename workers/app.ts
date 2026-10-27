import { createRequestHandler, RouterContextProvider } from "react-router";

import { cloudflareContext } from "~/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

/** Hosts that permanently redirect to the main domain (AGENTS.md section 1). */
const redirectHosts = new Set(["www.prettyflyliving.com"]);

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (redirectHosts.has(url.hostname)) {
      url.hostname = "prettyflyliving.com";
      return Response.redirect(url.toString(), 301);
    }

    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });
    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
