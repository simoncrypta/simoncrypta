/**
 * RSS Feed Generator for Simon's Crypta
 * Generates RSS 2.0 XML feed
 */

export interface PageInfo {
  title: string;
  path: string;
  description: string;
  content?: string;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate RSS 2.0 feed XML
 */
export function generateRSS(pages: PageInfo[]): string {
  const baseUrl = "https://simoncrypta.dev";
  const siteTitle = "Simon's Crypta";
  const siteDescription = "Professional vibe coder sharing contexts and knowledge for every dimension";
  const lastBuildDate = new Date().toUTCString();

  // Build items from pages
  const items = pages
    .map((page) => {
      const pageUrl = `${baseUrl}${page.path === "/" ? "" : page.path}`;
      const description = escapeXml(page.description || page.content?.substring(0, 200) || "");
      const title = escapeXml(page.title);

      return `    <item>
      <title>${title}</title>
      <link>${pageUrl}</link>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return rss;
}
