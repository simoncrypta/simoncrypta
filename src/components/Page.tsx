import React from 'react';

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export const Page: React.FC<PageProps> = ({ children, className = '' }) => {
  return (
    <main className={`flex-grow w-full max-w-3xl mx-auto px-4 ${className}`}>
      {children}
    </main>
  );
};
