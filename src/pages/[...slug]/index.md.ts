import type { APIRoute } from "astro";
import { type ContentPage, getContentPages } from "../../lib/pages";

// Markdown copy of each page for agents: /index.md, /now/index.md, ...
export async function getStaticPaths() {
  const pages = await getContentPages();
  return pages.map((page) => ({ params: { slug: page.slug }, props: page }));
}

export const GET: APIRoute = ({ props }) =>
  new Response((props as ContentPage).source, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
