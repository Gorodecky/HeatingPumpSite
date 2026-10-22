import { useEffect, useState, type FormEvent } from 'react'

type View = { kind: 'home' } | { kind: 'brand'; title: string } | { kind: 'article'; title: string } | { kind: 'privacy' }
const brands = ['Viessmann', 'LG', 'AUX', 'Fado']
const articles = [
  ['Чи підійде тепловий насос вашому будинку?', 'Починаємо з огляду будинку, утеплення, тепловтрат і доступних джерел тепла.'],
  ['COP і SCOP: як читати показники', 'Показники залежать від умов випробувань і режиму роботи. Порівнюємо їх коректно.'],
  ['Радіатори чи тепла підлога?', 'Температурний режим системи опалення важливий для попередньої оцінки рішення.'],
  ['Витрати та етапи монтажу', 'Що враховують під час планування бюджету й організації робіт на об’єкті.'],
]
const areas = ['До 100 м²', '100–150 м²', '150–250 м²', 'Понад 250 м²', 'Не знаю']
const objectTypes = ['Новий будинок', 'Будинок для реконструкції', 'Інше', 'Не знаю']
const heatingTypes = ['Тепла підлога', 'Радіатори', 'Комбінована система', 'Опалення ще немає', 'Не знаю']
const timing = ['Найближчим часом', 'Протягом 3–6 місяців', 'Пізніше', 'Поки вивчаю', 'Не знаю']

function viewFromPath(): View {
  const parts = decodeURIComponent(window.location.pathname).split('/').filter(Boolean)
  if (parts[0] === 'privacy') return { kind: 'privacy' }
  if (parts[0] === 'brands') {
    const name = parts[1]?.replace(/-/g, ' ') || 'Бренд'
    return { kind: 'brand', title: brands.find(brand => brand.toLowerCase() === name.toLowerCase()) || name }
  }
  if (parts[0] === 'knowledge') {
    const slug = parts[1] || ''
    const found = articles.find(([title]) => title.toLowerCase().replace(/\s+/g, '-') === slug)
    return { kind: 'article', title: found?.[0] || slug.replace(/-/g, ' ') }
  }
  return { kind: 'home' }
}

