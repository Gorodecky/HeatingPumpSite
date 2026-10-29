import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const token =
    /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = token.exec(text))) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    if (match[2] !== undefined)
      nodes.push(
        <img
          key={match.index}
          src={`${import.meta.env.BASE_URL}images/${match[3].split("/").pop()}`}
          alt={match[2]}
          loading="lazy"
        />,
      );
    else if (match[4] !== undefined)
      nodes.push(
        <a key={match.index} href={match[5]} target="_blank" rel="noreferrer">
          {match[4]}
        </a>,
      );
    else if (match[6] !== undefined)
      nodes.push(<strong key={match.index}>{match[6]}</strong>);
    else nodes.push(<em key={match.index}>{match[7]}</em>);
    cursor = token.lastIndex;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

const isTableDivider = (line: string) =>
  /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

export default function MarkdownArticle({ source }: { source: string }) {
  const markdown = source.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  const lines = markdown.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      const Tag = heading[1].length === 2 ? "h2" : "h3";
      blocks.push(<Tag key={index}>{inline(heading[2])}</Tag>);
      index += 1;
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1].trim())
    ) {
      const header = cells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|"))
        rows.push(cells(lines[index++]));
      blocks.push(
        <div className="markdown-table-wrap" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={cellIndex}>{inline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {header.map((_, cellIndex) => (
                    <td key={cellIndex}>{inline(row[cellIndex] || "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">"))
        quote.push(lines[index++].trim().replace(/^>\s?/, ""));
      blocks.push(
        <blockquote key={`quote-${index}`}>
          {inline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    const imageMatch = /^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/.exec(
      line,
    );
    if (imageMatch) {
      const [, alt, path, caption] = imageMatch;
      blocks.push(
        <figure key={`image-${index}`}>
          <img
            src={`${import.meta.env.BASE_URL}images/${path.split("/").pop()}`}
            alt={alt}
            loading="lazy"
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>,
      );
      index += 1;
      continue;
    }

    const listMatch =
      /^([-*])\s+(.+)$/.exec(line) || /^(\d+)\.\s+(.+)$/.exec(line);
    if (listMatch) {
      const ordered = /^\d+\./.test(line);
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const itemLine = lines[index].trim();
        const item = ordered
          ? /^\d+\.\s+(.+)$/.exec(itemLine)
          : /^[-*]\s+(.+)$/.exec(itemLine);
        if (item) {
          items.push(<li key={index}>{inline(item[1])}</li>);
          index += 1;
        } else if (
          !itemLine &&
          index + 1 < lines.length &&
          (ordered
            ? /^\d+\.\s+/.test(lines[index + 1].trim())
            : /^[-*]\s+/.test(lines[index + 1].trim()))
        )
          index += 1;
        else break;
      }
      blocks.push(
        ordered ? (
          <ol key={`list-${index}`}>{items}</ol>
        ) : (
          <ul key={`list-${index}`}>{items}</ul>
        ),
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        /^(#{2,3})\s|^\|/.test(next) ||
        next.startsWith("> ") ||
        /^!\[/.test(next) ||
        /^([-*])\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      )
        break;
      paragraph.push(next);
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`}>{inline(paragraph.join(" "))}</p>,
    );
  }

  return <div className="tvd-article-body">{blocks}</div>;
}
