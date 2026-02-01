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
import { Layout } from "./src/components/Layout";
import { Page } from "./src/components/Page";
import { NotFound } from "./src/components/NotFound";
import { parseMarkdown } from "./src/lib/markdown";


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
  
  for (const file of contentFiles) {
    const filePath = join(CONTENT_DIR, file);
    const parsed = await parseMarkdown(filePath);
    
    const isIndexFile = file === 'index.md';
    const slug = file.replace('.md', '');
    const outputPath = isIndexFile 
      ? join(DIST_DIR, 'index.html')
      : join(DIST_DIR, slug, 'index.html');
    
    const urlPath = isIndexFile ? '/' : `/${slug}`;
    
    if (!isIndexFile) {
      mkdirSync(join(DIST_DIR, slug), { recursive: true });
    }
    
    const html = (
      <Layout
        title={parsed.title}
        description={SITE_DESCRIPTION}
        currentPath={urlPath}
      >
        <Page html={parsed.html} />
      </Layout>
    ) as string;
    
    const fullHtml = `<!DOCTYPE html>\n${html}`;
    await Bun.write(outputPath, fullHtml);
    
    console.log(`   ✓ Generated ${file} → ${outputPath.replace(DIST_DIR + '/', '')}`);
  }
}

async function generate404Page() {
   const html = (
     <Layout
       title="404 - Page Not Found | Simon's Crypta"
       description="Page not found"
       currentPath="/404"
     >
       <NotFound />
     </Layout>
   ) as string;
  
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
    
    const tailwindResult = Bun.spawnSync([
      "bunx", "@tailwindcss/cli",
      "-i", CSS_INPUT,
      "-o", CSS_OUTPUT,
      "--minify"
    ]);
    
    if (tailwindResult.exitCode !== 0) {
      throw new Error(`Tailwind build failed: ${tailwindResult.stderr.toString()}`);
    }
    
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
