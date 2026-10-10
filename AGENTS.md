# Agent Instructions for Simon's Crypta

## Build Commands

- `pnpm dev` - Astro dev server on :4321 (runs as a background daemon without a TTY; stop with `pnpm exec astro dev stop`)
- `pnpm build` - `astro build`: static site to `dist/`
- `pnpm preview:worker` - Build, then serve `dist/` through the real Worker + assets (`scripts/worker-preview.ts`)
- `pnpm check` - Generate Astro types (`astro sync`), then format, lint and type check with Vite+ (`vp check`: oxfmt, type-aware oxlint, tsgo). `.astro` files are not type-checked (`astro check` doesn't support TypeScript 7 yet)
- `pnpm fix` - Apply formatting and lint fixes (`vp check --fix`)
- `pnpm build:worker` - `astro build` + `cf-wrangler build`: full Cloudflare build output in `.cloudflare/output/` (`cf build` alone fails: it expects an Astro adapter)
- `pnpm deploy:check` - `build:worker` + `cf deploy --prebuilt --dry-run` (never uploads)
- The build also emits `robots.txt` (with Content-Signal), `sitemap.xml`, the RSS feed `index.xml`, `llms.txt` and a Markdown copy of each page (`<page>/index.md`), from endpoints in `src/pages/` using `src/lib/feeds.ts`

## Cloudflare

- Use the `cf` CLI, not `wrangler` (wrangler stays installed only as cf's bundler)
- Hosting: Cloudflare Worker with static assets (migrated from Pages), deployed by Workers Builds
- `src/worker.ts` runs before assets: serves `<page>/index.md` for `Accept: text/markdown`, adds `Vary`/`Link`
- Config: `cloudflare.config.ts` (Worker + static assets) and `wrangler.config.ts` (assets directory)
- Never run `pnpm run deploy`, `cf deploy` or `pnpm preview:upload` unless asked
- Discover commands with `cf cli search "<task>"`; see DEPLOY.md

## Toolchain

- Node 26 (pinned in `.node-version`) and pnpm (`packageManager`), both managed by Vite+ (`vp env`, `vp install`)
- `pnpm-workspace.yaml`: allowed install scripts (esbuild, workerd)
- Astro 7 (`astro.config.ts`), static output, on its own Vite 8 (Vite+ is only used for check/lint/fmt)
- Vite+ (`vite-plus`, config in `vite.config.ts`) for check/lint/fmt
- `cf dev` delegates to `astro dev` (no Worker); use `pnpm preview:worker` to test the Worker
- `content/` is excluded from formatting (authored prose)

## Code Style Guidelines

### Components

- Astro components (`.astro`) in `src/components/`, layouts in `src/layouts/`
- Keep logic in typed `.ts` helpers in `src/lib/` (`.astro` files aren't type-checked yet)
- Keep components simple and focused

### Styling

- Tailwind CSS v4 via `@tailwindcss/vite`, configured in CSS (`src/styles/global.css`): no `tailwind.config`, no preflight
- Theme tokens in `@theme`: colors `bg`, `fg`, `link`, `accent`, `code-bg`, `code-fg`, `quote`; fonts `font-sans` (Noto Sans), `font-display` (Jersey 25)
- Dark/light via `prefers-color-scheme` overriding the same variables (no manual toggle); light #f2f2f2 bg, dark #1b1d36 bg
- `mobile:` variant = `max-width: 768px`
- Use utility classes in components; Markdown content can't take classes, so its typography lives in `@layer base` (`content` element rules)

### Content

- Markdown files in `content/` (Astro content collection `pages`, `src/content.config.ts`); `index.md` is the home page
- No front matter; pages may start with an `*Updated on Month DD, YYYY*` line (used for sitemap/RSS dates)
- Smart punctuation is off: punctuation renders as written

### File Organization

- Content: `content/` directory (markdown)
- Routes and endpoints: `src/pages/`
- Components: `src/components/`, layouts: `src/layouts/`
- Utilities: `src/lib/` (TypeScript)
- Worker: `src/worker.ts`
- Static assets: `static/` (copied to dist/)
- Build output: `dist/` (generated, not committed)

### Naming Conventions

- Files: kebab-case (e.g., `markdown.ts`)
- Astro components: PascalCase (e.g., `Layout.astro`)
- Functions: camelCase (e.g., `getContentPages`)

### Error Handling

- TypeScript will catch type errors
- `astro build` fails on errors
- Check `pnpm build` output for issues
