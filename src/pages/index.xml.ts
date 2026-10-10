import type { APIRoute } from "astro";
import { buildRss } from "../lib/feeds";
import { getContentPages } from "../lib/pages";

export const GET: APIRoute = async () =>
  new Response(buildRss(await getContentPages()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
