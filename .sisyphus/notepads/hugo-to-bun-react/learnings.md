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

## Hugo to Tailwind Port (Task 7)

### Tailwind v4 CLI
- Discovered that `@tailwindcss/cli` package DOES exist and provides the `tailwindcss` binary for CLI usage.
- Installed `@tailwindcss/cli` to enable `bunx tailwindcss` commands.
- This allows using the CLI build method alongside the PostCSS API method if needed.

### CSS Porting Strategy
- **Hybrid Approach**: Maintained CSS variables in `global.css` (matching Hugo source) for broad compatibility, but used Tailwind utility classes (`bg-bg-light dark:bg-bg-dark`) in `Layout.tsx` to leverage Tailwind's dark mode features explicitly.
- **Noise Texture**: Preserved the complex SVG data URI in a custom `.noise-bg` utility class in `global.css` as it's too complex for inline Tailwind arbitrary values.
- **Fonts**: Kept existing Google Fonts in `Layout.tsx` but also added `@font-face` definitions in `global.css` for completeness/fallback matching the Hugo source.

## Markdown Processing Implementation (Task 8)

### Bun.markdown API Limitation
- **Discovery**: `Bun.markdown.html()` API does NOT exist in Bun v1.3.5
- Bun's markdown support is limited to specific contexts, not a general-purpose API
- Had to pivot to using `marked` package instead

### Dependencies Added
- `toml@3.0.0` - TOML parser for gray-matter engine
- `marked@17.0.1` - Markdown to HTML converter (GitHub Flavored Markdown support)
- `typescript-language-server@5.1.3` - For LSP diagnostics
- `typescript@5.9.3` - TypeScript compiler for type checking

### gray-matter Configuration
- Used `gray-matter` with custom TOML engine: `engines: { toml: toml.parse.bind(toml) }`
- Delimiter: `+++` (Hugo TOML front matter standard)
- Language: `toml` (explicit language specification)

### Special Case Handling
- `_index.md` has NO front matter - detected via `filePath.endsWith('_index.md')`
- Default frontmatter for index: `{ title: "Simon's Crypta" }`
- All other files parsed with gray-matter

### marked Configuration
- Enabled GitHub Flavored Markdown: `gfm: true`
- Disabled breaks: `breaks: false` (matches Hugo behavior)
- Used `marked.parse()` for async HTML generation

### TypeScript Import Issues
- Initial imports failed with `esModuleInterop` errors
- Solution: Changed to namespace imports:
  - `import * as matter from 'gray-matter'`
  - `import * as toml from 'toml'`
- This works with `moduleResolution: "bundler"` in tsconfig.json

### Testing Approach
- Created temporary test file to verify parsing
- Tested all three content files: `now.md`, `uses.md`, `_index.md`
- Verified frontmatter extraction and HTML generation
- Removed test file after successful validation

### Function Signature
```typescript
export async function parseMarkdown(filePath: string): Promise<ParsedMarkdown>
```

Returns:
- `frontmatter: FrontMatter` - Parsed TOML data or defaults
- `content: string` - Raw markdown content (without front matter)
- `html: string` - Rendered HTML from markdown

## Static Page Generation (Task 7)

Successfully implemented static page generation in build.ts with React SSR:

### Key Implementation Details

1. **React SSR**: Used `renderToStaticMarkup` from `react-dom/server` to convert React components to static HTML
   - Imported Layout and Page components
   - Created React elements imperatively with `React.createElement()`
   - Wrapped markdown HTML in dangerouslySetInnerHTML div

2. **URL Mapping**:
   - `_index.md` → `dist/index.html` (path: "/")
   - `{name}.md` → `dist/{name}/index.html` (path: "/{name}")
   - Created subdirectories with `mkdirSync` and `recursive: true`

3. **Page Structure**:
   - Layout receives: title, description, siteUrl, currentPath
   - Page wraps the markdown content
   - CSS linked via `/styles.css` in Layout component
   - Full HTML includes DOCTYPE prepended to React output

4. **Content Processing**:
   - Used `readdirSync` to scan content directory
   - `parseMarkdown()` returns frontmatter, content, and html
   - Title from frontmatter used in page title
   - Navigation highlights current page based on currentPath

### Code Pattern for SSR
```typescript
const html = renderToStaticMarkup(
  React.createElement(Layout, { props },
    React.createElement(Page, {},
      React.createElement('div', { 
        dangerouslySetInnerHTML: { __html: parsed.html } 
      })
    )
  )
);
const fullHtml = `<!DOCTYPE html>\n${html}`;
```

### Verification
- All 3 pages generate correctly (index, now, uses)
- Pages contain proper titles, meta tags, CSS links
- Navigation highlights active page
- Build completes successfully

