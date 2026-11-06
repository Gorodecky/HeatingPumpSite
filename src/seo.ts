export type PageKind = "home" | "brand" | "article" | "privacy" | "admin";

export type SeoPage = {
  path: string;
  kind: PageKind;
  viewTitle?: string;
  title: string;
  description: string;
  indexable: boolean;
};

export const seoPages: SeoPage[] = [
  {
    path: "/",
    kind: "home",
    title: "Теплові насоси у Вінниці та області — Тепло поруч",
    description:
      "Підбір теплового насоса для приватного будинку у Вінниці та області. Оцінка умов об’єкта й наступних кроків від команди «Тепло поруч».",
    indexable: true,
  },
  {
    path: "/brands/viessmann/",
    kind: "brand",
    viewTitle: "Viessmann",
    title: "Теплові насоси Viessmann Vitocal — Тепло поруч",
    description:
      "Огляд теплових насосів Viessmann Vitocal, їхніх серій і застосування для будинків у Вінниці та області.",
    indexable: true,
  },
  {
    path: "/brands/lg/",
    kind: "brand",
    viewTitle: "LG",
    title: "Теплові насоси LG Therma V — Тепло поруч",
    description:
      "Огляд систем LG Therma V для опалення та гарячого водопостачання приватного будинку.",
    indexable: true,
  },
  {
    path: "/brands/aux/",
    kind: "brand",
    viewTitle: "AUX",
    title: "Теплові насоси AUX — Тепло поруч",
    description:
      "Огляд теплових насосів AUX, лінійок обладнання та основних параметрів для підбору.",
    indexable: true,
  },
  {
    path: "/brands/fado/",
    kind: "brand",
    viewTitle: "FADO",
    title: "Теплові насоси FADO — Тепло поруч",
    description:
      "Інформація про теплові насоси FADO, їхні моделі, роботу системи та підбір для будинку.",
    indexable: true,
  },
  {
    path: "/knowledge/chi-pidiide-vam-teplovyi-nasos/",
    kind: "article",
    viewTitle: "Чи підійде вам тепловий насос?",
    title: "Чи підійде тепловий насос для вашого будинку? — Тепло поруч",
    description:
      "Дізнайтеся, які особливості будинку, опалення та гарячої води врахувати перед вибором теплового насоса.",
    indexable: true,
  },
  {
    path: "/knowledge/cop-i-scop/",
    kind: "article",
    viewTitle: "COP і SCOP: як читати показники ефективності теплового насоса",
    title: "COP і SCOP теплового насоса: як читати показники — Тепло поруч",
    description:
      "Пояснюємо різницю між COP і SCOP, умови вимірювання та коректне порівняння ефективності теплових насосів.",
    indexable: true,
  },
  {
    path: "/knowledge/radiatory-chy-tepla-pidloha/",
    kind: "article",
    viewTitle: "Радіатори чи тепла підлога?",
    title: "Радіатори чи тепла підлога для теплового насоса? — Тепло поруч",
    description:
      "Порівняння радіаторів і теплої підлоги для теплового насоса: температура подачі, ефективність та реконструкція.",
    indexable: true,
  },
  {
    path: "/knowledge/vytraty-ta-etapy-montazhu/",
    kind: "article",
    viewTitle: "Витрати та етапи монтажу",
    title: "Витрати та етапи монтажу теплового насоса — Тепло поруч",
    description:
      "Що впливає на бюджет встановлення теплового насоса та які етапи проходить монтаж системи в будинку.",
    indexable: true,
  },
  {
    path: "/knowledge/teplovi-nasosy-fado/",
    kind: "article",
    viewTitle: "Теплові насоси FADO",
    title: "Теплові насоси FADO: моделі та підбір — Тепло поруч",
    description:
      "Огляд теплових насосів FADO: принцип роботи, опалення, гаряча вода, керування та добір обладнання.",
    indexable: true,
  },
  {
    path: "/privacy/",
    kind: "privacy",
    title: "Політика конфіденційності — Тепло поруч",
    description: "Політика конфіденційності сайту teplo-tvd.live.",
    indexable: true,
  },
  {
    path: "/admin/",
    kind: "admin",
    title: "Адміністрування — Тепло поруч",
    description: "Сторінка адміністрування сайту.",
    indexable: false,
  },
];

export const seoAliases = [
  {
    path: "/knowledge/витрати-та-етапи-монтажу/",
    canonicalPath: "/knowledge/vytraty-ta-etapy-montazhu/",
  },
];

export function normalizePath(path: string) {
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // Keep malformed paths as-is; they resolve to the noindex fallback below.
  }
  if (decoded === "/") return "/";
  return `/${decoded.split("/").filter(Boolean).join("/")}/`;
}

export function seoForPath(path: string): SeoPage {
  const normalized = normalizePath(path);
  const page = seoPages.find((candidate) => candidate.path === normalized);
  if (page) return page;
  // Keep the former Unicode route for the installation article canonicalized.
  if (normalized === "/knowledge/витрати-та-етапи-монтажу/") {
    return seoPages.find((candidate) => candidate.viewTitle === "Витрати та етапи монтажу")!;
  }
  return {
    path: normalized,
    kind: "article",
    title: "Сторінку не знайдено — Тепло поруч",
    description: "Запитану сторінку не знайдено.",
    indexable: false,
  };
}

export function seoForView(view: { kind: PageKind; title?: string }): SeoPage {
  const page = seoPages.find(
    (candidate) =>
      candidate.kind === view.kind &&
      (view.kind === "home" || view.kind === "privacy" || view.kind === "admin"
        ? true
        : candidate.viewTitle === view.title),
  );
  if (page) return page;
  const slug = encodeURIComponent((view.title || "not-found").toLowerCase().replace(/\s+/g, "-"));
  const path =
    view.kind === "brand"
      ? `/brands/${slug}/`
      : view.kind === "article"
        ? `/knowledge/${slug}/`
        : "/";
  return {
    path,
    kind: view.kind,
    title: `${view.title || "Сторінку не знайдено"} — Тепло поруч`,
    description: "Сторінка сайту «Тепло поруч» у Вінниці та області.",
    indexable: false,
  };
}

export function indexedSeoPages() {
  return seoPages.filter((page) => page.indexable);
}

export function seoPathForView(view: { kind: PageKind; title?: string }) {
  return seoForView(view).path;
}
