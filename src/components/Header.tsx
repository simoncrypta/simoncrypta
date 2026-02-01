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
    <header>
      <a href="/" className="title">
        <h2>{siteTitle}</h2>
      </a>
      <nav>
        {navItems.map((item) => (
          <a key={item.path} href={item.path}>
            {item.name}
          </a>
        ))}
      </nav>
    </header>
  );
};
