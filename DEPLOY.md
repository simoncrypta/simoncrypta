# Cloudflare Deployment Guide

## Overview
Simon's Crypta is a static site. Bun builds it into `dist/`, and a **Cloudflare Worker with static assets** serves it at `https://simoncrypta.dev`. It was migrated from Cloudflare Pages following the [Pages → Workers guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/).

Cloudflare tooling uses the [`cf` CLI](https://developers.cloudflare.com/cf/), which replaces `wrangler`.

## Build

```bash
bun run build
```

Output in `dist/`:
- `index.html`, `now/index.html`, `uses/index.html` - pages
- `404.html` - custom 404 page
- `robots.txt` - crawl rules, AI `Content-Signal` and the sitemap location
- `sitemap.xml` - all pages, with `lastmod` from each page's "Updated on" line
- `index.xml` - RSS 2.0 feed
- `index.md`, `now/index.md`, `uses/index.md` - Markdown copy of each page for agents (linked with `rel=alternate`)
- `llms.txt` - site summary for LLMs, linking the Markdown pages
- `styles.css` - site CSS
- `image.png` - static assets

## Configuration files

| File | Purpose |
| --- | --- |
| `cloudflare.config.ts` | cf project config: Worker name, compatibility date, custom domain, workers.dev, preview URLs, asset routing |
| `wrangler.config.ts` | Build settings that cf hands to its Wrangler bundler (`assetsDirectory: ./dist`) |
| `cloudflare/redirect-rules.json` | Zone Redirect Rules (`www` → apex), applied with `cf rulesets` |
| `package.json` | Build, preview and deploy scripts |

Behaviour carried over from Pages:

| Pages | Workers (`cloudflare.config.ts`) |
| --- | --- |
| `pages_build_output_dir = "dist"` | `assetsDirectory: "./dist"` (in `wrangler.config.ts`) |
| `/now` → `/now/` | `assets.htmlHandling: "auto-trailing-slash"` |
| `404.html` used automatically | `assets.notFoundHandling: "404-page"` |
| `simoncrypta.pages.dev` | `workersDev: true` → `simoncrypta.<subdomain>.workers.dev` |
| Preview deployments | `previewUrls: true` + Workers Builds preview builds |
| Custom domain on the Pages project | `domains: ["simoncrypta.dev"]` |

`cf build` / `cf dev` generate `.cloudflare/` (build output and types). It's gitignored.

## Local development

```bash
bun run dev           # Bun watch build + local server on :3000
bun run cf:dev        # build, then serve dist/ through the Cloudflare runtime (cf dev, :8787)
```

## Checks

```bash
bun run typecheck     # tsc (TypeScript 7)
bun run lint          # biome check
bun run deploy:check  # build + cf deploy --dry-run (validates, uploads nothing)
```

## Deployment

### Automatic: Workers Builds (Git integration)
Workers Builds settings (**Worker → Settings → Builds**):
- **Repository**: `simoncrypta/simoncrypta`, production branch `Main`
- **Build command**: `bun run build`
- **Deploy command**: `bunx cf deploy`
- **Non-production branch deploy command**: `bunx cf workers versions create`
- **Builds for non-production branches**: enabled (preview URLs)
- **Build variable**: `BUN_VERSION=1.4.3`, to match `packageManager` in `package.json`

### Manual
```bash
cf auth login
bun run deploy          # build + cf deploy (production)
bun run preview:upload  # build + upload a version with a preview URL, no deploy
```

## Redirects: `www` → `simoncrypta.dev`

`www.simoncrypta.dev` 301-redirects to `https://simoncrypta.dev`, keeping the path and query string. It's a zone-level **Redirect Rule**: Workers static assets `_redirects` can only match paths, not hostnames. The rule runs at Cloudflare's edge before the Worker or Pages. It works with either and doesn't depend on the cutover.

The rule is in `cloudflare/redirect-rules.json`. To apply it, or re-apply after editing:

```bash
# Validate on Cloudflare without saving
cf rulesets entrypoint update http_request_dynamic_redirect -z simoncrypta.dev \
  --body "$(cat cloudflare/redirect-rules.json)" --validate-only

# Apply. This replaces ALL redirect rules in the zone with this file.
cf rulesets entrypoint update http_request_dynamic_redirect -z simoncrypta.dev \
  --body "$(cat cloudflare/redirect-rules.json)"
```

This needs the proxied (orange-cloud) `www` DNS record, which already exists.

## Cutover from Pages (one-time)

Do this once, in order. Until step 4, Pages keeps serving the site.

1. **Remove the custom domain from the Pages project.** Go to Pages → `simoncrypta` → Custom domains and remove `simoncrypta.dev`. The Worker deploy attaches the domain itself, and it conflicts if Pages still holds it.
2. **Disable automatic deployments on the Pages project** (Settings → Builds), to avoid double deploys.
3. **Connect Workers Builds** with the settings above. Set a personalized `workers.dev` subdomain in the dashboard if you don't have one yet.
4. **Deploy.** Push to `Main`, or run `bun run deploy`. Then check `https://simoncrypta.dev` and the workers.dev URL.
5. **Delete the Pages project** once the Worker has served traffic for a while.

Doing step 1 just before step 4 keeps downtime to a few seconds while the domain moves.

## Troubleshooting

- **Build fails**: run `bun run build` locally and check the output.
- **`cf build` warns about the Docker socket**: harmless. It's the containers check, and this project has no containers.
- **Deploy fails on the custom domain**: the domain is probably still attached to the Pages project (cutover step 1).
- **`www.simoncrypta.dev` returns 522**: the redirect rule isn't applied. See [Redirects](#redirects-www--simoncryptadev).

## Additional resources

- [cf CLI](https://developers.cloudflare.com/cf/)
- [Migrating from Wrangler to cf](https://developers.cloudflare.com/cf/wrangler/migrate/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Bun documentation](https://bun.sh/docs)
