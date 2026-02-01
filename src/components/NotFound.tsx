import React from 'react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: '"Jersey 25", sans-serif' }}>
        404
      </h1>
      <h2 className="text-3xl font-bold mb-6">
        Page Not Found
      </h2>
      <p className="text-xl mb-8 opacity-80">
        The page you're looking for doesn't exist.
      </p>
      <a 
        href="/" 
        className="text-lg text-accent hover:text-accent-light transition-colors underline"
      >
        ← Back to home
      </a>
    </div>
  );
};
