# Hugo to Bun + React SSG Migration

## TL;DR

> **Quick Summary**: Migrate Simon's Crypta from Hugo to a custom Bun + React SSG with Tailwind CSS, deploying to Cloudflare Pages.
> 
> **Deliverables**:
> - Custom SSG build script using Bun + React
> - Tailwind CSS styling matching current dark/light theme
> - All 3 pages migrated (Home, Now, Uses)
> - RSS feed generation
> - Cloudflare Pages deployment config
> 
> **Estimated Effort**: Medium (8-12 tasks, ~4-6 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 8 → Task 10

---

## Context

### Original Request
Migrate Hugo static site to React + Bun SSG for Cloudflare Pages deployment. Use Tailwind for styling, keep markdown content, maintain same visual appearance.

### Interview Summary
**Key Discussions**:
- **React approach**: Vanilla React with custom build (no framework)
- **Markdown**: Plain markdown with TOML front matter
- **Routing**: File-based (`content/now.md` → `/now`)
- **CSS**: Convert existing CSS to Tailwind (user preference)
- **Verification**: Manual visual comparison

**Research Findings**:
- Bun 1.3.8+ has native `Bun.markdown.html()` API
- React 19's `renderToStaticMarkup` for pure static HTML
- Cloudflare Pages V3 has native Bun support (build command: `bun run build`)
- Need `gray-matter` package for TOML front matter parsing

### Metis Review
**Identified Gaps** (addressed):
- `_index.md` has no front matter → Handle as special case (home page)
- TOML parser needed → Use `gray-matter` package
- URL structure → Generate `dist/now/index.html` folders
- 404.html → Include in build output
- Theme toggle → Keep system-driven only (no manual toggle)
- Blog functionality → Explicitly excluded

---

## Work Objectives

### Core Objective
Build a custom SSG using Bun + React that generates static HTML from markdown content, styled with Tailwind CSS, and deployable to Cloudflare Pages.

### Concrete Deliverables
- `package.json` - Bun project configuration
- `build.ts` - SSG build script
- `src/components/` - React components (Layout, SEO, Footer)
- `tailwind.config.ts` - Tailwind theme with custom colors
- `src/styles/global.css` - Tailwind base + custom CSS
- `dist/` - Generated static site output
- RSS feed at `/index.xml`
- 404 error page

### Definition of Done
- [ ] `bun run build` exits with code 0
- [ ] `dist/` contains: `index.html`, `now/index.html`, `uses/index.html`, `404.html`, `index.xml`
- [ ] Visual comparison: new site matches Hugo output in both light and dark modes
- [ ] Deploy to Cloudflare Pages successfully

### Must Have
- Dark/light theme via `prefers-color-scheme` media query
- Exact color scheme preservation (see CSS values below)
- Google Fonts: Noto Sans (500), Jersey 25 (400)
- Navigation: Home, Now, Uses
- Footer: Location, contact, social icons (GitHub, X, RSS)
- SEO meta tags (Open Graph, Twitter cards)
- Noise texture background effect
- RSS feed

### Must NOT Have (Guardrails)
- Manual dark/light toggle button
- Blog functionality (excluded from scope)
- Client-side JavaScript hydration (pure static)
- Image optimization or lazy loading
- Unit tests or e2e tests (manual verification only)
- More than 5 React components
- Any framework (Next.js, Astro, etc.)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: NO (Manual verification)
- **Framework**: None

### Automated Verification (Agent-Executable)

Each task includes verification via Bash commands or Playwright browser automation.

**Build Verification:**
```bash
bun run build
# Assert: Exit code 0

ls -la dist/
# Assert: index.html, now/, uses/, 404.html, index.xml exist
```

**CSS Parity Checks:**
```bash
grep -o '\-\-bg-color' dist/index.html
# Assert: CSS custom properties present (for noise texture)

grep -o 'prefers-color-scheme: dark' dist/index.html
# Assert: Dark mode media query present
```

**SEO Verification:**
```bash
grep -o '<meta property="og:title"' dist/index.html
# Assert: Open Graph tags present
```

**Visual Verification (Playwright):**
```typescript
// Compare screenshots at 1280x720
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'new-light.png' });
await page.emulateMedia({ colorScheme: 'dark' });
await page.screenshot({ path: 'new-dark.png' });
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Initialize Bun project
└── Task 2: Create Tailwind configuration

Wave 2 (After Wave 1):
├── Task 3: Create build script scaffolding
├── Task 4: Create React components
└── Task 5: Port CSS to Tailwind

Wave 3 (After Wave 2):
├── Task 6: Implement markdown processing
├── Task 7: Implement page generation
└── Task 8: Generate RSS feed

Wave 4 (After Wave 3):
├── Task 9: Create 404 and robots.txt
└── Task 10: Configure Cloudflare Pages

Wave 5 (Final):
└── Task 11: Visual verification and cleanup

Critical Path: Task 1 → Task 3 → Task 6 → Task 7 → Task 11
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4, 5, 6 | 2 |
| 2 | None | 5 | 1 |
| 3 | 1 | 6, 7, 8 | 4, 5 |
| 4 | 1 | 7 | 3, 5 |
| 5 | 1, 2 | 7 | 3, 4 |
| 6 | 3 | 7 | - |
| 7 | 4, 5, 6 | 9, 10, 11 | 8 |
| 8 | 3 | 11 | 7 |
| 9 | 7 | 11 | 10 |
| 10 | 7 | 11 | 9 |
| 11 | 7, 8, 9, 10 | None | None |

---

## TODOs

### Wave 1: Foundation

- [ ] 1. Initialize Bun Project

  **What to do**:
  - Run `bun init` to create project structure
  - Add dependencies: `react`, `react-dom`, `gray-matter`
  - Add dev dependencies: `@types/react`, `@types/react-dom`, `@types/bun`
  - Configure `tsconfig.json` for React JSX
  - Create folder structure: `src/`, `content/`, `static/`

  **Must NOT do**:
  - Add any framework (Next.js, Vite, etc.)
  - Add testing libraries

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple project initialization with standard commands
  - **Skills**: [`bun-development`]
    - `bun-development`: Bun project setup patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 4, 5, 6
  - **Blocked By**: None

  **References**:
  - Bun init docs: https://bun.sh/docs/cli/init
  - Current `hugo.toml:1-20` - Site metadata to preserve (title, author, description)

  **Acceptance Criteria**:
  ```bash
  # Build script exists and runs
  cat package.json | grep '"build"'
  # Assert: "build" script defined
  
  # Dependencies installed
  bun pm ls | grep react
  # Assert: react, react-dom listed
  
  # TypeScript configured
  cat tsconfig.json | grep '"jsx"'
  # Assert: "react-jsx" or similar
  ```

  **Commit**: YES
  - Message: `feat(init): initialize bun project with react dependencies`
  - Files: `package.json`, `tsconfig.json`, `bun.lockb`

---

- [ ] 2. Create Tailwind Configuration

  **What to do**:
  - Install Tailwind CSS: `bun add -d tailwindcss postcss autoprefixer`
  - Create `tailwind.config.ts` with custom theme
  - Define color palette matching current site:
    ```
    Light: bg #f2f2f2, text #1b1d36, link #0066cc, accent #ffd400
    Dark: bg #1b1d36, text #f2f2f2, link #ffd400, accent #ffd400
    ```
  - Add custom font families: `'Noto Sans'`, `'Jersey 25'`
  - Create `src/styles/global.css` with Tailwind directives

  **Must NOT do**:
  - Add Tailwind plugins
  - Create complex component variants

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Tailwind setup with theme customization
  - **Skills**: [`bun-development`]
    - `bun-development`: Bun package management

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:
  - `layouts/partials/style.html:28-54` - Exact CSS custom property values to port
  - Tailwind docs: https://tailwindcss.com/docs/configuration

  **Acceptance Criteria**:
  ```bash
  # Tailwind config exists
  cat tailwind.config.ts | grep 'colors'
  # Assert: Custom colors defined
  
  # Global CSS has Tailwind directives
  grep '@tailwind' src/styles/global.css
  # Assert: @tailwind base, components, utilities
  ```

  **Commit**: YES
  - Message: `feat(styles): add tailwind configuration with custom theme`
  - Files: `tailwind.config.ts`, `postcss.config.js`, `src/styles/global.css`

---

### Wave 2: Core Infrastructure

- [ ] 3. Create Build Script Scaffolding

  **What to do**:
  - Create `build.ts` as main build entry point
  - Implement basic structure:
    1. Clean `dist/` directory
    2. Copy static assets from `static/`
    3. Process CSS with Tailwind
    4. Placeholder for page generation
  - Add `"build": "bun run build.ts"` to package.json
  - Add `"dev": "bun --watch run build.ts"` for development

  **Must NOT do**:
  - Implement full page generation yet (Task 7)
  - Add complex caching or optimization

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: File system operations and script structure
  - **Skills**: [`bun-development`]
    - `bun-development`: Bun.file, Bun.write APIs

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Task 1

  **References**:
  - Bun file API: https://bun.sh/docs/api/file-io
  - Bun build API: https://bun.sh/docs/bundler

  **Acceptance Criteria**:
  ```bash
  # Build script runs without error
  bun run build
  # Assert: Exit code 0
  
  # Dist directory created
  ls dist/
  # Assert: Directory exists
  ```

  **Commit**: YES
  - Message: `feat(build): create build script scaffolding`
  - Files: `build.ts`, `package.json`

---

- [ ] 4. Create React Components

  **What to do**:
  - Create `src/components/Layout.tsx` - HTML wrapper with head, body structure
  - Create `src/components/SEO.tsx` - Meta tags component (OG, Twitter, canonical)
  - Create `src/components/Header.tsx` - Title and navigation
  - Create `src/components/Footer.tsx` - Social icons and contact info
  - Create `src/components/Page.tsx` - Content wrapper

  **Must NOT do**:
  - Create more than 5 components
  - Add client-side interactivity
  - Add state management

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: React component creation with styling focus
  - **Skills**: [`bun-development`]
    - `bun-development`: React with Bun

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1

  **References**:
  - `layouts/_default/baseof.html:1-62` - HTML structure to replicate
  - `layouts/partials/header.html:1-5` - Header structure
  - `layouts/partials/footer.html:1-8` - Footer with SVG icons
  - `layouts/partials/seo_tags.html:1-31` - Meta tags to include
  - `layouts/partials/nav.html:1-5` - Navigation structure

  **Acceptance Criteria**:
  ```bash
  # All components exist
  ls src/components/
  # Assert: Layout.tsx, SEO.tsx, Header.tsx, Footer.tsx, Page.tsx
  
  # Components are valid TypeScript
  bunx tsc --noEmit
  # Assert: No type errors
  ```

  **Commit**: YES
  - Message: `feat(components): create react layout components`
  - Files: `src/components/*.tsx`

---

- [ ] 5. Port CSS to Tailwind

  **What to do**:
  - Convert body styles to Tailwind utilities in Layout component
  - Implement dark mode using Tailwind's `dark:` prefix with media strategy
  - Port typography styles (h1-h6, p, a, blockquote, code)
  - Recreate noise texture background (keep as inline CSS or separate style)
  - Port blog-posts list styles (for future use if needed)
  - Ensure font loading script is preserved

  **Color mapping (exact values)**:
  | Token | Light | Dark |
  |-------|-------|------|
  | bg | #f2f2f2 | #1b1d36 |
  | text | #1b1d36 | #f2f2f2 |
  | link | #0066cc | #ffd400 |
  | accent | #ffd400 | #ffd400 |
  | code-bg | #1b1d36 | #d72638 |
  | blockquote | #d72638 | #ffd400 |

  **Must NOT do**:
  - Change the visual appearance
  - Remove the noise texture effect
  - Change font weights or families

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS to Tailwind conversion with visual fidelity focus
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: CSS architecture and Tailwind expertise

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `layouts/partials/style.html:1-259` - **Complete CSS to port** (all 259 lines)
  - `layouts/_default/baseof.html:28-36` - Font loading script to preserve

  **Acceptance Criteria**:
  ```bash
  # Dark mode classes present
  grep 'dark:' src/components/Layout.tsx
  # Assert: dark: prefix used
  
  # Noise texture preserved
  grep 'feTurbulence' src/components/Layout.tsx || grep 'feTurbulence' src/styles/global.css
  # Assert: SVG noise filter present
  
  # Build CSS successfully
  bunx tailwindcss -i src/styles/global.css -o dist/styles.css
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(styles): port hugo css to tailwind with dark mode`
  - Files: `src/components/*.tsx`, `src/styles/global.css`, `tailwind.config.ts`

---

### Wave 3: Content Processing

- [ ] 6. Implement Markdown Processing

  **What to do**:
  - Create `src/lib/markdown.ts` with functions:
    - `parseMarkdown(filePath)` - Parse front matter + content
    - `renderMarkdown(content)` - Convert MD to HTML using `Bun.markdown.html()`
  - Handle TOML front matter using `gray-matter` with `{ engines: { toml: ... } }`
  - Handle special case: `_index.md` has no front matter (default to site title)
  - Extract `title` and `menu` fields from front matter

  **Must NOT do**:
  - Add MDX support
  - Add syntax highlighting (not needed for current content)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: File parsing and content transformation
  - **Skills**: [`bun-development`]
    - `bun-development`: Bun.markdown API, file operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Wave 2)
  - **Blocks**: Task 7
  - **Blocked By**: Task 3

  **References**:
  - `content/_index.md:1-18` - Home page (NO front matter, just markdown)
  - `content/now.md:1-39` - Example with TOML front matter
  - `content/uses.md:1-53` - Example with TOML front matter
  - Bun markdown API: https://bun.sh/docs/api/utils#bun-markdown
  - gray-matter docs: https://github.com/jonschlinkert/gray-matter

  **Acceptance Criteria**:
  ```bash
  # Test markdown parsing (create temp test)
  bun -e "
    import { parseMarkdown } from './src/lib/markdown';
    const result = await parseMarkdown('./content/now.md');
    console.log(result.frontmatter.title);
  "
  # Assert: Outputs "Now"
  
  # Test home page special case
  bun -e "
    import { parseMarkdown } from './src/lib/markdown';
    const result = await parseMarkdown('./content/_index.md');
    console.log(result.frontmatter.title || 'default');
  "
  # Assert: Outputs "default" or site title
  ```

  **Commit**: YES
  - Message: `feat(content): implement markdown parsing with toml front matter`
  - Files: `src/lib/markdown.ts`

---

- [ ] 7. Implement Page Generation

  **What to do**:
  - Update `build.ts` to generate HTML pages:
    1. Scan `content/` for markdown files
    2. For each file, parse markdown and render to HTML
    3. Wrap content in Layout component with SEO
    4. Write to `dist/` with folder structure:
       - `_index.md` → `dist/index.html`
       - `now.md` → `dist/now/index.html`
       - `uses.md` → `dist/uses/index.html`
  - Use `renderToStaticMarkup` from react-dom/server
  - Include inline CSS (Tailwind output) in each page

  **Must NOT do**:
  - Generate client-side JavaScript bundles
  - Add hydration scripts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Core build logic with multiple moving parts
  - **Skills**: [`bun-development`]
    - `bun-development`: Bun build patterns, React SSG

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Tasks 9, 10, 11
  - **Blocked By**: Tasks 4, 5, 6

  **References**:
  - `layouts/_default/single.html:1-21` - Single page template structure
  - `layouts/index.html` - Home page template (if different)
  - `hugo.toml:17-19` - Permalink structure (`/:slug/`)

  **Acceptance Criteria**:
  ```bash
  # Run build
  bun run build
  # Assert: Exit code 0
  
  # All pages generated with correct structure
  ls dist/index.html dist/now/index.html dist/uses/index.html
  # Assert: All files exist
  
  # Pages contain expected content
  grep 'Simon' dist/index.html
  # Assert: Site title present
  
  grep 'What I' dist/now/index.html
  # Assert: Now page content present
  ```

  **Commit**: YES
  - Message: `feat(build): implement static page generation`
  - Files: `build.ts`

---

- [ ] 8. Generate RSS Feed

  **What to do**:
  - Create `src/lib/rss.ts` to generate RSS 2.0 XML
  - Include: channel title, link, description, lastBuildDate
  - Include items for each page with: title, link, pubDate, description
  - Write to `dist/index.xml`
  - Match Hugo's RSS output format

  **Must NOT do**:
  - Add full RSS spec features (categories, enclosures, etc.)
  - Add Atom feed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple XML generation
  - **Skills**: [`bun-development`]
    - `bun-development`: File writing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 7)
  - **Blocks**: Task 11
  - **Blocked By**: Task 3

  **References**:
  - RSS 2.0 spec: https://www.rssboard.org/rss-specification
  - Current RSS output: Run `hugo` and check `public/index.xml`

  **Acceptance Criteria**:
  ```bash
  # RSS feed generated
  cat dist/index.xml | head -5
  # Assert: Contains <?xml and <rss
  
  # RSS is valid XML
  bun -e "
    const xml = await Bun.file('dist/index.xml').text();
    console.log(xml.includes('<channel>') && xml.includes('</rss>'));
  "
  # Assert: true
  ```

  **Commit**: YES
  - Message: `feat(rss): generate rss feed`
  - Files: `src/lib/rss.ts`, `build.ts`

---

### Wave 4: Polish

- [ ] 9. Create 404 and robots.txt

  **What to do**:
  - Create 404 page component and generate `dist/404.html`
  - Generate `dist/robots.txt` with basic rules:
    ```
    User-agent: *
    Allow: /
    Sitemap: https://simoncrypta.dev/sitemap.xml
    ```
  - (Optional) Generate basic `dist/sitemap.xml`

  **Must NOT do**:
  - Create complex error pages
  - Add analytics or tracking

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple static file generation
  - **Skills**: [`bun-development`]
    - `bun-development`: File operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 10)
  - **Blocks**: Task 11
  - **Blocked By**: Task 7

  **References**:
  - `layouts/404.html` - Current 404 template
  - `hugo.toml:11` - `enableRobotsTXT = true`

  **Acceptance Criteria**:
  ```bash
  # 404 page exists
  cat dist/404.html | grep -i '404\|not found'
  # Assert: Contains 404 message
  
  # robots.txt exists
  cat dist/robots.txt
  # Assert: Contains User-agent and Allow
  ```

  **Commit**: YES
  - Message: `feat(static): add 404 page and robots.txt`
  - Files: `src/components/NotFound.tsx`, `build.ts`

---

- [ ] 10. Configure Cloudflare Pages

  **What to do**:
  - Create `wrangler.toml` for Cloudflare Pages configuration (optional)
  - Document deployment settings:
    - Build command: `bun run build`
    - Build output directory: `dist`
    - Environment variable: `BUN_VERSION=latest` (optional)
  - Add deployment instructions to README or separate doc
  - Test build locally: `bun run build && bunx wrangler pages dev dist`

  **Must NOT do**:
  - Set up CI/CD pipelines
  - Add Cloudflare Workers functions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Configuration file creation
  - **Skills**: [`bun-development`]
    - `bun-development`: Deployment patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 9)
  - **Blocks**: Task 11
  - **Blocked By**: Task 7

  **References**:
  - Cloudflare Pages docs: https://developers.cloudflare.com/pages/
  - Cloudflare Pages + Bun: https://developers.cloudflare.com/pages/configuration/build-image/

  **Acceptance Criteria**:
  ```bash
  # Build works end-to-end
  bun run build
  # Assert: Exit code 0, dist/ has all files
  
  # Local preview works
  bunx wrangler pages dev dist --port 8788 &
  sleep 2
  curl -s http://localhost:8788 | grep 'Simon'
  # Assert: Home page renders
  ```

  **Commit**: YES
  - Message: `docs(deploy): add cloudflare pages configuration`
  - Files: `wrangler.toml` (if created), `README.md`

---

### Wave 5: Verification

- [ ] 11. Visual Verification and Cleanup

  **What to do**:
  - Run Hugo build: `hugo` → `public/`
  - Run Bun build: `bun run build` → `dist/`
  - Start both servers and compare visually
  - Use Playwright to capture screenshots:
    - Home page: light + dark mode
    - Now page: light + dark mode
    - Uses page: light + dark mode
  - Fix any visual discrepancies
  - Remove Hugo files if migration complete (optional, user decision)
  - Update `.gitignore` to include `dist/`

  **Must NOT do**:
  - Delete Hugo files without user confirmation
  - Add automated visual regression testing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual comparison and verification
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: Browser automation for screenshots
    - `frontend-ui-ux`: Visual comparison expertise

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Final (sequential)
  - **Blocks**: None
  - **Blocked By**: Tasks 7, 8, 9, 10

  **References**:
  - Current live site: https://simoncrypta.dev
  - Hugo output: `public/` directory after running `hugo`

  **Acceptance Criteria**:
  ```bash
  # Hugo build for comparison
  hugo
  # Assert: public/ generated
  
  # Bun build
  bun run build
  # Assert: dist/ generated
  ```

  **Playwright verification:**
  ```typescript
  // Light mode comparison
  await page.goto('http://localhost:3000'); // Bun
  await page.screenshot({ path: '.sisyphus/evidence/new-home-light.png' });
  
  // Dark mode comparison
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: '.sisyphus/evidence/new-home-dark.png' });
  
  // Compare with Hugo output
  await page.goto('http://localhost:1313'); // Hugo
  await page.screenshot({ path: '.sisyphus/evidence/old-home-light.png' });
  ```

  **Evidence to Capture:**
  - [ ] Screenshots in `.sisyphus/evidence/` for all pages (light + dark)
  - [ ] Side-by-side comparison notes

  **Commit**: YES
  - Message: `chore: complete migration verification`
  - Files: `.gitignore`, any final fixes

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(init): initialize bun project with react dependencies` | package.json, tsconfig.json | bun pm ls |
| 2 | `feat(styles): add tailwind configuration with custom theme` | tailwind.config.ts, postcss.config.js | grep colors |
| 3 | `feat(build): create build script scaffolding` | build.ts | bun run build |
| 4 | `feat(components): create react layout components` | src/components/*.tsx | bunx tsc --noEmit |
| 5 | `feat(styles): port hugo css to tailwind with dark mode` | src/styles/*.css, components | build CSS |
| 6 | `feat(content): implement markdown parsing with toml front matter` | src/lib/markdown.ts | parse test |
| 7 | `feat(build): implement static page generation` | build.ts | ls dist/ |
| 8 | `feat(rss): generate rss feed` | src/lib/rss.ts | xml validation |
| 9 | `feat(static): add 404 page and robots.txt` | components, build.ts | file exists |
| 10 | `docs(deploy): add cloudflare pages configuration` | wrangler.toml, README | local preview |
| 11 | `chore: complete migration verification` | .gitignore | visual check |

---

## Success Criteria

### Verification Commands
```bash
# Full build succeeds
bun run build
# Expected: Exit code 0

# All required files generated
ls dist/index.html dist/now/index.html dist/uses/index.html dist/404.html dist/index.xml dist/robots.txt
# Expected: All files exist

# SEO tags present
grep -c 'og:title' dist/index.html
# Expected: 1 or more

# Dark mode CSS present
grep 'prefers-color-scheme: dark' dist/index.html
# Expected: Match found

# RSS feed valid
grep '<rss' dist/index.xml
# Expected: Match found
```

### Final Checklist
- [ ] All 3 pages render correctly (Home, Now, Uses)
- [ ] Dark/light theme works via system preference
- [ ] Navigation links work
- [ ] Footer social icons display correctly
- [ ] RSS feed is valid XML
- [ ] 404 page exists
- [ ] robots.txt exists
- [ ] Visual appearance matches Hugo output
- [ ] No client-side JavaScript (pure static)
- [ ] Ready for Cloudflare Pages deployment
