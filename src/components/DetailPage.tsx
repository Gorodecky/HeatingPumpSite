export default function DetailPage({ eyebrow, title, text, onBack }: {
  eyebrow: string;
  title: string;
  text: string;
  onBack: () => void;
}) {
  return <main className="detail-page">
    <div className="topbar">
      <div className="container topbar-inner">
        <span>Тепло поруч · Вінниця та область</span>
        <span>Інформація готується до перевірки</span>
      </div>
    </div>
    <div className="container detail-content">
      <button className="button button-outline" onClick={onBack}>← На головну</button>
      <p className="eyebrow"><span className="eyebrow-line" />{eyebrow}</p>
      <h1>{title}</h1>
      <p>{text}</p>
      <div className="detail-placeholder">РОЗДІЛ ДЛЯ ПЕРЕВІРЕНОЇ ІНФОРМАЦІЇ <span>ТЕПЛО ПОРУЧ · ВІННИЦЯ</span></div>
    </div>
    <footer className="footer">
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Тепло поруч · Назва тимчасова</span>
        <button onClick={onBack}>← Повернутися</button>
      </div>
    </footer>
  </main>;
}
