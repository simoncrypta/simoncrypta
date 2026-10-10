/** Title shown in <title>, feeds and llms.txt, from the file name. */
export function titleFromId(id: string): string {
  if (id === "index") return "Simon's Crypta";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/** From an "*Updated on Month DD, YYYY*" line, if present. */
export function updatedDate(content: string): Date | undefined {
  const match = content.match(/^\*Updated on (.+?)\*\s*$/m);
  if (!match?.[1]) return undefined;
  const date = new Date(`${match[1]} UTC`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Text of the first heading, without markdown or HTML. */
export function firstHeading(content: string): string | undefined {
  const match = content.match(/^#{1,6}\s+(.+)$/m);
  return match?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();
}
