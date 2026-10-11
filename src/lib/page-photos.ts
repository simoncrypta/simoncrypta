import type { ImageMetadata } from "astro";
import coffee from "../assets/uses/coffee.jpg";
import desk from "../assets/uses/desk.jpg";
import voyager from "../assets/uses/voyager.jpg";

export interface PagePhoto {
  src: ImageMetadata;
  alt: string;
  /** "wide" spans the column; "aside" floats beside the next list (stacked on mobile). */
  layout: "wide" | "aside";
}

/** Photos per page slug ("index" for home), placed right after the heading
    with that id. List the headings in page order. */
const PAGE_PHOTOS: Record<string, Record<string, PagePhoto[]>> = {
  uses: {
    "on-my-desk": [
      {
        src: desk,
        alt: "Simon's desk at night: an ultrawide curved monitor with a light bar and webcam, Yamaha speakers on each side, and a split Voyager keyboard on an orange desk mat, lit by red ambient light",
        layout: "wide",
      },
      {
        src: voyager,
        alt: "Close-up of Simon typing on the backlit ZSA Voyager split keyboard, with a desk-arm mic, fidget toy and headphones nearby",
        layout: "aside",
      },
    ],
    "bonus-my-coffee-setup": [
      {
        src: coffee,
        alt: "A red Cafelat Robot lever espresso machine next to a Comandante grinder and a scale, with a fresh espresso in an orange cup",
        layout: "aside",
      },
    ],
  },
};

export interface PageSegment {
  html: string;
  photos: PagePhoto[];
}

/**
 * Split rendered Markdown after each heading that has photos, so the page can
 * render each segment followed by its photos. Pages without photos come back
 * as a single segment.
 */
export function pageSegments(slug: string | undefined, html: string): PageSegment[] {
  const photos = PAGE_PHOTOS[slug ?? "index"] ?? {};
  const segments: PageSegment[] = [];
  let rest = html;
  for (const [id, list] of Object.entries(photos)) {
    const match = new RegExp(`<h([1-6]) id="${id}"[^>]*>[\\s\\S]*?</h\\1>`).exec(rest);
    if (!match) throw new Error(`No heading #${id} for photos on page "${slug}"`);
    const end = match.index + match[0].length;
    segments.push({ html: rest.slice(0, end), photos: list });
    rest = rest.slice(end);
  }
  segments.push({ html: rest, photos: [] });
  return segments;
}
