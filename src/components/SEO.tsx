import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  url: string;
  image?: string;
  isArticle?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  url, 
  image,
  isArticle = false 
}) => {
  const siteTitle = "Simon's Crypta";
  const defaultDescription = "Professional vibe coder sharing contexts and knowledge for every dimension";
  const siteUrl = "https://simoncrypta.dev";
  const defaultImage = `${siteUrl}/images/og-image.png`;

  const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
  const finalUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;

  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="author" content="simoncrypta" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      <meta property="og:type" content={isArticle ? "article" : "website"} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      <link rel="canonical" href={finalUrl} />
    </>
  );
};
