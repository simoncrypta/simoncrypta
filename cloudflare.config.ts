import { defineConfig } from "cf/config";

// Static site served by Workers static assets (cf has no legacy Pages support).
// The assets directory is set in wrangler.config.ts.
export default defineConfig({
  worker: {
    name: "simoncrypta",
    compatibilityDate: "2026-02-01",
    assets: {
      // Same as Cloudflare Pages: /now serves now/index.html at /now/,
      // and unknown paths get dist/404.html with a 404 status.
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
    },
  },
});
