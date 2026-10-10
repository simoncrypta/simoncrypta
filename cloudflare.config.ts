import { bindings, defineConfig } from "cf/config";

// Static site served by Workers static assets (migrated from Cloudflare Pages).
// The assets directory is set in wrangler.config.ts. A small Worker runs first
// to serve Markdown to agents that ask for it (src/worker.ts).
export default defineConfig((ctx) => ({
  worker: {
    name: "simoncrypta",
    compatibilityDate: "2026-10-10",
    entrypoint: "./src/worker.ts",
    env: {
      ASSETS: bindings.assets(),
    },
    // Preview uploads can't claim the custom domain.
    domains: ctx.isPreview ? undefined : ["simoncrypta.dev"],
    // simoncrypta.<subdomain>.workers.dev replaces simoncrypta.pages.dev.
    workersDev: true,
    // Per-version and per-branch preview URLs, like Pages preview deployments.
    previewUrls: true,
    assets: {
      // Same as Cloudflare Pages: /now serves now/index.html at /now/,
      // and unknown paths get dist/404.html with a 404 status.
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
      // Only page requests (paths without a file extension) run the Worker,
      // for Accept negotiation and headers. Files (CSS, images, .md, .xml,
      // .txt) are served straight from assets: free and not counted against
      // the Workers request limit.
      runWorkerFirst: ["/*", "!/*.*"],
    },
  },
}));
