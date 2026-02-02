export function Header() {
  return (
    <header>
      <a href="/" className="title">
        <h2>Simon's Crypta</h2>
      </a>
      <nav>
        <a href="/">About</a>
        <span className="nav-separator" aria-hidden="true">·</span>
        <a href="/now/">Now</a>
        <span className="nav-separator" aria-hidden="true">·</span>
        <a href="/uses/">Uses</a>
      </nav>
    </header>
  );
}
