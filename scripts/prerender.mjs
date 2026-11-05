import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const outputDirectory = path.resolve("dist");
const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true, hmr: false, ws: false },
});

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

try {
  const [{ default: App }, { seoPages, seoAliases, indexedSeoPages }] = await Promise.all([
    server.ssrLoadModule("/src/App.tsx"),
    server.ssrLoadModule("/src/seo.ts"),
  ]);
  const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");

  for (const page of seoPages) {
    const markup = renderToString(createElement(App, { initialPath: page.path }));
    const canonical = `https://teplo-tvd.live${page.path}`;
    const robots = page.indexable ? "index,follow" : "noindex,nofollow";
    const pageHead = [
      `<title>${escapeHtml(page.title)}</title>`,
      `<meta name="description" content="${escapeHtml(page.description)}" />`,
      `<meta name="robots" content="${robots}" />`,
      `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:url" content="${canonical}" />`,
      `<link rel="canonical" href="${canonical}" />`,
    ].join("\n    ");
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/, "")
      .replace(/\s*<meta\s+(?:name|property)="(?:description|robots|og:title|og:description|og:type|og:url)"[^>]*\/?\s*>/g, "")
      .replace(/\s*<link\s+rel="canonical"[^>]*\/?\s*>/g, "")
      .replace("</head>", `    ${pageHead}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
    const routeDirectory = path.join(outputDirectory, page.path.replace(/^\//, ""));
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(path.join(routeDirectory, "index.html"), html);
  }

  for (const alias of seoAliases) {
    const routeDirectory = path.join(outputDirectory, alias.path.replace(/^\//, ""));
    const canonicalDirectory = path.join(
      outputDirectory,
      alias.canonicalPath.replace(/^\//, ""),
    );
    await mkdir(routeDirectory, { recursive: true });
    await copyFile(
      path.join(canonicalDirectory, "index.html"),
      path.join(routeDirectory, "index.html"),
    );
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...indexedSeoPages().map(
      (page) => `  <url><loc>https://teplo-tvd.live${page.path}</loc></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");
  await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);
} finally {
  await server.close();
}
