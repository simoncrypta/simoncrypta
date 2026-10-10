import { readFile } from "node:fs/promises";
import { type CollectionEntry, getCollection } from "astro:content";
import type { SitePage } from "./feeds";
import { firstHeading, titleFromId, updatedDate } from "./markdown";

export interface ContentPage extends SitePage {
  entry: CollectionEntry<"pages">;
  /** Route param for [...slug]: undefined for the home page. */
  slug: string | undefined;
  /** Markdown source file, byte for byte (served as <page>/index.md). */
  source: string;
}

/** All content pages, home first, then by name (stable sitemap/RSS order). */
export async function getContentPages(): Promise<ContentPage[]> {
  const entries = await getCollection("pages");
  const sorted = entries.sort((a, b) =>
    a.id === "index" ? -1 : b.id === "index" ? 1 : a.id.localeCompare(b.id),
  );
  return Promise.all(
    sorted.map(async (entry) => {
      const source = entry.filePath ? await readFile(entry.filePath, "utf8") : (entry.body ?? "");
      const isIndex = entry.id === "index";
      return {
        entry,
        slug: isIndex ? undefined : entry.id,
        source,
        title: titleFromId(entry.id),
        path: isIndex ? "/" : `/${entry.id}/`,
        updated: updatedDate(source),
        summary: firstHeading(source),
      };
    }),
  );
}
