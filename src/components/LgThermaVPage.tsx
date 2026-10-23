export default function LgThermaVPage({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  return <main className="fado-page lg-page">
    <div className="container fado-content">
      <button className="button button-outline fado-back" onClick={onBack}>← Усі виробники</button>
      <nav className="breadcrumbs" aria-label="Навігаційний ланцюжок"><button onClick={onBack}>Виробники</button><span aria-hidden="true">/</span><span aria-current="page">LG THERMA V</span></nav>

      <section className="fado-hero lg-hero">
        <div className="fado-hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />ВИРОБНИК · ТЕПЛОВІ НАСОСИ</p>
          <h1>THERMA V</h1>
          <p className="lg-model-name">R410A Split · R1 Compressor</p>
          <p className="fado-lead">Повітряний тепловий насос LG для опалення та гарячого водопостачання. Офіційна сторінка THERMA V R410A Split описує оновлений корпус, контролер і функції керування системою; нижче окремо наведені параметри R1 Compressor з наданого каталогу.</p>
          <button className="button button-dark" onClick={onContact}>Обговорити підбір <span>↗</span></button>
        </div>
        <figure className="lg-hero-figure">
          <img src={`${import.meta.env.BASE_URL}images/D01_global-lowtemperature-hero-1-d.avif`} alt="Тепловий насос LG THERMA V з офіційного зображення LG Україна" />
          <figcaption>Зображення THERMA V: <a href="https://www.lg.com/ua/business/heating-split-410a" target="_blank" rel="noreferrer">офіційна сторінка LG Україна</a>.</figcaption>
        </figure>
      </section>

      <section className="lg-facts" aria-label="Коротко про Therma V R1 Compressor">
        <div><span>ПОТУЖНІСТЬ У ЛІНІЙЦІ</span><strong>12 · 14 · 16 кВт</strong></div>
        <div><span>ХОЛОДОАГЕНТ У КАТАЛОЗІ</span><strong>R410A</strong></div>
        <div><span>ОПАЛЕННЯ · ЗОВНІШНЄ ПОВІТРЯ</span><strong>−25…+35 °C</strong></div>
      </section>

      <section className="lg-overview">
        <div className="lg-section-heading"><p className="eyebrow"><span className="eyebrow-line" />ЛІНІЙКА</p><h2>Три типорозміри.<br /><span>Дві схеми живлення.</span></h2><p>Каталог наводить версії 1-фазного живлення 220–240 В і 3-фазного 380–415 В. Конкретну сумісність із мережею потрібно перевірити за повним кодом блока.</p></div>
        <div className="lg-capacity-grid">
          {[12, 14, 16].map((power, index) => <article className="lg-capacity-card" key={power}>
            <span>0{index + 1} / THERMA V R1</span><strong>{power}<small>кВт</small></strong>
            <p>Варіанти з живленням 1-фаза, 230 В або 3-фази, 400 В за каталогом.</p>
          </article>)}
        </div>
      </section>

      <section className="lg-features">
        <div className="lg-section-heading"><p className="eyebrow"><span className="eyebrow-line" />КОНСТРУКЦІЯ</p><h2>Компресор R1<br /><span>і керування системою.</span></h2></div>
        <div className="lg-feature-list">
          <article><span>01</span><div><h3>R1 Scroll Compressor</h3><p>У каталозі R1 описано як спіральний компресор LG. Для тепловіддачі важливі фактичні умови роботи системи та обрана температура води.</p></div></article>
          <article><span>02</span><div><h3>Контролер із кольоровим сенсорним екраном</h3><p>LG вказує 4,3-дюймовий кольоровий LCD, скляну передню панель і сенсорне LED-керування. На екрані можна переглядати та налаштовувати параметри системи.</p></div></article>
          <article><span>03</span><div><h3>Сезонне автоматичне керування</h3><p>Автоматичний сезонний режим коригує налаштування опалення, охолодження та гарячої води залежно від зовнішньої температури.</p></div></article>
          <article><span>04</span><div><h3>Датчик тиску для швидшої реакції</h3><p>За описом LG, датчик безпосередньо вимірює тиск у холодильному контурі, щоб точніше реагувати на зміну навантаження. Візуальна схема системи також показує зовнішній блок.</p></div></article>
          <article><span>05</span><div><h3>Резервна робота при помилках</h3><p>LG описує аварійний режим: за незначних помилок датчиків система може продовжити цикл теплового насоса, а за серйозної несправності холодильного контуру — перейти на електричний нагрівач.</p></div></article>
          <article><span>06</span><div><h3>Діапазон і покриття в серії R1</h3><p>Для R1 Compressor каталог зазначає покриття Gold Fin та роботу на опалення за зовнішньої температури від −25 до +35 °C. Це межі роботи, а не однакова теплова потужність у всіх умовах.</p></div></article>
        </div>
      </section>

      <figure className="lg-official-visual">
        <img src={`${import.meta.env.BASE_URL}images/lg-therma-v-official-control.jpg`} alt="Тепловий насос LG THERMA V біля будинку та схема інтелектуального датчика" loading="lazy" />
        <figcaption>Інфографіка інтелектуального датчика температури й тиску: <a href="https://www.lg.com/ua/business/heating-split-410a" target="_blank" rel="noreferrer">LG Україна</a>.</figcaption>
      </figure>

      <section className="lg-features lg-fan-tech" aria-labelledby="lg-fan-title">
        <div className="lg-section-heading"><p className="eyebrow"><span className="eyebrow-line" />ПЕРЕДОВІ ТЕХНОЛОГІЇ ВЕНТИЛЯТОРА</p><h2 id="lg-fan-title">Більше повітряного потоку. Менше шуму.</h2><p>Каталог пов’язує цю конструкцію з інверторним двигуном BLDC та вдосконаленою геометрією вентилятора.</p></div>
        <div className="lg-fan-content">
          <p>Двигун BLDC і перероблена форма лопатей мають підтримувати потрібний потік повітря зі зниженим рівнем шуму. Це каталожний опис технології; фактичне звучання залежить від режиму, місця встановлення та акустики ділянки.</p>
          <div className="lg-noise-values" aria-label="Показники шуму за каталогом для потужностей 12, 14 і 16 кВт">
            <div><span>Звукова потужність, опалення</span><strong>63 · 64 · 65 <small>дБ(A)</small></strong><p>12 · 14 · 16 кВт</p></div>
            <div><span>Звуковий тиск на відстані 1 м</span><strong>55 · 56 · 57 <small>дБ(A)</small></strong><p>12 · 14 · 16 кВт</p></div>
          </div>
          <p className="lg-noise-note">У порівняльній таблиці каталогу для конкурентних моделей наведено 66 дБ(A) звукової потужності та 58 дБ(A) звукового тиску на 1 м. Порівнюйте ці значення лише з урахуванням умов вимірювання, зазначених виробником.</p>
        </div>
      </section>

      <section className="lg-specs" aria-labelledby="lg-specs-title">
        <div className="lg-section-heading"><p className="eyebrow"><span className="eyebrow-line" />ДАНІ КАТАЛОГУ</p><h2 id="lg-specs-title">Основні параметри</h2><p>Наведені значення стосуються конкретної серії та умов, позначених у каталозі.</p></div>
        <dl className="lg-spec-table">
          <div><dt>Холодоагент</dt><dd>R410A</dd></div>
          <div><dt>Максимальна температура води на виході</dt><dd>57 °C</dd></div>
          <div><dt>SCOP, вода 35 °C</dt><dd>4,65 · клас A+++ для версії 12 кВт, 1-фаза</dd></div>
          <div><dt>Електричний нагрівач</dt><dd>6 кВт для 1-фазної та 9 кВт для 3-фазної конфігурації — за каталогом</dd></div>
          <div><dt>Габарити зовнішнього блока</dt><dd>950 × 1 380 × 330 мм</dd></div>
          <div><dt>Звукова потужність у режимі опалення</dt><dd>63 / 64 / 65 дБ(A) для 12 / 14 / 16 кВт</dd></div>
        </dl>
      </section>

      <aside className="fado-note lg-source-note"><span className="fado-note-mark" aria-hidden="true">i</span><p>Функції THERMA V R410A Split описані за <a href="https://www.lg.com/ua/business/heating-split-410a" target="_blank" rel="noreferrer">офіційною сторінкою LG Україна</a>. Числові параметри, зокрема потужність, шум і температурні межі, наведені за наданим каталогом Therma V R1 Compressor (2021) і стосуються конкретної серії. Перед підбором звірте повний код блоків та актуальну документацію.</p></aside>

      <section className="fado-contact"><div><p className="eyebrow"><span className="eyebrow-line" />НАСТУПНИЙ КРОК</p><h2>Почніть із будинку,<br /><span>а не з кіловатів.</span></h2></div><div><p>Для вибору теплового насоса потрібні тепловтрати, температурний графік опалення, потреба в гарячій воді та можливості електромережі.</p><button className="button button-dark" onClick={onContact}>Обговорити підбір <span>↗</span></button></div></section>
    </div>
    <footer className="footer"><div className="container footer-bottom"><span>© {new Date().getFullYear()} Тепло поруч · Вінниця та область</span><button onClick={onBack}>← Усі виробники</button></div></footer>
  </main>;
}
