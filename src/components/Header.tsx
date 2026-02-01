interface HeaderProps {
  currentPath: string;
}

export function Header({ currentPath }: HeaderProps) {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Now', path: '/now' },
    { name: 'Uses', path: '/uses' }
  ];

  return (
    <header>
      <a href="/" className="title">
         <h2>Simon's Crypta</h2>
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
}
