import { useMemo, useState } from "react";
import MarkdownArticle from "./MarkdownArticle";
import tvdArticleSource from "../data/viessmann-heat-pump-90-m2-house.md?raw";

type Refrigerant = "R290" | "R32" | "R410A";
type ProductLine = {
  name: string;
  type: "Моноблок" | "Спліт";
  refrigerant: Refrigerant | "Залежить від типорозміру";
  models: string;
  description: string;
  image: string;
  source: string;
};

const lines: ProductLine[] = [
  {
    name: "Vitocal 250-A",
    type: "Моноблок",
    refrigerant: "R290",
    models: "251.A10 · 251.A13 та інші типорозміри",
    description:
      "Серія для опалення й охолодження приватного будинку, зокрема під час модернізації системи.",
    image: "Vitocal-250-A-heat-pump-old-building-modernisation-16-9.avif",
    source:
      "https://www.viessmann.ua/uk/produkt/teplovyy-nasos/vitocal-250-a.html",
  },
  {
    name: "Vitocal 150-A",
    type: "Моноблок",
    refrigerant: "R290",
    models: "150.A10 · 150.A13 · 150.A16 та інші типорозміри",
    description:
      "Повітряно-водяний моноблок для опалення, охолодження та систем із зовнішнім баком ГВП.",
    image: "Vitocal-150-A-outdoor-unit-house-16-9.avif",
    source:
      "https://www.viessmann.ua/uk/produkt/teplovyy-nasos/vitocal-150-a.html",
  },
  {
    name: "Vitocal 100-S",
    type: "Спліт",
    refrigerant: "Залежить від типорозміру",
    models: "B04 · B06 · B08 — R32; A12 · A14 · A16 — R410A",
    description:
      "Спліт-серія: холодоагент визначається конкретним типом і має бути звірений із шильдиком на корпусі та документацією.",
    image: "viessmann-vitocal-100-s.webp",
    source: "https://www.viessmann.ua/uk/produkt/teplovyy-nasos/vitocal.html",
  },
  {
    name: "Vitocal 200-S",
    type: "Спліт",
    refrigerant: "R410A",
    models: "D10 · D13 · D16",
    description:
      "Спліт-система з окремими зовнішнім і внутрішнім блоками; холодоагент у наведених типах — R410A.",
    image: "viessmann-vitocal-200-s.webp",
    source: "https://www.viessmann.ua/uk/produkt/teplovyy-nasos/vitocal.html",
  },
];

const refrigerantLabel = (value: string) =>
  value === "R290" ? "R290(пропан)" : value;

