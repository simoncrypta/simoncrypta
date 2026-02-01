import React from 'react';
import { SEO } from './SEO';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  siteUrl?: string;
  currentPath?: string;
  image?: string;
  isArticle?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  siteUrl = "https://simoncrypta.dev",
  currentPath = "/",
  image,
  isArticle = false
}) => {
  const fontLoaderScript = `
    if ("fonts" in document) {
      Promise.all([
        document.fonts.load("500 1em 'Noto Sans'"),
        document.fonts.load("400 1em 'Jersey 25'")
      ]).then(() => document.documentElement.classList.add("fonts-loaded"));
    }
  `;

  return (
    <html lang="en-US">
      <head>
        <SEO 
          title={title} 
          description={description} 
          url={currentPath} 
          image={image}
          isArticle={isArticle}
        />
        
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Jersey+25&display=swap" rel="stylesheet" />

        <link rel="stylesheet" href="/styles.css" />
        
        <script dangerouslySetInnerHTML={{ __html: fontLoaderScript }} />
      </head>
      <body>
        <Header currentPath={currentPath} />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};
