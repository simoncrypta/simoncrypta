import type { Children } from '@kitajs/html';

interface PageProps {
  html?: string;
  children?: Children;
  className?: string;
}

export const Page = ({ html, children, className = '' }: PageProps) => (
  <content className={className}>
    {html || children}
  </content>
);
