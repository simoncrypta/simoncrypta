import { serve } from "bun";
import { join } from "path";

const port = 3000;
const distDir = join(import.meta.dir, "dist");

console.log(`🚀 Serving from: ${distDir}`);
console.log(`🌐 Local server: http://localhost:${port}`);
console.log(`Press Ctrl+C to stop\n`);

serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const normalizedPath = normalizeUrlPath(url.pathname);
    const filePath = join(distDir, normalizedPath.slice(1));

    try {
      const file = Bun.file(filePath);
      
      if (!(await file.exists())) {
        return serve404Page();
      }

      return new Response(file, {
        headers: {
          "Content-Type": getContentType(filePath),
        },
      });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

function normalizeUrlPath(pathname: string): string {
  if (pathname === "/") {
    return "/index.html";
  }

  if (!pathname.includes(".") && pathname.endsWith("/")) {
    return `${pathname}index.html`;
  }

  if (!pathname.includes(".") && !pathname.endsWith("/")) {
    return `${pathname}/index.html`;
  }

  return pathname;
}

async function serve404Page(): Promise<Response> {
  const notFoundFile = Bun.file(join(distDir, "404.html"));
  return new Response(await notFoundFile.text(), {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function getContentType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    html: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "application/javascript; charset=utf-8",
    json: "application/json; charset=utf-8",
    xml: "application/xml; charset=utf-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    txt: "text/plain; charset=utf-8",
  };

  return contentTypes[ext || ""] || "application/octet-stream";
}
