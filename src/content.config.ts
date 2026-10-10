import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// content/*.md, no front matter: index.md is the home page.
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./content" }),
});

export const collections = { pages };
