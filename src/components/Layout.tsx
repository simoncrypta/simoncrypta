import { Html } from '@kitajs/html';
import type { Children } from '@kitajs/html';
import { SEO } from './SEO';
import { Header } from './Header';
import { Footer } from './Footer';
import { SITE_CONFIG } from '../config';

interface LayoutProps {
  children?: Children;
  title?: string;
  description?: string;
  currentPath?: string;
  image?: string;
  isArticle?: boolean;
}

export function Layout({
  children,
  title,
  description = SITE_CONFIG.description,
  currentPath = "/",
  image,
  isArticle = false
}: LayoutProps) {
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
        
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☕️</text></svg>"
        />

        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};
