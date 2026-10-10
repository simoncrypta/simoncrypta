import { SITE_CONFIG } from "../config";

export interface SitePage {
  title: string;
  /** URL path, e.g. "/" or "/now/" */
  path: string;
  updated?: Date;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const absoluteUrl = (path: string) => `${SITE_CONFIG.url}${path}`;

export function buildSitemap(pages: SitePage[]): string {
  const urls = pages
    .map((page) => {
      const lastmod = page.updated
        ? `\n    <lastmod>${page.updated.toISOString().slice(0, 10)}</lastmod>`
        : "";
      return `  <url>\n    <loc>${escapeXml(absoluteUrl(page.path))}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRss(pages: SitePage[]): string {
  const items = pages
    .map((page) => {
      const url = escapeXml(absoluteUrl(page.path));
      const pubDate = page.updated
        ? `\n      <pubDate>${page.updated.toUTCString()}</pubDate>`
        : "";
      return `    <item>\n      <title>${escapeXml(page.title)}</title>\n      <link>${url}</link>\n      <guid>${url}</guid>${pubDate}\n    </item>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.title)}</title>
    <link>${SITE_CONFIG.url}/</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_CONFIG.url}/index.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

// Content-Signal: https://contentsignals.org/
export function buildRobotsTxt(): string {
  return `User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

Sitemap: ${SITE_CONFIG.url}/sitemap.xml
`;
}
