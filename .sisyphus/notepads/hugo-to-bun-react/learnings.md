# Hugo to Bun + React Migration - Learnings and Patterns

## Project Conventions

### Color Scheme (Exact Values)
| Token | Light | Dark |
|-------|-------|------|
| bg | #f2f2f2 | #1b1d36 |
| text | #1b1d36 | #f2f2f2 |
| link | #0066cc | #ffd400 |
| accent | #ffd400 | #ffd400 |
| code-bg | #1b1d36 | #d72638 |
| blockquote | #d72638 | #ffd400 |

### Fonts
- Noto Sans (500) - body text
- Jersey 25 (400) - headings/accents

### File Structure
- `src/components/` - React components
- `src/lib/` - Utility functions (markdown, rss)
- `src/styles/` - Global CSS and Tailwind
- `content/` - Markdown content files
- `static/` - Static assets
- `dist/` - Generated output

### Dependencies
- react, react-dom
- gray-matter (TOML front matter)
- tailwindcss, postcss, autoprefixer

### Build Commands
- `bun run build` - Production build
- `bun run dev` - Development with watch

## Key Decisions

### Migration Approach
- Pure static HTML (no client-side hydration)
- Bun.markdown.html() for markdown processing
- React renderToStaticMarkup for components
- File-based routing (content/*.md → dist/*/index.html)

### Tailwind Configuration
- Custom colors mapped from Hugo CSS
- Dark mode via `dark:` prefix with media strategy
- Noise texture preserved as SVG filter

## Content Format

### Front Matter (TOML)
```toml
+++
title = "Page Title"
[menu]
[menu.main]
name = "Nav Name"
weight = 10
+++
```

### Special Case
- `_index.md` has NO front matter - use site defaults

## Tailwind Configuration Setup

### Files Created
- `tailwind.config.ts` - Main Tailwind configuration with custom theme
- `postcss.config.js` - PostCSS configuration for Tailwind processing
- `src/styles/global.css` - Global CSS with @tailwind directives and CSS variables

### Color Mapping Strategy
Tailwind config includes:
1. **Flat color tokens** (e.g., `bg-light`, `text-dark`) - Direct hex values
2. **Semantic color groups** (e.g., `bg: { light, dark }`) - Grouped by purpose
3. **CSS variables in global.css** - Fallback for non-Tailwind usage

### Dark Mode Configuration
- Strategy: `'media'` (respects prefers-color-scheme)
- No manual toggle needed - automatic based on system preference
- CSS variables updated in @media (prefers-color-scheme: dark) block

### Font Families
- `font-noto-sans` - Noto Sans (weight 500)
- `font-jersey` - Jersey 25 (weight 400)

### Integration Notes
- Tailwind content paths include Hugo layouts, content, and src directories
- Global CSS preserves all Hugo color variables for compatibility
- @layer base ensures CSS variables work alongside Tailwind utilities
- Created React components mirroring Hugo templates structure.
- Used 'dangerouslySetInnerHTML' for the font loading script in Layout.tsx to preserve inline script behavior.
- Adapted SVG icons from Hugo partials to React components, converting attributes to camelCase.
- Implemented 'SEO' component to handle meta tags dynamically based on props.
- Used 'Layout' as the root HTML wrapper, including 'html', 'head', and 'body' tags, suitable for SSG.

## Build Script Implementation (Task 6)

### Tailwind CSS v4 Changes
- **Breaking change**: Tailwind v4 no longer has a standalone CLI
- Must use `@tailwindcss/postcss` package as PostCSS plugin
- Syntax changed from `@tailwind base/components/utilities` to `@import "tailwindcss"`
- PostCSS API approach works well with Bun's native file operations

### Build Script Architecture
- Used Bun's native APIs: `Bun.file()`, `Bun.write()` for file operations
- PostCSS processing via API instead of CLI for better integration
- Four-phase structure: Clean → Copy Static → Build CSS → Generate Pages (placeholder)
- Error handling with try/catch and process.exit(1)

### Type Safety
- Added `@ts-expect-error` for PostCSS plugins lacking proper type exports
- TypeScript checks pass with `bunx tsc --noEmit`

### File Operations
- `rmSync()` with `recursive: true` for clean dist removal
- `cpSync()` with `recursive: true` for static asset copying
- `existsSync()` checks before operations to handle missing directories gracefully

### Dependencies Added
- `@tailwindcss/postcss@4.1.18` - Required for Tailwind v4 PostCSS integration
