import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  // Admin-only browser libraries. Pre-bundling them stops the dev server from
  // reloading (and briefly loading React twice) the first time an admin page
  // that uses them is opened. Dev-only; production builds are unaffected.
  optimizeDeps: {
    include: [
      "@base-ui/react/button",
      "@base-ui/react/input",
      "@base-ui/react/merge-props",
      "@base-ui/react/use-render",
      "class-variance-authority",
      "cn",
      "lucide-react",
      "react-day-picker",
      "sonner",
    ],
  },
});
