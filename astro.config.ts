import { satteri } from "@astrojs/markdown-satteri";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://simoncrypta.dev",
  // Static output, served by Workers static assets (see cloudflare.config.ts).
  output: "static",
  outDir: "./dist",
  publicDir: "./static",
  build: {
    format: "directory",
    // One cached stylesheet (/_astro/*.css) instead of inline <style> per page.
    inlineStylesheets: "never",
  },
  markdown: {
    // Keep the authored punctuation as-is (no curly quotes or em dashes).
    processor: satteri({ features: { smartPunctuation: false } }),
  },
});
