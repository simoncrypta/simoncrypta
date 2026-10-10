#!/usr/bin/env bun

/**
 * Build Script for Simon's Crypta SSG
 *
 * Phases:
 * 1. Clean dist directory
 * 2. Copy static assets
 * 3. Copy CSS
 * 4. Generate pages, 404, robots.txt, sitemap.xml and RSS
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Layout } from "./src/components/Layout";
import { NotFound } from "./src/components/NotFound";
import { Page } from "./src/components/Page";
import {
  buildRobotsTxt,
  buildRss,
  buildSitemap,
  type SitePage,
} from "./src/lib/feeds";
import { parseMarkdown } from "./src/lib/markdown";

const DIST_DIR = "dist";
const STATIC_DIR = "static";
const CONTENT_DIR = "content";
const CSS_INPUT = "src/styles/global.css";
const CSS_OUTPUT = "dist/styles.css";

async function generatePages(): Promise<SitePage[]> {
  const pages: SitePage[] = [];
  // Stable order (home first, then by name) for the sitemap and RSS feed.
  const contentFiles = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) =>
      a === "index.md" ? -1 : b === "index.md" ? 1 : a.localeCompare(b),
    );

  for (const file of contentFiles) {
    const filePath = join(CONTENT_DIR, file);
    const parsed = await parseMarkdown(filePath);

    const isIndexFile = file === "index.md";
    const slug = file.replace(".md", "");
    const outputPath = isIndexFile
      ? join(DIST_DIR, "index.html")
      : join(DIST_DIR, slug, "index.html");

    const urlPath = isIndexFile ? "/" : `/${slug}/`;
    pages.push({ title: parsed.title, path: urlPath, updated: parsed.updated });

    if (!isIndexFile) {
      mkdirSync(join(DIST_DIR, slug), { recursive: true });
    }

    const html = (
      <Layout
        title={parsed.title}
        currentPath={urlPath}
        isArticle={!isIndexFile}
      >
        <Page html={parsed.html} />
      </Layout>
    ) as string;

    const fullHtml = `<!DOCTYPE html>\n${html}`;
    await Bun.write(outputPath, fullHtml);

    console.log(
      `   ✓ Generated ${file} → ${outputPath.replace(`${DIST_DIR}/`, "")}`,
    );
  }

  return pages;
}

async function generate404Page() {
  const html = (
    <Layout
      title="404 - Page Not Found"
      description="Page not found"
      currentPath="/404"
    >
      <NotFound />
    </Layout>
  ) as string;

  const fullHtml = `<!DOCTYPE html>\n${html}`;
  await Bun.write(join(DIST_DIR, "404.html"), fullHtml);
  console.log(`   ✓ Generated 404 page → dist/404.html`);
}

async function generateFeeds(pages: SitePage[]) {
  await Bun.write(join(DIST_DIR, "robots.txt"), buildRobotsTxt());
  await Bun.write(join(DIST_DIR, "sitemap.xml"), buildSitemap(pages));
  await Bun.write(join(DIST_DIR, "index.xml"), buildRss(pages));
  console.log(`   ✓ Generated robots.txt, sitemap.xml, index.xml (RSS)`);
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

    // Phase 3: Copy CSS
    console.log("🎨 Phase 3: Copying CSS...");

    const css = await Bun.file(CSS_INPUT).text();
    await Bun.write(CSS_OUTPUT, css);

    console.log(`   ✓ Copied ${CSS_INPUT} → ${CSS_OUTPUT}\n`);

    // Phase 4: Generate pages
    console.log("📄 Phase 4: Generating pages...");
    const pages = await generatePages();
    await generate404Page();
    await generateFeeds(pages);
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
