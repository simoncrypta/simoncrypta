# Agent Instructions for Simon's Crypta

## Build Commands

- `bun run dev` - Astro dev server on :4321 (runs as a background daemon without a TTY; stop with `bunx astro dev stop`)
- `bun run build` - `astro build`: static site to `dist/`
- `bun run preview:worker` - Build, then serve `dist/` through the real Worker + assets (`scripts/worker-preview.ts`, needs Node)
- `bun run check` - Generate Astro types (`astro sync`), then format, lint and type check with Vite+ (`vp check`: oxfmt, type-aware oxlint, tsgo). `.astro` files are not type-checked (`astro check` doesn't support TypeScript 7 yet)
- `bun run fix` - Apply formatting and lint fixes (`vp check --fix`)
- `bun run deploy:check` - Build + `cf deploy --dry-run` (never uploads)
- The build also emits `robots.txt` (with Content-Signal), `sitemap.xml`, the RSS feed `index.xml`, `llms.txt` and a Markdown copy of each page (`<page>/index.md`), from endpoints in `src/pages/` using `src/lib/feeds.ts`

## Cloudflare

- Use the `cf` CLI, not `wrangler` (wrangler stays installed only as cf's bundler)
- Hosting: Cloudflare Worker with static assets (migrated from Pages), deployed by Workers Builds
- `src/worker.ts` runs before assets: serves `<page>/index.md` for `Accept: text/markdown`, adds `Vary`/`Link`
- Config: `cloudflare.config.ts` (Worker + static assets) and `wrangler.config.ts` (assets directory)
- Never run `bun run deploy`, `cf deploy` or `bun run preview:upload` unless asked
- Discover commands with `cf cli search "<task>"`; see DEPLOY.md

## Toolchain

- Astro 7 (`astro.config.ts`), static output, running on Vite+ core (`vite` is aliased to `@voidzero-dev/vite-plus-core`)
- Vite+ (`vite-plus`, config in `vite.config.ts`) for check/lint/fmt; Bun is the package manager
- `cf dev` delegates to `astro dev` (no Worker); use `bun run preview:worker` to test the Worker
- `content/` is excluded from formatting (authored prose)

## Code Style Guidelines

### Components

- Astro components (`.astro`) in `src/components/`, layouts in `src/layouts/`
- Keep logic in typed `.ts` helpers in `src/lib/` (`.astro` files aren't type-checked yet)
- Keep components simple and focused

### Styling

- Plain CSS (no Tailwind yet; planned in simoncrypta-kti.6)
- Custom styles in `src/styles/global.css`
- Dark/light theme via `prefers-color-scheme` (no manual toggle)
- Color scheme: light (#f2f2f2 bg), dark (#1b1d36 bg)

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
- Check `bun run build` output for issues