export default function ViessmannPage({
  onBack,
  onContact,
}: {
  onBack: () => void;
  onContact: () => void;
}) {
  const [type, setType] = useState<"Усі типи" | ProductLine["type"]>(
    "Усі типи",
  );
  const [refrigerant, setRefrigerant] = useState<
    "Усі холодоагенти" | Refrigerant
  >("Усі холодоагенти");
  const [articleOpen, setArticleOpen] = useState(false);
  const visibleLines = useMemo(
    () =>
      lines.filter(
        (line) =>
          (type === "Усі типи" || line.type === type) &&
          (refrigerant === "Усі холодоагенти" ||
            line.refrigerant === refrigerant ||
            (line.name === "Vitocal 100-S" &&
              line.models.includes(refrigerant))),
      ),
    [type, refrigerant],
  );

  return (
    <main className="fado-page viessmann-page">
      <div className="container fado-content">
        <button className="button button-outline fado-back" onClick={onBack}>
          ← Усі виробники
        </button>
        <nav className="breadcrumbs" aria-label="Навігаційний ланцюжок">
          <button onClick={onBack}>Виробники</button>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Viessmann Vitocal</span>
        </nav>
        {articleOpen ? (
          <article className="vitocal-article">
            <button
              className="button button-outline vitocal-article-back"
              onClick={() => {
                setArticleOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              ← До матеріалів
            </button>
            <header className="vitocal-article-header">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                МАТЕРІАЛИ · VIESSMANN
              </p>
              <h1>
                Як підібрати тепловий насос Viessmann для заміського будинку 90
                м²: потужність, витрати на сезон і вибір холодоагенту
              </h1>
              <p className="tvd-article-meta">
                Редакція TVD · 19 жовтня 2026 року
              </p>
            </header>
            <MarkdownArticle source={tvdArticleSource} />
          </article>
        ) : (
          <>
            <section className="fado-hero viessmann-hero">
              <div className="fado-hero-copy">
                <p className="eyebrow">
                  <span className="eyebrow-line" />
                  ВИРОБНИК · ТЕПЛОВІ НАСОСИ
                </p>
                <h1>Vitocal</h1>
                <p className="fado-lead">
                  В лінійці теплових насосів Viessmann Vitocal існують повітряно-водяні моноблоки
                  й спліт-системи. Оберіть конструкцію та холодоагент, щоб
                  звузити огляд моделей.
                </p>
                <button className="button button-dark" onClick={onContact}>
                  Обговорити підбір <span>↗</span>
                </button>
              </div>
              <img
                src={`${import.meta.env.BASE_URL}images/viessmann-vitocal-hero.avif`}
                alt="Зовнішній і внутрішній блоки теплового насоса Viessmann Vitocal 250-A"
              />
            </section>

            <section
              className="vitocal-catalog"
              aria-labelledby="vitocal-catalog-title"
            >
              <div className="fado-section-heading">
                <p className="eyebrow">
                  <span className="eyebrow-line" />
                  АСОРТИМЕНТ
                </p>
                <h2 id="vitocal-catalog-title">
                  Знайдіть потрібну
                  <br />
                  <span>конфігурацію.</span>
                </h2>
                <p>
                  Перевіряйте точний холодоагент і параметри конкретного приладу
                  за технічною документацією.
                </p>
              </div>
              <div className="vitocal-results">
                <div className="vitocal-filters">
                  <label>
                    Конструкція
                    <select
                      value={type}
                      onChange={(event) =>
                        setType(event.target.value as typeof type)
                      }
                    >
                      <option>Усі типи</option>
                      <option>Моноблок</option>
                      <option>Спліт</option>
                    </select>
                  </label>
                  <label>
                    Холодоагент
                    <select
                      value={refrigerant}
                      onChange={(event) =>
                        setRefrigerant(event.target.value as typeof refrigerant)
                      }
                    >
                      <option>Усі холодоагенти</option>
                      <option value="R290">R290(пропан)</option>
                      <option>R32</option>
                      <option>R410A</option>
                    </select>
                  </label>
                  <span className="vitocal-count">
                    {visibleLines.length}{" "}
                    {visibleLines.length === 1 ? "серія" : "серії"}
                  </span>
                </div>
                <div className="vitocal-grid">
                  {visibleLines.map((line, i) => (
                    <article className="vitocal-card" key={line.name}>
                      {line.image ? (
                        <img
                          src={`${import.meta.env.BASE_URL}images/${line.image}`}
                          alt={`Тепловий насос ${line.name}`}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="vitocal-card-placeholder"
                          aria-hidden="true"
                        >
                          <span>VIESSMANN</span>
                          <strong>{line.name}</strong>
                          <small>{line.type} · повітря / вода</small>
                        </div>
                      )}
                      <div className="vitocal-card-content">
                        <span className="vitocal-card-kicker">
                          0{i + 1} / {line.type.toUpperCase()}
                        </span>
                        <h3>{line.name}</h3>
                        <p>{line.description}</p>
                        <dl>
                          <div>
                            <dt>Холодоагент</dt>
                            <dd>{refrigerantLabel(line.refrigerant)}</dd>
                          </div>
                          <div>
                            <dt>Типи</dt>
                            <dd>{line.models}</dd>
                          </div>
                        </dl>
                        <a href={line.source} target="_blank" rel="noreferrer">
                          Технічна інформація <span aria-hidden="true">↗</span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
                {!visibleLines.length && (
                  <p className="vitocal-empty">
                    За цими фільтрами серій не знайдено.
                  </p>
                )}
              </div>
            </section>

            <section
              className="vitocal-materials"
              aria-labelledby="vitocal-materials-title"
            >
              <div className="vitocal-materials-heading">
                <p className="eyebrow">
                  <span className="eyebrow-line" />
                  МАТЕРІАЛИ
                </p>
                <h2 id="vitocal-materials-title">
                  Матеріали про Viessmann Vitocal
                </h2>
                <p>Статті й практичні пояснення для вибору теплового насоса.</p>
              </div>
              <article className="vitocal-material-card">
                <img
                  src={`${import.meta.env.BASE_URL}images/Vitocal-250-A-heat-pump-old-building-modernisation-16-9.avif`}
                  alt="Тепловий насос Viessmann Vitocal 250-A біля будинку"
                  loading="lazy"
                />
                <div className="vitocal-material-card-content">
                  <span className="vitocal-material-category">
                    ТЕПЛОВІ НАСОСИ
                  </span>
                  <button
                    className="vitocal-material-title"
                    onClick={() => {
                      setArticleOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Як підібрати тепловий насос Viessmann для заміського будинку
                    90 м²: потужність, витрати на сезон і вибір холодоагенту
                  </button>
                  <p>
                    Покроковий підбір Vitocal: розрахунок тепловтрат, вибір
                    моделі та холодоагенту, а також орієнтовні витрати на
                    опалювальний сезон.
                  </p>
                  <div className="vitocal-material-meta">
                    <time dateTime="2026-10-19">19 жовтня 2026 року</time>
                    <button
                      className="vitocal-material-arrow"
                      aria-label="Відкрити статтю"
                      onClick={() => {
                        setArticleOpen(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      ↗
                    </button>
                  </div>
                </div>
              </article>
            </section>
            <aside className="fado-note">
              <span className="fado-note-mark" aria-hidden="true">
                i
              </span>
              <p>
                Склад модельних рядів і холодоагент можуть відрізнятися за
                типорозміром та ринком. Значення на цій сторінці допомагають
                зорієнтуватися; перед вибором звірте код моделі з актуальною
                документацією Viessmann. R290(пропан) є горючим холодоагентом,
                тому монтаж виконують відповідно до інструкцій виробника.
              </p>
            </aside>
            <section className="fado-contact">
              <div>
                <p className="eyebrow">
                  <span className="eyebrow-line" />
                  НАСТУПНИЙ КРОК
                </p>
                <h2>
                  Почніть із будинку,
                  <br />
                  <span>а не з назви моделі.</span>
                </h2>
              </div>
              <div>
                <p>
                  Для підбору потрібні тепловтрати, температура системи
                  опалення, потреба в гарячій воді та можливості електромережі.
                </p>
                <button className="button button-dark" onClick={onContact}>
                  Обговорити підбір <span>↗</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>
      <footer className="footer">
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Тепло поруч · Вінниця та область
          </span>
          <button onClick={onBack}>← Усі виробники</button>
        </div>
      </footer>
    </main>
  );
}