function App() {
  const [view, setView] = useState<View>(viewFromPath)
  const [menuOpen, setMenuOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ city: '', area: '', object: '', heating: '', timing: '', name: '', phone: '', consent: false })
  const [formMessage, setFormMessage] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  useEffect(() => {
    const back = () => { setView(viewFromPath()); window.scrollTo(0, 0) }
    window.addEventListener('popstate', back)
    return () => window.removeEventListener('popstate', back)
  }, [])
  const navigate = (next: View) => {
    setView(next); setMenuOpen(false); window.history.pushState({}, '', next.kind === 'home' ? '/' : next.kind === 'privacy' ? '/privacy' : `/${next.kind === 'brand' ? 'brands' : 'knowledge'}/${encodeURIComponent(next.title.toLowerCase().replace(/\s+/g, '-'))}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goTo = (id: string) => { setMenuOpen(false); if (view.kind !== 'home') navigate({ kind: 'home' }); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 40) }
  const patch = (key: keyof typeof form, value: string | boolean) => setForm(current => ({ ...current, [key]: value }))
  const submitDemo = (event: FormEvent, which: 'selection' | 'contact') => {
    event.preventDefault()
    if (which === 'selection') setFormMessage('Це демонстраційна форма: заявку ще не передано. Для приймання звернень потрібно підключити CRM або серверний API.')
    else setContactMessage('Це демонстраційна форма: повідомлення не передано. Підключіть CRM або серверний API, щоб отримувати звернення.')
  }
  const selectionNext = () => {
    const required: (keyof typeof form)[] = step === 1 ? ['city', 'area', 'object'] : ['heating', 'timing']
    if (required.some(key => !form[key])) { setFormMessage('Заповніть, будь ласка, поля цього кроку. Якщо не знаєте відповідь, оберіть «Не знаю».'); return }
    setFormMessage(''); setStep(s => Math.min(3, s + 1))
  }
  const choice = (key: keyof typeof form, options: string[]) => <div className="choice-row">{options.map(option => <button type="button" key={option} className={`choice ${form[key] === option ? 'selected' : ''}`} aria-pressed={form[key] === option} onClick={() => patch(key, option)}>{option}</button>)}</div>

  if (view.kind === 'brand') return <DetailPage eyebrow="Бренд" title={view.title} onBack={() => navigate({ kind: 'home' })} text="Сторінка бренду готова для наповнення перевіреними даними: офіційні серії обладнання, документація, умови застосування та доступність у регіоні. Технічні характеристики, ціни й сумісність буде додано після перевірки офіційних джерел." />
  if (view.kind === 'article') return <DetailPage eyebrow="База знань · матеріал для підготовки" title={view.title} onBack={() => navigate({ kind: 'home' })} text="Матеріал готується. Будь-які технічні твердження для цієї теми потрібно перевірити за офіційною документацією виробників і розрахунком для конкретного об’єкта." />
  if (view.kind === 'privacy') return <DetailPage eyebrow="Документ" title="Політика конфіденційності" onBack={() => navigate({ kind: 'home' })} text="Заглушка. Перед запуском форми необхідно опублікувати політику конфіденційності із зазначенням володільця даних, мети й строків обробки, прав користувача та контактів для звернень." />

  return <>
    <div className="topbar"><div className="container topbar-inner"><span>Підбір теплових насосів · Вінниця та область</span><a href="#contact">Зв’язатися <span aria-hidden="true">↗</span></a></div></div>
    <header className="header"><div className="container header-inner"><button className="wordmark" onClick={() => goTo('home')} aria-label="Тепло поруч — на головну"><span className="mark" aria-hidden="true">Т<span>.</span></span><span>Тепло поруч<small>ТЕПЛОВІ РІШЕННЯ</small></span></button>
      <button className="menu-toggle" aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>{menuOpen ? '×' : '☰'}</button>
      <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Головна навігація"><button onClick={() => goTo('solutions')}>Рішення</button><button onClick={() => goTo('brands')}>Бренди</button><button onClick={() => goTo('knowledge')}>База знань</button><button onClick={() => goTo('contact')}>Контакти</button><button className="button button-dark nav-cta" onClick={() => goTo('selection')}>Підібрати <span>↗</span></button></nav>
    </div></header>
    <main id="home">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/>ТЕПЛОВІ НАСОСИ · ВІННИЦЯ</p><h1>Тепло, яке<br/>починається<br/><span>з правильного</span><br/><span>рішення.</span></h1><p className="hero-lead">Допоможемо розібратися з тепловим насосом для вашого приватного будинку — з урахуванням об’єкта та ваших планів.</p><div className="hero-actions"><button className="button button-dark" onClick={() => goTo('selection')}>Підібрати рішення <span>↗</span></button><button className="button button-outline" onClick={() => goTo('process')}>Як це працює <span>↓</span></button></div><div className="hero-foot"><span className="orange-dot"/>Вінниця та область <span className="foot-divider"/>Перший крок — розмова про ваш будинок</div></div><div className="hero-visual"><img src={`${import.meta.env.BASE_URL}images/home-heat-pump.jpg`} alt="Сучасний приватний будинок із зовнішнім блоком теплового насоса"/><div className="image-label"><span>01 / 04</span><i/>Проєкт починається з умов об’єкта</div><div className="hero-stamp" aria-hidden="true">ТЕПЛО<br/>ПОРУЧ<span>↗</span></div></div></div></section>
      <section className="trust-strip"><div className="container trust-grid"><span>01 <b>Локальна консультація</b></span><span>02 <b>Технічний підхід</b></span><span>03 <b>Супровід по етапах</b></span><span className="trust-note">Рішення під конкретний будинок</span></div></section>
      <section className="section solutions" id="solutions"><div className="container"><SectionHead n="01" label="З ЧОГО ПОЧАТИ" title={<>Різні будинки.<br/><span>Свій шлях до тепла.</span></>} intro="Підхід залежить від того, на якому етапі ви зараз. Почнемо з ваших запитань та вихідних даних."/><div className="scenario-grid">{[['A','Будую новий будинок','Врахуємо проєкт, заплановане утеплення та систему опалення.'],['B','Оновлюю опалення','Розберемося з наявним обладнанням, розподілом тепла й обмеженнями будинку.'],['C','Поки вивчаю','Пояснимо основні поняття й допоможемо зрозуміти, які дані зібрати.']].map(([letter,title,copy])=><article className="scenario" key={letter}><span className="scenario-letter">{letter}</span><h3>{title}</h3><p>{copy}</p><button aria-label={`Почати: ${title}`} onClick={() => goTo('selection')}>↗</button></article>)}</div></div></section>
      <section className="process-band" id="process"><div className="container process-layout"><div><p className="eyebrow light"><span className="eyebrow-line"/>ЯК ЦЕ ПРАЦЮЄ</p><h2>Спочатку<br/><em>розуміння.</em><br/>Потім рішення.</h2><p className="process-copy">Площа — лише один із параметрів. Для підбору потрібні тепловтрати, дані про огороджувальні конструкції, систему опалення та умови монтажу.</p></div><div className="process-steps">{[['01','Знайомимося','Дізнаємося про будинок, населений пункт і ваші очікування.'],['02','Уточнюємо умови','Збираємо вихідні дані. За потреби визначаємо, що варто перевірити на об’єкті.'],['03','Готуємо наступний крок','Інженерний розрахунок тепловтрат і перевірка умов потрібні до підбору потужності.']].map(([n,t,d])=><div className="process-step" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><span className="step-arrow">↗</span></div>)}</div></div></section>
      <section className="section selection-section" id="selection"><div className="container form-layout"><div className="form-aside"><SectionHead n="02" label="ПОПЕРЕДНІЙ ПІДБІР" title={<>Розкажіть<br/><span>про будинок.</span></>} intro="Кілька запитань допоможуть підготуватися до розмови. Це не калькулятор потужності, вартості експлуатації чи окупності."/><div className="form-aside-note"><span>!</span> Для точного рішення потрібен інженерний розрахунок тепловтрат і перевірка умов об’єкта.</div></div><form className="selection-form" onSubmit={event => submitDemo(event, 'selection')}><div className="step-top"><span>КРОК {step} З 3</span><span className="step-progress"><i style={{width:`${step * 33.333}%`}}/></span></div>
        {step === 1 && <><label className="field-label" htmlFor="city">Населений пункт</label><input id="city" value={form.city} onChange={e => patch('city', e.target.value)} placeholder="Наприклад, Вінниця" autoComplete="address-level2"/><label className="field-label">Орієнтовна площа</label>{choice('area', areas)}<label className="field-label">Тип об’єкта</label>{choice('object', objectTypes)}</>}
        {step === 2 && <><label className="field-label">Яка система опалення?</label>{choice('heating', heatingTypes)}<label className="field-label spaced-label">Коли плануєте реалізацію?</label>{choice('timing', timing)}<p className="form-hint">Можна обрати «Не знаю» — це нормально на етапі знайомства.</p></>}
        {step === 3 && <><label className="field-label" htmlFor="name">Як до вас звертатися?</label><input id="name" autoComplete="name" value={form.name} onChange={e => patch('name', e.target.value)} placeholder="Ваше ім’я" required/><label className="field-label" htmlFor="phone">Телефон для зв’язку</label><input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => patch('phone', e.target.value)} placeholder="+380 …" required/><label className="consent"><input type="checkbox" checked={form.consent} onChange={e => patch('consent', e.target.checked)} required/><span>Погоджуюся, щоб зі мною зв’язалися щодо мого запиту. <button type="button" className="inline-link" onClick={() => navigate({kind:'privacy'})}>Політика конфіденційності</button></span></label></>}
        <div className="form-controls">{step > 1 && <button type="button" className="button button-outline" onClick={() => {setFormMessage('');setStep(s => s - 1)}}>← Назад</button>}{step < 3 ? <button type="button" className="button button-dark" onClick={selectionNext}>Далі <span>→</span></button> : <button type="submit" className="button button-dark">Надіслати запит <span>↗</span></button>}</div>{formMessage && <p className="form-message" role="status">{formMessage}</p>}<p className="privacy-hint">Демонстраційний режим: дані не передаються та не зберігаються.</p></form></div></section>
      <section className="section brands-section" id="brands"><div className="container"><SectionHead n="03" label="БРЕНДИ" title={<>Виробники, про які<br/><span>можна дізнатися.</span></>} intro="Сторінки брендів допоможуть зібрати перевірену інформацію про офіційні лінійки та документацію."/><div className="brand-grid">{brands.map((brand,i)=><button className="brand-card" key={brand} onClick={() => navigate({kind:'brand',title:brand})}><span className="brand-num">0{i+1} / БРЕНД</span><span className="brand-name">{brand}</span><span className="brand-detail">Огляд і офіційні дані</span><span className="brand-arrow" aria-hidden="true">↗</span></button>)}</div><p className="accuracy-note"><span>i</span> Модельні характеристики, ціни та сумісність не наведено: їх потрібно перевірити за офіційною документацією.</p></div></section>
      <section className="knowledge-section" id="knowledge"><div className="container"><SectionHead n="04" label="БАЗА ЗНАНЬ" title={<>Розібратися — теж<br/><span>важлива частина.</span></>} intro="Матеріали для спокійного знайомства з технологією. Технічні твердження перед публікацією потрібно звіряти з офіційною документацією."/><div className="article-grid">{articles.map(([title,desc],i)=><button key={title} className="article-card" onClick={() => navigate({kind:'article',title})}><span className="article-meta">0{i+1} · ПОЯСНЕННЯ <span>↗</span></span><span className="article-title">{title}</span><span className="article-desc">{desc}</span></button>)}</div><div className="knowledge-foot">Матеріали готуються до наповнення <span>ТЕХНІЧНІ ДАНІ — ЛИШЕ З ПЕРЕВІРЕНИХ ДЖЕРЕЛ</span></div></div></section>
      <section className="section contact-section" id="contact"><div className="container contact-layout"><div><SectionHead n="05" label="ЗВ’ЯЗОК" title={<>Є питання?<br/><span>Напишіть нам.</span></>} intro="Залиште номер телефону й короткий коментар — у робочій версії ми зв’яжемося з вами."/><div className="contact-place"><span className="orange-dot"/>Вінниця та область</div></div><form className="contact-form" onSubmit={event => submitDemo(event, 'contact')}><label className="field-label" htmlFor="cname">Ім’я</label><input id="cname" placeholder="Як до вас звертатися?" required/><label className="field-label" htmlFor="cphone">Телефон</label><input id="cphone" type="tel" placeholder="+380 …" required/><label className="field-label" htmlFor="comment">Короткий коментар <span className="optional">необов’язково</span></label><textarea id="comment" rows={3} placeholder="Що хотіли б дізнатися?"/><label className="consent"><input type="checkbox" required/><span>Погоджуюся, щоб зі мною зв’язалися щодо мого звернення. <button type="button" className="inline-link" onClick={() => navigate({kind:'privacy'})}>Деталі — у політиці конфіденційності</button></span></label><button className="button button-dark" type="submit">Надіслати запит <span>↗</span></button>{contactMessage && <p className="form-message" role="status">{contactMessage}</p>}<p className="privacy-hint">Демонстраційний режим: повідомлення не надсилається.</p></form></div></section>
    </main>
    <footer className="footer"><div className="container"><div className="footer-main"><div><button className="wordmark footer-mark" onClick={() => goTo('home')}><span className="mark">Т<span>.</span></span><span>Тепло поруч<small>ТЕПЛОВІ РІШЕННЯ</small></span></button><p className="footer-promise">Продуманий підбір тепла<br/>починається з діалогу.</p></div><div className="footer-column"><span>НАВІГАЦІЯ</span><button onClick={() => goTo('solutions')}>Рішення</button><button onClick={() => goTo('brands')}>Бренди</button><button onClick={() => goTo('knowledge')}>База знань</button></div><div className="footer-column"><span>ЗВ’ЯЗОК</span><button onClick={() => goTo('contact')}>Залишити запит ↗</button><p>Телефон: <i>заглушка</i></p><p>Адреса: <i>заглушка</i></p></div><div className="footer-column"><span>ГЕОГРАФІЯ</span><p>Вінниця та Вінницька область</p><button onClick={() => navigate({kind:'privacy'})}>Політика конфіденційності</button></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Тепло поруч · Назва тимчасова</span><span>Контактні дані будуть додані після підтвердження</span><button onClick={() => goTo('home')}>НАГОРУ ↑</button></div></div></footer>
  </>
}
function SectionHead({n,label,title,intro}:{n:string;label:string;title:React.ReactNode;intro:string}){return <div className="section-head"><div className="section-index">{n}<span> / 05</span></div><div><p className="eyebrow"><span className="eyebrow-line"/>{label}</p><h2>{title}</h2></div><p className="section-intro">{intro}</p></div>}
function DetailPage({eyebrow,title,text,onBack}:{eyebrow:string;title:string;text:string;onBack:()=>void}){return <main className="detail-page"><div className="topbar"><div className="container topbar-inner"><span>Тепло поруч · Вінниця та область</span><span>Інформація готується до перевірки</span></div></div><div className="container detail-content"><button className="button button-outline" onClick={onBack}>← На головну</button><p className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</p><h1>{title}</h1><p>{text}</p><div className="detail-placeholder">РОЗДІЛ ДЛЯ ПЕРЕВІРЕНОЇ ІНФОРМАЦІЇ <span>ТЕПЛО ПОРУЧ · ВІННИЦЯ</span></div></div><footer className="footer"><div className="container footer-bottom"><span>© {new Date().getFullYear()} Тепло поруч · Назва тимчасова</span><button onClick={onBack}>← Повернутися</button></div></footer></main>}
export default App
