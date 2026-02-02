import { SITE_CONFIG } from '../config';

interface SEOProps {
  title?: string;
  description?: string;
  url: string;
  image?: string;
  isArticle?: boolean;
}

export function SEO({ 
  title, 
  description, 
  url, 
  image,
  isArticle = false 
}: SEOProps) {

  const finalTitle = title
    ? (title === SITE_CONFIG.title ? SITE_CONFIG.title : `${title} | ${SITE_CONFIG.title}`)
    : SITE_CONFIG.title;
  const finalDescription = description || SITE_CONFIG.description;
  const finalImage = image 
    ? (image.startsWith('http') ? image : `${SITE_CONFIG.url}${image}`) 
    : `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`;
  const finalUrl = url.startsWith('http') ? url : `${SITE_CONFIG.url}${url}`;

  return (
    <>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="author" content={SITE_CONFIG.author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      <meta property="og:type" content={isArticle ? "article" : "website"} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={SITE_CONFIG.title} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      <link rel="canonical" href={finalUrl} />
    </>
  );
}
