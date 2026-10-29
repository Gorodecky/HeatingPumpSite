const r32Models = [
  ["4", "4.3", "5.2", "4.86", "3.32"],
  ["6", "6.25", "5.0", "4.96", "3.53"],
  ["8", "8.4", "5.2", "5.22", "3.37"],
  ["10", "10.0", "5.0", "5.20", "3.50"],
  ["12", "12.2", "4.96", "4.82", "3.46"],
  ["14", "14.5", "4.71", "4.71", "3.48"],
  ["16", "16.1", "4.51", "4.63", "3.43"],
];

const r32Features = [
  [
    "01",
    "Два контури опалення",
    "За каталогом, система може одночасно працювати з контурами різної температури, наприклад радіаторами та теплою підлогою.",
  ],
  [
    "02",
    "Погодозалежне керування",
    "Температура теплоносія автоматично коригується відповідно до зовнішньої температури.",
  ],
  [
    "03",
    "Гаряча вода",
    "Передбачені функції нагрівання та періодичної дезінфекції бака ГВП. Температури й алгоритми залежать від конфігурації.",
  ],
  [
    "04",
    "Керування",
    "У каталозі зазначені керування за температурою подачі, кімнатним датчиком, кімнатним термостатом або буферною ємністю.",
  ],
  [
    "05",
    "Інтеграція",
    "Заявлена підтримка Smart Grid, Wi‑Fi керування та підключення до систем диспетчеризації через Modbus.",
  ],
  [
    "06",
    "Режими та джерела",
    "Є режим відпустки та можливість поєднання з допоміжним нагрівачем, сонячними панелями чи іншим джерелом тепла.",
  ],
];

