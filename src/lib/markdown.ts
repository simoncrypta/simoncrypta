import { basename } from "node:path";

export interface ParsedMarkdown {
  title: string;
  content: string;
  html: string;
}

function titleFromFilename(filePath: string): string {
  const filename = basename(filePath, ".md");
  if (filename === "index") return "Simon's Crypta";
  return filename.charAt(0).toUpperCase() + filename.slice(1);
}

export async function parseMarkdown(filePath: string): Promise<ParsedMarkdown> {
  const file = Bun.file(filePath);
  const content = await file.text();

  // GFM (tables, strikethrough, task lists) is on by default; soft breaks stay soft.
  const html = Bun.markdown.html(content);

  return {
    title: titleFromFilename(filePath),
    content,
    html,
  };
}
