# Cloudflare Pages Deployment Guide

## Overview
Simon's Crypta is deployed on Cloudflare Pages as a static site. The site is built using Bun and generates static HTML files in the `dist/` directory.

## Build Configuration

### Build Command
```bash
bun run build
```

### Build Output Directory
```
dist/
```

### Build Output Contents
The build process generates:
- `index.html` - Home page
- `now/index.html` - Now page
- `uses/index.html` - Uses page
- `404.html` - Custom 404 error page
- `index.xml` - RSS feed
- `robots.txt` - SEO robots configuration
- `styles.css` - Compiled Tailwind CSS
- `image.png` - Static assets

## Cloudflare Pages Setup

### Dashboard Configuration
1. **Project Name**: `simoncrypta`
2. **Build Command**: `bun run build`
3. **Build Output Directory**: `dist`
4. **Root Directory**: `/` (default)
5. **Environment**: Production

### Required Settings
- **Framework Preset**: None (static site)
- **Node.js Version**: 20.x or later (for Bun compatibility)
- **Compatibility Date**: 2026-02-01

## Environment Variables
Currently, no environment variables are required for deployment.

If needed in the future, add them in the Cloudflare Pages dashboard under:
**Settings → Environment Variables → Production**

## Local Development & Testing

### Build Locally
```bash
bun run build
```

### Preview Build Output
```bash
# Using wrangler (Cloudflare's CLI)
bunx wrangler pages dev dist --port 8788
```

Then visit: `http://localhost:8788`

### Verify Build Files
```bash
# List all generated files
ls -la dist/

# Check specific required files
ls dist/index.html dist/now/index.html dist/uses/index.html dist/404.html dist/index.xml dist/robots.txt dist/styles.css
```

## Deployment Process

### Automatic Deployment (Recommended)
1. Push changes to the main branch on GitHub
2. Cloudflare Pages automatically triggers a build
3. Site is deployed to `https://simoncrypta.pages.dev`

### Manual Deployment
If needed, you can manually trigger a deployment in the Cloudflare Pages dashboard:
1. Go to **Deployments** tab
2. Click **Retry Build** on the latest deployment

## Troubleshooting

### Build Fails
- Check that `bun run build` works locally
- Verify all dependencies are in `package.json`
- Check build logs in Cloudflare Pages dashboard

### Pages Not Loading
- Verify `dist/` contains `index.html`
- Check that CSS and assets are in `dist/`
- Clear browser cache and try again

### Custom Domain
To add a custom domain:
1. Go to **Settings → Custom Domains**
2. Add your domain and follow DNS configuration steps

## Files Reference

- `wrangler.toml` - Wrangler configuration for local preview
- `package.json` - Build script and dependencies
- `build.ts` - Build script that generates static files
- `dist/` - Generated static site (not committed to git)

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Bun Documentation](https://bun.sh/docs)
