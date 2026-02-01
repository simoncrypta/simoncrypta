import { Html } from '@kitajs/html';
import type { Children } from '@kitajs/html';
import { SEO } from './SEO';
import { Header } from './Header';
import { Footer } from './Footer';

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
  description,
  currentPath = "/",
  image,
  isArticle = false
}: LayoutProps) {
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
        
        <script>{fontLoaderScript}</script>
      </head>
      <body className="font-sans font-medium m-0 p-5 max-w-3xl w-full text-left bg-[var(--color-bg)] noise-bg break-words leading-relaxed text-[var(--color-text)] min-h-screen flex flex-col box-border mx-auto text-xl overflow-hidden">
        <Header currentPath={currentPath} />
        <main className="flex-1 grid place-items-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};
