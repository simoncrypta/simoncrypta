/**
 * Serve the built site (dist/) through the real Worker + static assets, the
 * way production does: Markdown negotiation, Link/Vary headers, 404 page.
 *
 * `cf dev` delegates to `astro dev` for Astro projects, which skips the
 * Worker, so this converts cloudflare.config.ts to a throwaway Wrangler
 * config and runs `wrangler dev` with it:
 * `node scripts/worker-preview.ts [wrangler dev args]`.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { convertToWranglerConfig, loadAndParseConfig } from "@cloudflare/config";

const root = resolve(import.meta.dirname, "..");
const { result } = await loadAndParseConfig(resolve(root, "cloudflare.config.ts"), {
  isPreview: false,
  mode: undefined,
});
if (!result.success) {
  console.error(result.error);
  process.exit(1);
}

const config = convertToWranglerConfig(result.data);
const outDir = resolve(root, ".cloudflare");
const configPath = resolve(outDir, "wrangler.preview.json");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  configPath,
  JSON.stringify(
    {
      ...config,
      main: resolve(root, "src/worker.ts"),
      // Keep in sync with wrangler.config.ts (assetsDirectory).
      assets: { ...config.assets, directory: resolve(root, "dist") },
      routes: undefined,
    },
    null,
    2,
  ),
);

const { status } = spawnSync(
  "wrangler",
  ["dev", "--config", configPath, ...process.argv.slice(2)],
  { stdio: "inherit", cwd: root },
);
process.exit(status ?? 1);
