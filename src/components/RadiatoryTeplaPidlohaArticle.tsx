import articleSource from "../data/radiatory-chy-tepla-pidloha.md?raw";
import MarkdownArticle from "./MarkdownArticle";

type Props = { onBack: () => void };

const title = "Радіатори чи тепла підлога для теплового насоса: що вибрати?";
export default function RadiatoryTeplaPidlohaArticle({ onBack }: Props) {
  const content = articleSource
    .split(/^### SEO-метадані\s*$/m)[0]
    .replace(/\n---\n\n### Джерела/, "\n### Джерела")
    .trim();

  return (
    <main className="detail-page radiatory-article-page">
      <article className="container vitocal-article">
        <button className="button button-outline article-back" onClick={onBack}>
          ← До бази знань
        </button>
        <header className="vitocal-article-header">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            РОЗБИРАЄМОСЯ САМОСТІЙНО · ПОЯСНЕННЯ
          </p>
          <h1>{title}</h1>
          <p className="tvd-article-meta">
            Практичний гід · Опалення тепловим насосом
          </p>
        </header>
        <MarkdownArticle source={content} />
      </article>
      <footer className="footer">
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} Тепло поруч · Вінниця та область
          </span>
          <button onClick={onBack}>← До бази знань</button>
        </div>
      </footer>
    </main>
  );
}
