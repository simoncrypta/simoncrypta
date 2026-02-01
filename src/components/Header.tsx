interface HeaderProps {
  currentPath: string;
}

export function Header({ currentPath }: HeaderProps) {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Now', path: '/now' },
    { name: 'Uses', path: '/uses' }
  ];

  const isActive = (path: string): boolean => 
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  return (
    <header>
      <a href="/" className="title block">
        <h2 className="mt-2.5 mb-0 text-4xl">Simon's Crypta</h2>
      </a>
      <nav>
        {navItems.map((item) => (
          <a 
            key={item.path} 
            href={item.path}
            className={`mr-2.5 text-xl text-[var(--color-link)] underline ${isActive(item.path) ? 'font-bold' : ''}`}
          >
            {item.name}
          </a>
        ))}
      </nav>
    </header>
  );
}
