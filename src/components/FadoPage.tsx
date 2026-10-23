export default function FadoPage({ onBack, onArticle, onContact }: {
  onBack: () => void;
  onArticle: () => void;
  onContact: () => void;
}) {
  return <main className="fado-page">
    <div className="topbar"><div className="container topbar-inner"><span>Виробники · FADO</span><span>Теплові рішення · Вінниця та область</span></div></div>
    <div className="container fado-content">
      <button className="button button-outline fado-back" onClick={onBack}>← Усі виробники</button>
      <nav className="breadcrumbs" aria-label="Навігаційний ланцюжок"><button onClick={onBack}>Виробники</button><span aria-hidden="true">/</span><span aria-current="page">FADO</span></nav>
      <section className="fado-hero">
        <div className="fado-hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />ВИРОБНИК · ТЕПЛОВІ НАСОСИ</p>
          <h1>FADO</h1>
          <p className="fado-lead">Огляд теплових насосів FADO: як працює система, які питання важливо перевірити перед вибором і де знайти матеріал про модельний ряд.</p>
          <button className="button button-dark" onClick={onArticle}>Читати про теплові насоси <span>↗</span></button>
        </div>
        <img src={`${import.meta.env.BASE_URL}images/sajt-59-1-scaled.jpg`} alt="Повітряно-водяний тепловий насос FADO біля приватного будинку" />
      </section>

      <section className="fado-categories" aria-labelledby="fado-categories-title">
        <div className="fado-section-heading"><p className="eyebrow"><span className="eyebrow-line" />ОБЛАДНАННЯ</p><h2 id="fado-categories-title">Категорії FADO</h2><p>Матеріали згруповані за типом обладнання, щоб швидко перейти до потрібної теми.</p></div>
        <button className="fado-article-card" onClick={onArticle}>
          <span className="fado-card-kicker">01 / ТЕПЛОВІ НАСОСИ</span>
          <span className="fado-card-title">Теплові насоси FADO: тепло повітря для комфорту дому</span>
          <span className="fado-card-summary">Принцип роботи повітряно-водяної системи, опалення та гаряча вода, керування, моделі NTS08–NTS16F3 і поради щодо підбору.</span>
          <span className="fado-card-link">Відкрити матеріал <span aria-hidden="true">↗</span></span>
        </button>
      </section>

      <section className="fado-note">
        <span className="fado-note-mark" aria-hidden="true">i</span>
        <p>Технічні характеристики у матеріалі наведені за каталогом FADO. Для вибору конкретної моделі потрібні розрахунок тепловтрат будинку та актуальні таблиці продуктивності для умов проєкту.</p>
      </section>

      <section className="fado-contact">
        <div><p className="eyebrow"><span className="eyebrow-line" />НАСТУПНИЙ КРОК</p><h2>Почніть із будинку,<br /><span>а не з назви моделі.</span></h2></div>
        <div><p>Тепловтрати, система опалення, гаряча вода та можливості електромережі допоможуть визначити, які дані потрібно перевірити для підбору.</p><button className="button button-dark" onClick={onContact}>Обговорити підбір <span>↗</span></button></div>
      </section>
    </div>
    <footer className="footer"><div className="container footer-bottom"><span>© {new Date().getFullYear()} Тепло поруч · Вінниця та область</span><button onClick={onBack}>← Усі виробники</button></div></footer>
  </main>;
}
