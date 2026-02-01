import React from 'react';

interface HeaderProps {
  siteTitle?: string;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ siteTitle = "Simon's Crypta", currentPath }) => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Now', path: '/now' },
    { name: 'Uses', path: '/uses' }
  ];

  return (
    <header className="flex flex-col items-center justify-center py-8">
      <a href="/" className="title no-underline hover:no-underline mb-4">
        <h2 className="text-4xl font-normal m-0" style={{ fontFamily: '"Jersey 25", sans-serif' }}>
          {siteTitle}
        </h2>
      </a>
      <nav className="flex gap-4">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`text-lg hover:text-accent transition-colors ${
              currentPath === item.path ? 'text-accent font-bold' : 'text-text'
            }`}
          >
            {item.name}
          </a>
        ))}
      </nav>
    </header>
  );
};
