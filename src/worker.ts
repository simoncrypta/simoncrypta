/**
 * Runs in front of the static assets (runWorkerFirst) so agents can ask for
 * Markdown: a request for an HTML page with `Accept: text/markdown` gets the
 * page's pre-built Markdown copy (`<page>/index.md`) instead. Everything else
 * is served from assets as before.
 */

interface Env {
  ASSETS: { fetch(input: Request | URL): Promise<Response> };
}

/** q-value of a media type in an Accept header (0 when absent). */
function quality(accept: string, mediaType: string): number {
  for (const part of accept.split(",")) {
    const [type, ...params] = part.trim().split(";");
    if (type?.trim().toLowerCase() !== mediaType) continue;
    const q = params.find((p) => p.trim().startsWith("q="));
    return q ? Number.parseFloat(q.trim().slice(2)) || 0 : 1;
  }
  return 0;
}

function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get("Accept") ?? "";
  const markdown = quality(accept, "text/markdown");
  return markdown > 0 && markdown >= quality(accept, "text/html");
}

/** "/" -> "/index.md", "/now/" or "/now" -> "/now/index.md"; null for files. */
function markdownPathFor(pathname: string): string | null {
  if (/\.[a-z0-9]+$/i.test(pathname)) return null;
  return `${pathname.endsWith("/") ? pathname : `${pathname}/`}index.md`;
}

/** Copy a response, appending to existing header values (Link, Vary). */
function withHeaders(response: Response, headers: Record<string, string>) {
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) {
    result.headers.append(name, value);
  }
  return result;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const markdownPath = markdownPathFor(url.pathname);
    const isRead = request.method === "GET" || request.method === "HEAD";

    if (markdownPath && isRead && prefersMarkdown(request)) {
      const markdown = await env.ASSETS.fetch(new URL(markdownPath, url));
      if (markdown.ok) {
        const response = withHeaders(markdown, { Vary: "Accept" });
        response.headers.set("Content-Type", "text/markdown; charset=utf-8");
        return response;
      }
    }

    const response = await env.ASSETS.fetch(request);
    const isHtml = response.headers
      .get("Content-Type")
      ?.startsWith("text/html");
    if (!markdownPath || !isHtml || !response.ok) return response;

    return withHeaders(response, {
      Vary: "Accept",
      Link: `<${markdownPath}>; rel="alternate"; type="text/markdown"`,
    });
  },
};
