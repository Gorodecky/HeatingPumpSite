export default function ProcessSection() {
  const steps = [
    ["01", "Знайомимося", "Дізнаємося про Вашбудинок і ваші очікування."],
    [
      "02",
      "Уточнюємо умови",
      "Збираємо вихідні дані. За потреби визначаємо, що варто перевірити на об’єкті.",
    ],
    [
      "03",
      "Готуємо наступний крок",
      "Інженерний розрахунок теплових втрат і перевірка умов потрібні для підбору потужності.",
    ],
  ];
  return (
    <section className="process-band" id="process">
      <div className="container process-layout">
        <div>
          <p className="eyebrow light">
            <span className="eyebrow-line" />
            ЯК ЦЕ ПРАЦЮЄ
          </p>
          <h2>
            Спочатку
            <br />
            <em>вивчаємо.</em>
            <br />
            Потім вирішуємо.
          </h2>
          <p className="process-copy">
            Площа — лише один із параметрів. Для підбору потрібні теплові
            втрати, дані про огороджувальні конструкції, систему опалення та
            умови монтажу.
          </p>
        </div>
        <div className="process-steps">
          {steps.map(([n, title, description]) => (
            <div className="process-step" key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span className="step-arrow">↗</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
