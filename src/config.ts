export const SITE_CONFIG = {
  title: "Simon's Crypta",
  description: "Agentic engineer working across design and code",
  url: "https://simoncrypta.dev",
  // Share image (og:image / twitter:image), a 1200x630 JPG in static/.
  defaultImage: {
    path: "/og-voyager.jpg",
    width: 1200,
    height: 630,
    alt: "Simon typing on a backlit ZSA Voyager split keyboard on an orange desk mat, with a mic arm, whiteboard, fidget toy and headphones around it",
  },
  author: "simoncrypta",
} as const;
