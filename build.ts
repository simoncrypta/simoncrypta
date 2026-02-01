#!/usr/bin/env bun

/**
 * Build Script for Simon's Crypta SSG
 * 
 * Phases:
 * 1. Clean dist directory
 * 2. Copy static assets
 * 3. Build CSS with Tailwind
 * 4. Generate pages (placeholder - implemented in Task 7)
 */

import { rmSync, mkdirSync, cpSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import postcss from "postcss";
// @ts-expect-error - Tailwind PostCSS plugin types
import tailwindcss from "@tailwindcss/postcss";
// @ts-expect-error - Autoprefixer types
import autoprefixer from "autoprefixer";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { Layout } from "./src/components/Layout";
import { Page } from "./src/components/Page";
import { NotFound } from "./src/components/NotFound";
import { parseMarkdown } from "./src/lib/markdown";
import { generateRSS } from "./src/lib/rss";

const DIST_DIR = "dist";
const STATIC_DIR = "static";
const CONTENT_DIR = "content";
const CSS_INPUT = "src/styles/global.css";
const CSS_OUTPUT = "dist/styles.css";

const SITE_TITLE = "Simon's Crypta";
const SITE_DESCRIPTION = "Professional vibe coder sharing contexts and knowledge for every dimension";
const SITE_URL = "https://simoncrypta.dev";

async function generatePages() {
  const contentFiles = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const pageInfos = [];
  
  for (const file of contentFiles) {
    const filePath = join(CONTENT_DIR, file);
    const parsed = await parseMarkdown(filePath);
    
    const isIndexFile = file === '_index.md';
    const outputPath = isIndexFile 
      ? join(DIST_DIR, 'index.html')
      : join(DIST_DIR, file.replace('.md', ''), 'index.html');
    
    const urlPath = isIndexFile 
      ? '/' 
      : `/${file.replace('.md', '')}`;
    
    if (!isIndexFile) {
      mkdirSync(join(DIST_DIR, file.replace('.md', '')), { recursive: true });
    }
    
    const html = renderToStaticMarkup(
      React.createElement(Layout, {
        title: parsed.frontmatter.title || SITE_TITLE,
        description: SITE_DESCRIPTION,
        siteUrl: SITE_URL,
        currentPath: urlPath
      },
        React.createElement(Page, {},
          React.createElement('div', { 
            dangerouslySetInnerHTML: { __html: parsed.html } 
          })
        )
      )
    );
    
    const fullHtml = `<!DOCTYPE html>\n${html}`;
    await Bun.write(outputPath, fullHtml);
    
    console.log(`   ✓ Generated ${file} → ${outputPath.replace(DIST_DIR + '/', '')}`);
    
    pageInfos.push({
      title: parsed.frontmatter.title || SITE_TITLE,
      path: urlPath,
      description: SITE_DESCRIPTION,
      content: parsed.content
    });
  }
  
   const rssXml = generateRSS(pageInfos);
   await Bun.write(join(DIST_DIR, 'index.xml'), rssXml);
   console.log(`   ✓ Generated RSS feed → dist/index.xml`);
}

async function generate404Page() {
  const html = renderToStaticMarkup(
    React.createElement(Layout, {
      title: "404 - Page Not Found | Simon's Crypta",
      description: "Page not found",
      siteUrl: SITE_URL,
      currentPath: "/404"
    },
      React.createElement(NotFound)
    )
  );
  
  const fullHtml = `<!DOCTYPE html>\n${html}`;
  await Bun.write(join(DIST_DIR, '404.html'), fullHtml);
  console.log(`   ✓ Generated 404 page → dist/404.html`);
}

async function generateRobotsTxt() {
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://simoncrypta.dev/sitemap.xml
`;
  await Bun.write(join(DIST_DIR, 'robots.txt'), robotsTxt);
  console.log(`   ✓ Generated robots.txt → dist/robots.txt`);
}

async function main() {
  try {
    console.log("🏗️  Building Simon's Crypta...\n");

    // Phase 1: Clean dist directory
    console.log("📦 Phase 1: Cleaning dist directory...");
    if (existsSync(DIST_DIR)) {
      rmSync(DIST_DIR, { recursive: true, force: true });
      console.log("   ✓ Removed existing dist/");
    }
    mkdirSync(DIST_DIR, { recursive: true });
    mkdirSync(join(DIST_DIR), { recursive: true });
    console.log("   ✓ Created fresh dist/\n");

    // Phase 2: Copy static assets
    console.log("📁 Phase 2: Copying static assets...");
    if (existsSync(STATIC_DIR)) {
      cpSync(STATIC_DIR, DIST_DIR, { recursive: true });
      console.log("   ✓ Copied static/ → dist/\n");
    } else {
      console.log("   ⚠ No static/ directory found, skipping\n");
    }

    // Phase 3: Build CSS with Tailwind
    console.log("🎨 Phase 3: Building CSS with Tailwind...");
    
    const cssInput = await Bun.file(CSS_INPUT).text();
    
    const result = await postcss([
      tailwindcss,
      autoprefixer,
    ]).process(cssInput, {
      from: CSS_INPUT,
      to: CSS_OUTPUT,
    });

    await Bun.write(CSS_OUTPUT, result.css);
    
    console.log(`   ✓ Compiled ${CSS_INPUT} → ${CSS_OUTPUT}\n`);

     // Phase 4: Generate pages
     console.log("📄 Phase 4: Generating pages...");
     await generatePages();
     await generate404Page();
     await generateRobotsTxt();
     console.log("   ✓ Generated all pages\n");

    // Build complete
    console.log("✅ Build complete!\n");
    console.log("📊 Output:");
    console.log(`   - CSS: ${CSS_OUTPUT}`);
    if (existsSync(STATIC_DIR)) {
      console.log(`   - Static assets: dist/`);
    }

  } catch (error) {
    console.error("\n❌ Build failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
