/// <reference path="../../node_modules/@kitajs/html/all-types.d.ts" />
import type { Children } from '@kitajs/html';

interface PageProps {
  html?: string;
  children?: Children;
  className?: string;
}

export const Page = ({ html, children, className = '' }: PageProps) => {
  if (html) {
    return (
      <content className={className}>{html}</content>
    );
  }
  return (
    <content className={className}>
      {children}
    </content>
  );
};
