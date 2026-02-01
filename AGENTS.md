# Agent Instructions for Simon's Crypta

## Build Commands
- `bun run build` - Build static site to `dist/` directory
- `bun run serve.ts` - Serve built site locally (optional)

## Code Style Guidelines

### React Components
- Use TypeScript for all components
- Follow functional component patterns
- Keep components simple and focused
- Store components in `src/components/`

### Styling
- Use Tailwind CSS utility classes
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