export default function AuxPage({
  onBack,
  onContact,
}: {
  onBack: () => void;
  onContact: () => void;
}) {
  return (
    <main className="fado-page aux-page">
      <div className="container fado-content">
        <button className="button button-outline fado-back" onClick={onBack}>
          ← Усі виробники
        </button>
        <nav className="breadcrumbs" aria-label="Навігаційний ланцюжок">
          <button onClick={onBack}>Виробники</button>
          <span aria-hidden="true">/</span>
          <span aria-current="page">AUX</span>
        </nav>

        <section className="fado-hero aux-hero">
          <div className="fado-hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              ВИРОБНИК · ТЕПЛОВІ НАСОСИ
            </p>
            <h1>
              <img
                className="aux-hero-logo"
                src={`${import.meta.env.BASE_URL}images/aux-logo.png`}
                alt="AUX"
              />
            </h1>
            <p className="fado-lead">
              Повітряно-водяні теплові насоси AUX для опалення, охолодження та
              гарячого водопостачання. У каталозі R32 v6 є спліт- і моноблочні
              моделі 4–16 кВт; на поточному офіційному сайті також представлений
              моноблок R290.
            </p>
            <button className="button button-dark" onClick={onContact}>
              Обговорити підбір <span>↗</span>
            </button>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}images/aux-split-heat-pump.webp`}
            alt="Зовнішній блок повітряно-водяного теплового насоса AUX"
          />
        </section>

        <section
          className="fado-categories aux-series"
          aria-labelledby="aux-series-title"
        >
          <div className="fado-section-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              МОДЕЛЬНІ СЕРІЇ
            </p>
            <h2 id="aux-series-title">
              Два формати
              <br />
              <span>системи.</span>
            </h2>
            <p>
              Вибір між спліт-системою та моноблоком залежить від проєкту, місця
              монтажу й вимог до гідравлічної частини.
            </p>
          </div>
          <div className="aux-series-grid">
            <article className="aux-series-card">
              <img
                src={`${import.meta.env.BASE_URL}images/aux-split-heat-pump.webp`}
                alt="Спліт-тепловий насос AUX"
                loading="lazy"
              />
              <div>
                <span className="fado-card-kicker">01 / СПЛІТ-СИСТЕМА</span>
                <h3>Heat Pump R32</h3>
                <p>
                  Спліт-серія AUX працює з опалювальними приладами, зокрема
                  теплою підлогою, радіаторами та фанкойлами. Виробник також
                  зазначає режими охолодження й приготування гарячої води.
                </p>
                <a
                  href="https://auxcool.com/products/heat-pumps/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Офіційна сторінка серії <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
            <article className="aux-series-card">
              <img
                src={`${import.meta.env.BASE_URL}images/aux-heat-pump-monobloc.png`}
                alt="Моноблочний тепловий насос AUX"
                loading="lazy"
              />
              <div>
                <span className="fado-card-kicker">02 / МОНОБЛОК</span>
                <h3>Monobloc R290 · офіційний сайт</h3>
                <p>
                  Поточна сторінка AUX описує моноблок на R290 (пропан) і
                  каскадне підключення до восьми агрегатів. У каталозі R32 v6
                  також наведено моноблочні моделі R32: це окрема лінійка, тому
                  холодоагент потрібно звірити за кодом конкретного агрегату.
                </p>
                <a
                  href="https://auxcool.com/products/heat-pumps-monobloc-r290/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Офіційна сторінка серії <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="aux-catalog" aria-labelledby="aux-catalog-title">
          <div className="fado-section-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              КАТАЛОГ R32 V6 · СПЛІТ-СЕРІЯ
            </p>
            <h2 id="aux-catalog-title">
              Типорозміри
              <br />
              <span>4–16 кВт.</span>
            </h2>
            <p>
              Порівняльні показники зовнішніх блоків із каталогу. COP та SCOP
              наведені для визначених температурних режимів і не є сталою
              ефективністю протягом сезону.
            </p>
          </div>
          <div className="aux-table-area">
            <div className="aux-model-table-wrap">
              <table className="aux-model-table">
                <thead>
                  <tr>
                    <th>Типорозмір</th>
                    <th>
                      Опалення
                      <br />
                      кВт¹
                    </th>
                    <th>COP¹</th>
                    <th>
                      SCOP
                      <br />
                      35 °C²
                    </th>
                    <th>
                      SCOP
                      <br />
                      55 °C²
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r32Models.map(([size, capacity, cop, scop35, scop55]) => (
                    <tr key={size}>
                      <th scope="row">{size} кВт</th>
                      <td>{capacity}</td>
                      <td>{cop}</td>
                      <td>{scop35}</td>
                      <td>{scop55}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="aux-table-footnote">
              ¹ Опалення при зовнішньому повітрі +7 °C, вода 30/35 °C. ² Сезонна
              ефективність за каталогом для води 35 °C та 55 °C у середніх
              кліматичних умовах. Значення залежать від умов роботи та
              конфігурації.
            </p>
          </div>
        </section>

        <section className="aux-features" aria-labelledby="aux-features-title">
          <div className="fado-section-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              ФУНКЦІЇ ЗА КАТАЛОГОМ R32 V6
            </p>
            <h2 id="aux-features-title">
              Керування
              <br />
              <span>системою.</span>
            </h2>
            <p>
              Функції, перелічені в каталозі AUX. Доступність окремих опцій
              залежить від моделі та встановлених компонентів.
            </p>
          </div>
          <div className="aux-feature-grid">
            {r32Features.map(([index, title, description]) => (
              <article key={index}>
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="aux-details" aria-labelledby="aux-details-title">
          <div className="fado-section-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              РОБОЧІ МЕЖІ · ЗА КАТАЛОГОМ
            </p>
            <h2 id="aux-details-title">
              Звірте умови
              <br />
              <span>роботи.</span>
            </h2>
            <p>
              Наведені межі стосуються серій R32 у каталозі. Це не замінює
              перевірку потужності при розрахунковій температурі вашого регіону.
            </p>
          </div>
          <div className="aux-facts">
            <article>
              <span>ОПАЛЕННЯ</span>
              <h3>−25…+35 °C</h3>
              <p>
                Зовнішнє повітря. Температура води на виході в режимі опалення —
                до +65 °C за каталогом.
              </p>
            </article>
            <article>
              <span>ГАРЯЧА ВОДА</span>
              <h3>−25…+43 °C</h3>
              <p>
                Зовнішнє повітря. Для бака ГВП у таблиці зазначено діапазон води
                до +60 °C.
              </p>
            </article>
            <article>
              <span>ОХОЛОДЖЕННЯ</span>
              <h3>−5…+52 °C</h3>
              <p>
                Зовнішнє повітря для спліт-серії. Допустимі параметри води
                залежать від конфігурації системи.
              </p>
            </article>
          </div>
        </section>

        <aside className="fado-note">
          <span className="fado-note-mark" aria-hidden="true">
            i
          </span>
          <p>
            Дані взято з українського каталогу AUX R32 v6 та поточних офіційних
            сторінок AUX. У PDF є таблиці для спліт- і моноблочних моделей R32,
            тоді як вебсторінка окремо описує моноблок R290; перед замовленням
            перевірте точний код, холодоагент, електроживлення та актуальну
            документацію. Показники ефективності порівнюйте лише за однакових
            умов випробування. Для підбору потрібен розрахунок тепловтрат
            будинку.
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
              Розрахунок тепловтрат і параметри системи допоможуть визначити,
              які моделі AUX варто розглядати для вашого об’єкта.
            </p>
            <button className="button button-dark" onClick={onContact}>
              Обговорити підбір <span>↗</span>
            </button>
          </div>
        </section>
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
