export const SITE_CONFIG = {
  title: "Simon's Crypta",
  description: "Agentic engineer working across design and code",
  url: "https://simoncrypta.dev",
  defaultImage: "/image.png",
  author: "simoncrypta",
  /** Home page portrait (static/images/); swap the files or paths to change the photo. */
  portrait: {
    sources: [
      { src: "/images/portrait.avif", type: "image/avif" },
      { src: "/images/portrait.webp", type: "image/webp" },
    ],
    fallback: "/images/portrait.jpg",
    size: 560,
    alt: "Simon Gagnon smiling, with curly dark hair and a moustache",
  },
} as const;
