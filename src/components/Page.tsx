import React from 'react';

interface PageProps {
  html?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Page: React.FC<PageProps> = ({ html, children, className = '' }) => {
  if (html) {
    return (
      <content 
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <content className={className}>
      {children}
    </content>
  );
};
