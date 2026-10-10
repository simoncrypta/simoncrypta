import { defineConfig } from "cf/config";

// Static site served by Workers static assets (migrated from Cloudflare Pages).
// The assets directory is set in wrangler.config.ts.
export default defineConfig({
  worker: {
    name: "simoncrypta",
    compatibilityDate: "2026-10-10",
    domains: ["simoncrypta.dev"],
    // simoncrypta.<subdomain>.workers.dev replaces simoncrypta.pages.dev.
    workersDev: true,
    // Per-version and per-branch preview URLs, like Pages preview deployments.
    previewUrls: true,
    assets: {
      // Same as Cloudflare Pages: /now serves now/index.html at /now/,
      // and unknown paths get dist/404.html with a 404 status.
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
    },
  },
});
