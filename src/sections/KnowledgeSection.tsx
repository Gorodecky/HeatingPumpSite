import SectionHead from '../components/SectionHead';

type Article = readonly [string, string];

export default function KnowledgeSection({ articles, onArticle }: { articles: readonly Article[]; onArticle: (title: string) => void }) {
  return <section className="knowledge-section" id="knowledge">
    <div className="container">
      <SectionHead n="04" label="БАЗА ЗНАНЬ" title={<>Розібратися — теж<br /><span>важлива частина.</span></>} intro="Матеріали для спокійного знайомства з технологією. Технічні твердження перед публікацією потрібно звіряти з офіційною документацією." />
      <div className="article-grid">{articles.map(([title, desc], i) => <button key={title} className="article-card" onClick={() => onArticle(title)}>
        <span className="article-meta">0{i + 1} · ПОЯСНЕННЯ <span>↗</span></span><span className="article-title">{title}</span><span className="article-desc">{desc}</span>
      </button>)}</div>
      <div className="knowledge-foot">Матеріали готуються до наповнення <span>ТЕХНІЧНІ ДАНІ — ЛИШЕ З ПЕРЕВІРЕНИХ ДЖЕРЕЛ</span></div>
    </div>
  </section>;
}
