import { useEffect, useState, type FormEvent } from 'react';
import DetailPage from './components/DetailPage';
import { articles, brands, type SelectionForm } from './data/siteContent';
import BrandsSection from './sections/BrandsSection';
import ContactSection from './sections/ContactSection';
import HeroSection from './sections/HeroSection';
import KnowledgeSection from './sections/KnowledgeSection';
import ProcessSection from './sections/ProcessSection';
import SelectionSection from './sections/SelectionSection';
import SolutionsSection from './sections/SolutionsSection';

type View = { kind: 'home' } | { kind: 'brand'; title: string } | { kind: 'article'; title: string } | { kind: 'privacy' };

function viewFromPath(): View {
  const parts = decodeURIComponent(window.location.pathname).split('/').filter(Boolean);
  if (parts[0] === 'privacy') return { kind: 'privacy' };
  if (parts[0] === 'brands') {
    const name = parts[1]?.replace(/-/g, ' ') || 'Бренд';
    return { kind: 'brand', title: brands.find(brand => brand.toLowerCase() === name.toLowerCase()) || name };
  }
  if (parts[0] === 'knowledge') {
    const slug = parts[1] || '';
    const found = articles.find(([title]) => title.toLowerCase().replace(/\s+/g, '-') === slug);
    return { kind: 'article', title: found?.[0] || slug.replace(/-/g, ' ') };
  }
  return { kind: 'home' };
}

function App() {
  const [view, setView] = useState<View>(viewFromPath);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SelectionForm>({ city: '', area: '', object: '', heating: '', timing: '', name: '', phone: '', consent: false });
  const [formMessage, setFormMessage] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    const back = () => { setView(viewFromPath()); window.scrollTo(0, 0); };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, []);

  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
    window.history.pushState({}, '', next.kind === 'home' ? '/' : next.kind === 'privacy' ? '/privacy' : `/${next.kind === 'brand' ? 'brands' : 'knowledge'}/${encodeURIComponent(next.title.toLowerCase().replace(/\s+/g, '-'))}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goTo = (id: string) => {
    setMenuOpen(false);
    if (view.kind !== 'home') navigate({ kind: 'home' });
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 40);
  };
  const patch = (key: keyof SelectionForm, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));
  const submitDemo = (event: FormEvent, which: 'selection' | 'contact') => {
    event.preventDefault();
    if (which === 'selection') setFormMessage('Це демонстраційна форма: заявку ще не передано. Для приймання звернень потрібно підключити CRM або серверний API.');
    else setContactMessage('Це демонстраційна форма: повідомлення не передано. Підключіть CRM або серверний API, щоб отримувати звернення.');
  };
  const selectionNext = () => {
    const required: (keyof SelectionForm)[] = step === 1 ? ['city', 'area', 'object'] : ['heating', 'timing'];
    if (required.some(key => !form[key])) {
      setFormMessage('Заповніть, будь ласка, поля цього кроку. Якщо не знаєте відповідь, оберіть «Не знаю».');
      return;
    }
    setFormMessage('');
    setStep(current => Math.min(3, current + 1));
  };

  if (view.kind === 'brand') return <DetailPage eyebrow="Бренд" title={view.title} onBack={() => navigate({ kind: 'home' })} text="Сторінка бренду готова для наповнення перевіреними даними: офіційні серії обладнання, документація, умови застосування та доступність у регіоні. Технічні характеристики, ціни й сумісність буде додано після перевірки офіційних джерел." />;
  if (view.kind === 'article') return <DetailPage eyebrow="База знань · матеріал для підготовки" title={view.title} onBack={() => navigate({ kind: 'home' })} text="Матеріал готується. Будь-які технічні твердження для цієї теми потрібно перевірити за офіційною документацією виробників і розрахунком для конкретного об’єкта." />;
  if (view.kind === 'privacy') return <DetailPage eyebrow="Документ" title="Політика конфіденційності" onBack={() => navigate({ kind: 'home' })} text="Заглушка. Перед запуском форми необхідно опублікувати політику конфіденційності із зазначенням володільця даних, мети й строків обробки, прав користувача та контактів для звернень." />;

  return <>
    <div className="topbar">
      <div className="container topbar-inner">
        <span>Підбір теплових насосів · Вінниця та область</span>
        <a href="#contact">Зв’язатися <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <header className="header">
      <div className="container header-inner">
        <button className="wordmark" onClick={() => goTo('home')} aria-label="Тепло поруч — на головну">
          <span className="mark" aria-hidden="true">Т<span>.</span></span><span>Тепло поруч<small>ТЕПЛОВІ РІШЕННЯ</small></span>
        </button>
        <button className="menu-toggle" aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? '×' : '☰'}</button>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Головна навігація">
          <button onClick={() => goTo('solutions')}>Рішення</button><button onClick={() => goTo('brands')}>Бренди</button><button onClick={() => goTo('knowledge')}>База знань</button><button onClick={() => goTo('contact')}>Контакти</button>
          <button className="button button-dark nav-cta" onClick={() => goTo('selection')}>Підібрати <span>↗</span></button>
        </nav>
      </div>
    </header>
    <main id="home">
      <HeroSection goTo={goTo} />
      <SolutionsSection goTo={goTo} />
      <ProcessSection />
      <SelectionSection form={form} step={step} message={formMessage} onPatch={patch} onSubmit={event => submitDemo(event, 'selection')} onNext={selectionNext}
        onBack={() => { setFormMessage(''); setStep(current => current - 1); }} onPrivacy={() => navigate({ kind: 'privacy' })} />
      <BrandsSection brands={brands} onBrand={title => navigate({ kind: 'brand', title })} />
      <KnowledgeSection articles={articles} onArticle={title => navigate({ kind: 'article', title })} />
      <ContactSection message={contactMessage} onSubmit={event => submitDemo(event, 'contact')} onPrivacy={() => navigate({ kind: 'privacy' })} />
    </main>
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <button className="wordmark footer-mark" onClick={() => goTo('home')}><span className="mark">Т<span>.</span></span><span>Тепло поруч<small>ТЕПЛОВІ РІШЕННЯ</small></span></button>
            <p className="footer-promise">Продуманий підбір тепла<br />починається з діалогу.</p>
          </div>
          <div className="footer-column"><span>НАВІГАЦІЯ</span><button onClick={() => goTo('solutions')}>Рішення</button><button onClick={() => goTo('brands')}>Бренди</button><button onClick={() => goTo('knowledge')}>База знань</button></div>
          <div className="footer-column"><span>ЗВ’ЯЗОК</span><button onClick={() => goTo('contact')}>Залишити запит ↗</button><p>Телефон: <i>заглушка</i></p><p>Адреса: <i>заглушка</i></p></div>
          <div className="footer-column"><span>ГЕОГРАФІЯ</span><p>Вінниця та Вінницька область</p><button onClick={() => navigate({ kind: 'privacy' })}>Політика конфіденційності</button></div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Тепло поруч · Назва тимчасова</span><span>Контактні дані будуть додані після підтвердження</span><button onClick={() => goTo('home')}>НАГОРУ ↑</button>
        </div>
      </div>
    </footer>
  </>;
}

export default App;
