# Agent Instructions for Simon's Crypta

## Build Commands
- `bun run build` - Build static site to `dist/` directory
- `bun run serve.ts` - Serve built site locally (optional)
- `bun run typecheck` - Typecheck with TypeScript (`tsc --noEmit`)
- `bun run lint` - Lint and format check with Biome (`bun run format` to fix)
- `bun run cf:dev` - Build, then serve `dist/` with the Cloudflare `cf` CLI
- Build also emits `robots.txt` (with Content-Signal), `sitemap.xml` the RSS feed `index.xml`, `llms.txt` and a Markdown copy of each page (`<page>/index.md`) (`src/lib/feeds.ts`)
- `bun run deploy:check` - Build + `cf deploy --dry-run` (never uploads)

## Cloudflare
- Use the `cf` CLI, not `wrangler` (wrangler stays installed only as cf's bundler)
- Hosting: Cloudflare Worker with static assets (migrated from Pages), deployed by Workers Builds
- Config: `cloudflare.config.ts` (Worker + static assets) and `wrangler.config.ts` (assets directory)
- Never run `bun run deploy`, `cf deploy` or `bun run preview:upload` unless asked
- Discover commands with `cf cli search "<task>"`; see DEPLOY.md

## Code Style Guidelines

### React Components
- Use TypeScript for all components
- Follow functional component patterns
- Keep components simple and focused
- Store components in `src/components/`

### Styling
- Plain CSS (no Tailwind yet; planned in simoncrypta-kti.6)
- Custom styles in `src/styles/global.css`
- Dark/light theme via `prefers-color-scheme` (no manual toggle)
- Color scheme: light (#f2f2f2 bg), dark (#1b1d36 bg)

### Content
- Markdown files in `content/` directory
- Front matter uses TOML format (for now.md and uses.md)
- Date format: Month DD, YYYY
- _index.md is special: no front matter needed

### File Organization
- Content: `content/` directory (markdown)
- Components: `src/components/` (React/TSX)
- Utilities: `src/lib/` (TypeScript)
- Static assets: `static/` (copied to dist/)
- Build output: `dist/` (generated, not committed)

### Naming Conventions
- Files: kebab-case (e.g., `markdown.ts`)
- React components: PascalCase (e.g., `Layout.tsx`)
- Functions: camelCase (e.g., `parseMarkdown`)

### Error Handling
- TypeScript will catch type errors
- Build script will fail on errors
- Check `bun run build` output for issues