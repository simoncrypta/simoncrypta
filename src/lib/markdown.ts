import { basename } from "node:path";

export interface ParsedMarkdown {
  title: string;
  content: string;
  html: string;
  /** From an "*Updated on Month DD, YYYY*" line, if present. */
  updated?: Date;
  /** Text of the first heading, without markdown or HTML. */
  heading?: string;
}

function titleFromFilename(filePath: string): string {
  const filename = basename(filePath, ".md");
  if (filename === "index") return "Simon's Crypta";
  return filename.charAt(0).toUpperCase() + filename.slice(1);
}

function updatedDate(content: string): Date | undefined {
  const match = content.match(/^\*Updated on (.+?)\*\s*$/m);
  if (!match?.[1]) return undefined;
  const date = new Date(`${match[1]} UTC`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function firstHeading(content: string): string | undefined {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();
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
    updated: updatedDate(content),
    heading: firstHeading(content),
  };
}
