import type { APIRoute } from "astro";
import { buildSitemap } from "../lib/feeds";
import { getContentPages } from "../lib/pages";

export const GET: APIRoute = async () =>
  new Response(buildSitemap(await getContentPages()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
