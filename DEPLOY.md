# Cloudflare Deployment Guide

## Overview
Simon's Crypta is a static site. Bun builds it into the `dist/` directory, and Cloudflare serves it.

Cloudflare tooling uses the [`cf` CLI](https://developers.cloudflare.com/cf/), which replaces `wrangler`. `cf` doesn't support legacy Cloudflare Pages, so the project is configured as a **Worker with static assets**. That's the "Pages on Workers" model.

> **Current production:** the site is still served by the existing Cloudflare Pages project (`simoncrypta`). It's deployed by the Pages Git integration using the dashboard build settings below. Running `cf deploy` would publish a separate Worker named `simoncrypta`. See [Moving production to cf](#moving-production-to-cf).

## Build

```bash
bun run build
```

Output in `dist/`:
- `index.html`, `now/index.html`, `uses/index.html` - pages
- `404.html` - custom 404 page
- `robots.txt` - SEO robots configuration
- `styles.css` - site CSS
- `image.png` - static assets

## Configuration files

| File | Purpose |
| --- | --- |
| `cloudflare.config.ts` | cf project config: Worker name, compatibility date, asset routing |
| `wrangler.config.ts` | Build settings that cf hands to its Wrangler bundler (`assetsDirectory: ./dist`) |
| `package.json` | Build and deploy scripts |

Asset routing matches Cloudflare Pages:
- `htmlHandling: "auto-trailing-slash"` redirects `/now` to `/now/` and serves `now/index.html`.
- `notFoundHandling: "404-page"` serves `dist/404.html` with a 404 status for unknown paths.

`cf build` / `cf dev` generate `.cloudflare/` (build output and types). It's gitignored.

## Local development

```bash
bun run dev           # Bun watch build + local server on :3000
bun run cf:dev        # build, then serve dist/ through the Cloudflare runtime (cf dev)
```

## Checks

```bash
bun run typecheck     # tsc (TypeScript 7)
bun run lint          # biome check
bun run deploy:check  # build + cf deploy --dry-run (validates, uploads nothing)
```

## Deployment

### Current: Cloudflare Pages Git integration
1. Push to `Main` on GitHub.
2. Cloudflare Pages builds with the dashboard settings and deploys to `https://simoncrypta.pages.dev`.

Dashboard settings:
- **Build command**: `bun run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Framework preset**: None

The repo no longer has a `wrangler.toml`, so Pages uses these dashboard settings.

### Moving production to cf
```bash
cf auth login
bun run deploy        # bun run build && cf deploy
```

This creates or updates the `simoncrypta` Worker with the contents of `dist/`. To cut over:
1. Deploy and check the `workers.dev` URL.
2. Move the custom domain from the Pages project to the Worker.
3. Disconnect or delete the Pages project.

## Troubleshooting

- **Build fails**: run `bun run build` locally and check the output.
- **`cf build` warns about the Docker socket**: harmless. It's the containers check, and this project has no containers.
- **Pages not loading**: make sure `dist/` contains `index.html`, `styles.css` and the assets.

## Additional resources

- [cf CLI](https://developers.cloudflare.com/cf/)
- [Migrating from Wrangler to cf](https://developers.cloudflare.com/cf/wrangler/migrate/)
- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Bun documentation](https://bun.sh/docs)
