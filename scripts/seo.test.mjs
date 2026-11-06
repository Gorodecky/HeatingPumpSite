import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import test from "node:test";
import { createServer } from "vite";

const outputDirectory = path.resolve("dist");
const expectedRoutes = [
  "/",
  "/brands/viessmann/",
  "/brands/lg/",
  "/brands/aux/",
  "/brands/fado/",
  "/knowledge/chi-pidiide-vam-teplovyi-nasos/",
  "/knowledge/cop-i-scop/",
  "/knowledge/radiatory-chy-tepla-pidloha/",
  "/knowledge/vytraty-ta-etapy-montazhu/",
  "/knowledge/teplovi-nasosy-fado/",
  "/privacy/",
];

const readRoute = (route) =>
  readFile(
    path.join(outputDirectory, route.replace(/^\//, ""), "index.html"),
    "utf8",
  );

const expectedStructuredTypes = (route) => {
  if (route === "/") return ["Organization", "WebSite", "Service"];
  if (route.startsWith("/knowledge/"))
    return ["Organization", "Article", "BreadcrumbList"];
  return ["BreadcrumbList"];
};

test("every indexed route has unique metadata and canonical HTML", async () => {
  const documents = await Promise.all(expectedRoutes.map(readRoute));
  const titles = documents.map((html) => html.match(/<title>(.*?)<\/title>/)?.[1]);
  const descriptions = documents.map(
    (html) => html.match(/<meta name="description" content="([^"]+)"/)?.[1],
  );
  const assetPath = documents[0].match(/src="([^\"]*\/assets\/index-[^\"]+\.js)"/)?.[1];
  assert.ok(assetPath, "homepage script asset was not found");
  const assetBase = assetPath.slice(0, assetPath.lastIndexOf("assets/"));
  assert.equal(new Set(titles).size, expectedRoutes.length);
  assert.equal(new Set(descriptions).size, expectedRoutes.length);

  for (const [index, html] of documents.entries()) {
    const canonical = `https://teplo-tvd.live${expectedRoutes[index]}`;
    assert.equal((html.match(/<meta name="description"/g) || []).length, 1);
    assert.equal((html.match(/<meta name="robots"/g) || []).length, 1);
    assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/<meta property="og:site_name"/g) || []).length, 1);
    assert.match(html, /<meta property="og:site_name" content="Тепло поруч"\s*\/?\s*>/);
    assert.match(html, /<meta name="description" content="[^"]+"\s*\/?\s*>/);
    assert.match(html, /<meta name="robots" content="index,follow"\s*\/?\s*>/);
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}" />`));
    assert.ok(html.includes("<h1"), `${expectedRoutes[index]} has no rendered h1`);
    assert.ok(
      html.includes(`src="${assetBase}assets/`),
      `assets use the wrong Vite base path on ${expectedRoutes[index]}`,
    );

    const jsonLdScripts = [
      ...html.matchAll(
        /<script id="seo-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ];
    assert.equal(jsonLdScripts.length, 1, `${expectedRoutes[index]} has one JSON-LD block`);
    const structuredData = JSON.parse(jsonLdScripts[0][1]);
    assert.equal(structuredData["@context"], "https://schema.org");
    const nodes = structuredData["@graph"];
    assert.deepEqual(
      nodes.map((node) => node["@type"]).sort(),
      expectedStructuredTypes(expectedRoutes[index]).sort(),
    );

    const breadcrumb = nodes.find((node) => node["@type"] === "BreadcrumbList");
    if (breadcrumb) {
      const items = breadcrumb.itemListElement;
      assert.equal(items[0].item, "https://teplo-tvd.live/");
      assert.equal(items.at(-1).item, canonical);
    }
    const article = nodes.find((node) => node["@type"] === "Article");
    if (article) assert.equal(article.mainEntityOfPage, canonical);
    const service = nodes.find((node) => node["@type"] === "Service");
    if (service) {
      assert.ok(service.name);
      assert.ok(service.description);
      assert.equal(service.provider["@id"], "https://teplo-tvd.live/#organization");
    }
  }
});

test("prerendered route markup matches the initial React server render", async () => {
  const vite = await createServer({
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  try {
    const [{ default: App }, { syncStructuredData }] = await Promise.all([
      vite.ssrLoadModule("/src/App.tsx"),
      vite.ssrLoadModule("/src/structuredData.ts"),
    ]);
    for (const route of [...expectedRoutes, "/admin/"]) {
      const html = await readRoute(route);
      const markup = renderToString(createElement(App, { initialPath: route }));
      assert.ok(
        html.includes(`<div id="root">${markup}</div>`),
        `prerendered markup differs from the initial React render for ${route}`,
      );
    }
    assert.doesNotThrow(() => renderToString(createElement(App)));

    const scripts = [];
    const fakeDocument = {
      getElementById: (id) => scripts.find((script) => script.id === id) ?? null,
      createElement: (tagName) => ({
        tagName,
        remove() {
          const index = scripts.indexOf(this);
          if (index >= 0) scripts.splice(index, 1);
        },
      }),
      head: { appendChild: (script) => scripts.push(script) },
    };
    syncStructuredData(fakeDocument, "/knowledge/cop-i-scop/");
    const prerenderScript = scripts[0];
    syncStructuredData(fakeDocument, "/knowledge/cop-i-scop/");
    assert.equal(scripts.length, 1, "hydration does not append a duplicate script");
    assert.equal(scripts[0], prerenderScript, "the prerendered script is reused");
    syncStructuredData(fakeDocument, "/brands/lg/");
    assert.equal(scripts.length, 1, "SPA navigation updates the existing script");
    assert.deepEqual(
      JSON.parse(scripts[0].textContent)["@graph"].map((node) => node["@type"]).sort(),
      ["BreadcrumbList"],
    );
    syncStructuredData(fakeDocument, "/not-a-real-page/");
    assert.equal(scripts.length, 0, "non-indexable routes do not keep stale JSON-LD");
  } finally {
    await vite.close();
  }
});

test("admin page is prerendered with noindex", async () => {
  for (const route of ["/admin/"]) {
    const html = await readRoute(route);
    assert.match(html, /<meta name="robots" content="noindex,nofollow"\s*\/?\s*>/);
    assert.doesNotMatch(html, /<script id="seo-jsonld"/);
  }
});

test("legacy Unicode installation URL is retained with the Latin canonical", async () => {
  const html = await readRoute("/knowledge/витрати-та-етапи-монтажу/");
  assert.ok(
    html.includes(
      '<link rel="canonical" href="https://teplo-tvd.live/knowledge/vytraty-ta-etapy-montazhu/" />',
    ),
  );
  assert.match(
    html,
    /<script id="seo-jsonld" type="application\/ld\+json">[\s\S]*?"mainEntityOfPage":"https:\/\/teplo-tvd\.live\/knowledge\/vytraty-ta-etapy-montazhu\/"[\s\S]*?<\/script>/,
  );
});

test("sitemap contains only canonical indexed routes", async () => {
  const sitemap = await readFile(path.join(outputDirectory, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(
    locations,
    expectedRoutes.map((route) => `https://teplo-tvd.live${route}`),
  );
  assert.ok(!sitemap.includes("/HeatingPumpSite/"));
  assert.ok(!sitemap.includes("/admin/"));
});

test("robots.txt points to the production sitemap", async () => {
  const robots = await readFile(path.join(outputDirectory, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/m);
  assert.ok(robots.includes("Sitemap: https://teplo-tvd.live/sitemap.xml"));
});
