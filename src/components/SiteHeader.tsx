export default function SiteHeader({ menuOpen, onToggleMenu, onNavigate }: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (section: string) => void;
}) {
  return <>
    <div className="topbar">
      <div className="container topbar-inner">
        <span>Підбір теплових насосів · Вінниця та область</span>
        <button className="topbar-link" onClick={() => onNavigate('contact')}>Зв’язатися <span aria-hidden="true">↗</span></button>
      </div>
    </div>
    <header className="header">
      <div className="container header-inner">
        <button className="wordmark" onClick={() => onNavigate('home')} aria-label="Тепло поруч — на головну">
          <span className="mark" aria-hidden="true">Т<span>.</span></span><span>Тепло поруч<small>ТЕПЛОВІ РІШЕННЯ</small></span>
        </button>
        <button className="menu-toggle" aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={menuOpen} onClick={onToggleMenu}>{menuOpen ? '×' : '☰'}</button>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Головна навігація">
          <button onClick={() => onNavigate('solutions')}>Рішення</button><button onClick={() => onNavigate('brands')}>Бренди</button><button onClick={() => onNavigate('knowledge')}>База знань</button><button onClick={() => onNavigate('contact')}>Контакти</button>
          <button className="button button-dark nav-cta" onClick={() => onNavigate('selection')}>Підібрати <span>↗</span></button>
        </nav>
      </div>
    </header>
  </>;
}
