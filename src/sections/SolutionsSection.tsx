import SectionHead from '../components/SectionHead';

export default function SolutionsSection({ goTo }: { goTo: (id: string) => void }) {
  const scenarios = [['A', 'Будую новий будинок', 'Врахуємо проєкт, заплановане утеплення та систему опалення.'], ['B', 'Оновлюю опалення', 'Розберемося з наявним обладнанням, розподілом тепла й обмеженнями будинку.'], ['C', 'Поки вивчаю', 'Пояснимо основні поняття й допоможемо зрозуміти, які дані зібрати.']];
  return <section className="section solutions" id="solutions">
    <div className="container">
      <SectionHead n="01" label="З ЧОГО ПОЧАТИ" title={<>Різні будинки.<br /><span>Свій шлях до тепла.</span></>} intro="Підхід залежить від того, на якому етапі ви зараз. Почнемо з ваших запитань та вихідних даних." />
      <div className="scenario-grid">{scenarios.map(([letter, title, copy]) => <article className="scenario" key={letter}>
        <span className="scenario-letter">{letter}</span><h3>{title}</h3><p>{copy}</p>
        <button aria-label={`Почати: ${title}`} onClick={() => goTo('selection')}>↗</button>
      </article>)}</div>
    </div>
  </section>;
}
