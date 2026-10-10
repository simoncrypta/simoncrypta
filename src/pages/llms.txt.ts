import type { APIRoute } from "astro";
import { buildLlmsTxt } from "../lib/feeds";
import { getContentPages } from "../lib/pages";

export const GET: APIRoute = async () =>
  new Response(buildLlmsTxt(await getContentPages()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
