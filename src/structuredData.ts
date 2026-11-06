import { seoForPath } from "./seo";

const SITE_URL = "https://teplo-tvd.live";
const SITE_NAME = "Тепло поруч";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

type JsonLdNode = Record<string, unknown>;
type JsonLdDocument = {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
};

export const JSON_LD_SCRIPT_ID = "seo-jsonld";

export function structuredDataForPath(path: string): JsonLdDocument | null {
  const page = seoForPath(path);
  if (!page.indexable) return null;

  const canonicalUrl = `${SITE_URL}${page.path}`;
  const organization: JsonLdNode = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };
  const graph: JsonLdNode[] = [];

  if (page.kind === "home") {
    graph.push(
      organization,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "uk-UA",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#heat-pump-selection-service`,
        name: "Підбір теплового насоса",
        serviceType: "Підбір теплового насоса для приватного будинку",
        description:
          "Оцінка умов об’єкта та наступних кроків для підбору теплового насоса.",
        areaServed: "Вінниця та Вінницька область",
        provider: { "@id": ORGANIZATION_ID },
      },
    );
  } else if (page.kind === "article") {
    graph.push(
      organization,
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: page.viewTitle ?? page.title,
        description: page.description,
        inLanguage: "uk-UA",
        mainEntityOfPage: canonicalUrl,
        publisher: { "@id": ORGANIZATION_ID },
      },
    );
  }

  if (page.kind !== "home") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Головна",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.viewTitle ?? "Політика конфіденційності",
          item: canonicalUrl,
        },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function serializeStructuredData(data: JsonLdDocument): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function syncStructuredData(documentRef: Document, path: string): void {
  const data = structuredDataForPath(path);
  let script = documentRef.getElementById(
    JSON_LD_SCRIPT_ID,
  ) as HTMLScriptElement | null;

  if (!data) {
    script?.remove();
    return;
  }

  if (!script) {
    script = documentRef.createElement("script");
    script.id = JSON_LD_SCRIPT_ID;
    documentRef.head.appendChild(script);
  }
  script.type = "application/ld+json";
  script.textContent = serializeStructuredData(data);
}
