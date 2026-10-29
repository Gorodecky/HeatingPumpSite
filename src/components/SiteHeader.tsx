export default function SiteHeader({
  menuOpen,
  onToggleMenu,
  onNavigate,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (section: string) => void;
}) {
  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Теплові насоси · ПП TVD · Вінниця, Бучми, 126</span>
          <a className="topbar-link" href="tel:+380638788281">
            +38 (063) 878-82-81 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <button
            className="wordmark"
            onClick={() => onNavigate("home")}
            aria-label="Тепло поруч — на головну"
          >
            <img
              className="wordmark-logo"
              src={`${import.meta.env.BASE_URL}images/logo_tvd_new2.png`}
              alt=""
            />
            <span>
              ПП TVD<small> РІШЕННЯ ДЛЯ ТЕПЛА</small>
            </span>
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            {menuOpen ? "×" : "☰"}
          </button>
          <nav
            className={menuOpen ? "nav open" : "nav"}
            aria-label="Головна навігація"
          >
            <button onClick={() => onNavigate("solutions")}>Рішення</button>
            <button onClick={() => onNavigate("brands")}>Бренди</button>
            <button onClick={() => onNavigate("knowledge")}>База знань</button>
            <button onClick={() => onNavigate("contact")}>Контакти</button>
            <button
              className="button button-dark nav-cta"
              onClick={() => onNavigate("selection")}
            >
              Підібрати <span>↗</span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
}
