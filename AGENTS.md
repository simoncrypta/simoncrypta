# Agent Instructions for Simon's Crypta

## Build Commands
- `hugo server` - Start development server with live reload
- `hugo` - Build static site to `public/` directory
- `hugo --minify` - Build and minify for production

## Code Style Guidelines

### HTML Templates
- Use Hugo templating syntax consistently
- Follow semantic HTML5 structure
- Indent with tabs (2 spaces)
- Use partials for reusable components

### CSS
- Inline styles in `layouts/partials/style.html`
- Use CSS custom properties for theming
- Maintain dark theme color scheme (#2B2D42 background, #EDF2F4 text)
- Follow existing naming conventions

### Content
- Use Markdown for blog posts
- Front matter uses TOML format
- Date format: YYYY-MM-DD
- Tags as array in front matter

### File Organization
- Content in `content/` directory
- Templates in `layouts/` with partials in `layouts/partials/`
- Static assets in `static/` directory

### Naming Conventions
- Files: kebab-case (e.g., `custom-head.html`)
- Hugo partials: snake_case (e.g., `seo_tags.html`)
- CSS classes: lowercase with hyphens

### Error Handling
- Hugo will fail builds on template errors
- Check `hugo server` output for issues