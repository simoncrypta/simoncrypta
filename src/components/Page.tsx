/// <reference path="../../node_modules/@kitajs/html/all-types.d.ts" />
import type { Children } from '@kitajs/html';

interface PageProps {
  html?: string;
  children?: Children;
  className?: string;
}

export const Page = ({ html, children, className = '' }: PageProps) => (
  <article className={`prose prose-lg prose-invert prose-crypta max-w-none leading-relaxed text-[var(--color-text)] prose-h1:mt-0 prose-h2:mt-0 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 ${className}`}>
    {html || children}
  </article>
);
