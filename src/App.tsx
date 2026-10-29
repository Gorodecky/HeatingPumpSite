import { useEffect, useState, type FormEvent } from "react";
import DetailPage from "./components/DetailPage";
import AdminPage from "./components/AdminPage";
import FadoPage from "./components/FadoPage";
import AuxPage from "./components/AuxPage";
import FadoHeatPumpArticle from "./components/FadoHeatPumpArticle";
import HeatPumpFitArticle from "./components/HeatPumpFitArticle";
import RadiatoryTeplaPidlohaArticle from "./components/RadiatoryTeplaPidlohaArticle";
import CopScopArticle from "./components/CopScopArticle";
import LgThermaVPage from "./components/LgThermaVPage";
import ViessmannPage from "./components/ViessmannPage";
import InstallationCostsArticle from "./components/InstallationCostsArticle";
import SiteHeader from "./components/SiteHeader";
import { articles, brands, type SelectionForm } from "./data/siteContent";
import BrandsSection from "./sections/BrandsSection";
import ContactSection from "./sections/ContactSection";
import HeroSection from "./sections/HeroSection";
import KnowledgeSection from "./sections/KnowledgeSection";
import ProcessSection from "./sections/ProcessSection";
import SelectionSection from "./sections/SelectionSection";
import SolutionsSection from "./sections/SolutionsSection";

type View =
  | { kind: "home" }
  | { kind: "brand"; title: string }
  | { kind: "article"; title: string }
  | { kind: "privacy" }
  | { kind: "admin" };

function viewFromPath(): View {
  const basePath = import.meta.env.BASE_URL;
  const pathname = window.location.pathname.startsWith(basePath)
    ? `/${window.location.pathname.slice(basePath.length)}`
    : window.location.pathname;
  const parts = decodeURIComponent(pathname).split("/").filter(Boolean);
  if (parts[0] === "admin") return { kind: "admin" };
  if (parts[0] === "privacy") return { kind: "privacy" };
  if (parts[0] === "brands") {
    const name = parts[1]?.replace(/-/g, " ") || "Бренд";
    return {
      kind: "brand",
      title:
        brands.find((brand) => brand.toLowerCase() === name.toLowerCase()) ||
        name,
    };
  }
  if (parts[0] === "knowledge") {
    const slug = parts[1] || "";
    if (slug === "teplovi-nasosy-fado")
      return { kind: "article", title: "Теплові насоси FADO" };
    if (slug === "chi-pidiide-vam-teplovyi-nasos")
      return { kind: "article", title: "Чи підійде вам тепловий насос?" };
    if (slug === "cop-i-scop")
      return {
        kind: "article",
        title: "COP і SCOP: як читати показники ефективності теплового насоса",
      };
    if (slug === "radiatory-chy-tepla-pidloha")
      return { kind: "article", title: "Радіатори чи тепла підлога?" };
    const found = articles.find(
      ([title]) => title.toLowerCase().replace(/\s+/g, "-") === slug,
    );
    return { kind: "article", title: found?.[0] || slug.replace(/-/g, " ") };
  }
  return { kind: "home" };
}

function App() {
  const [view, setView] = useState<View>(viewFromPath);
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SelectionForm>({
    city: "",
    area: "",
    object: "",
    heating: "",
    timing: "",
    name: "",
    phone: "",
    consent: false,
  });
  const [formMessage, setFormMessage] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [contactStatus, setContactStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  useEffect(() => {
    const back = () => {
      setView(viewFromPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);

  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
    const path =
      next.kind === "home"
        ? "/"
        : next.kind === "privacy"
          ? "/privacy"
          : next.kind === "admin"
            ? "/admin"
            : next.kind === "article" && next.title === "Теплові насоси FADO"
              ? "/knowledge/teplovi-nasosy-fado/"
              : next.kind === "article" &&
                  next.title === "Чи підійде вам тепловий насос?"
                ? "/knowledge/chi-pidiide-vam-teplovyi-nasos/"
                : next.kind === "article" &&
                    next.title.startsWith("COP і SCOP:")
                  ? "/knowledge/cop-i-scop/"
                  : next.kind === "article" &&
                      next.title === "Радіатори чи тепла підлога?"
                    ? "/knowledge/radiatory-chy-tepla-pidloha/"
                    : `/${next.kind === "brand" ? "brands" : "knowledge"}/${encodeURIComponent(next.title.toLowerCase().replace(/\s+/g, "-"))}`;
    const basePath = import.meta.env.BASE_URL;
    window.history.pushState({}, "", `${basePath}${path.replace(/^\//, "")}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goTo = (id: string) => {
    setMenuOpen(false);
    if (view.kind !== "home") navigate({ kind: "home" });
    window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      40,
    );
  };
  const siteHeader = (
    <SiteHeader
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((open) => !open)}
      onNavigate={goTo}
    />
  );
  const patch = (key: keyof SelectionForm, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submitLead = async (
    event: FormEvent<HTMLFormElement>,
    which: "selection" | "contact",
  ) => {
    event.preventDefault();
    const setStatus =
      which === "selection" ? setSelectionStatus : setContactStatus;
    const setMessage =
      which === "selection" ? setFormMessage : setContactMessage;
    setStatus("sending");
    setMessage("");
    const contactData = new FormData(event.currentTarget);
    const payload =
      which === "selection"
        ? {
            source: "selection",
            city: form.city,
            area: form.area,
            object: form.object,
            heating: form.heating,
            timing: form.timing,
            name: form.name,
            phone: form.phone,
            consent: form.consent,
          }
        : {
            source: "contact",
            name: String(contactData.get("name") || ""),
            phone: String(contactData.get("phone") || ""),
            comment: String(contactData.get("comment") || ""),
            consent: contactConsent,
          };
    try {
      const response = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          result.error || "Не вдалося надіслати запит. Спробуйте ще раз.",
        );
      setStatus("success");
      setMessage(
        "Дякуємо! Запит збережено. Ми використаємо ці дані, щоб відповісти на нього.",
      );
      if (which === "selection")
        setForm((current) => ({ ...current, consent: false }));
      else setContactConsent(false);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося надіслати запит. Перевірте з’єднання та спробуйте ще раз.",
      );
    }
  };
  const selectionNext = () => {
    const required: (keyof SelectionForm)[] =
      step === 1 ? ["city", "area", "object"] : ["heating", "timing"];
    if (required.some((key) => !form[key])) {
      setFormMessage(
        "Заповніть, будь ласка, поля цього кроку. Якщо не знаєте відповідь, оберіть «Не знаю».",
      );
      return;
    }
    setFormMessage("");
    setSelectionStatus("idle");
    setStep((current) => Math.min(3, current + 1));
  };

  if (view.kind === "admin")
    return (
      <>
        {siteHeader}
        <AdminPage />
      </>
    );
  if (
    view.kind === "article" &&
    view.title === "Чи підійде вам тепловий насос?"
  )
    return (
      <>
        {siteHeader}
        <HeatPumpFitArticle
          onBack={() => navigate({ kind: "home" })}
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (view.kind === "article" && view.title.startsWith("COP і SCOP:"))
    return (
      <>
        {siteHeader}
        <CopScopArticle onBack={() => navigate({ kind: "home" })} />
      </>
    );
  if (view.kind === "article" && view.title === "Радіатори чи тепла підлога?")
    return (
      <>
        {siteHeader}
        <RadiatoryTeplaPidlohaArticle
          onBack={() => navigate({ kind: "home" })}
        />
      </>
    );
  if (view.kind === "article" && view.title === "Витрати та етапи монтажу")
    return (
      <>
        {siteHeader}
        <InstallationCostsArticle
          onBack={() => navigate({ kind: "home" })}
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (
    view.kind === "article" &&
    view.title.toLowerCase() === "теплові насоси fado"
  )
    return (
      <>
        {siteHeader}
        <FadoHeatPumpArticle
          onBack={() => navigate({ kind: "brand", title: "FADO" })}
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (view.kind === "brand" && view.title.toLowerCase() === "fado")
    return (
      <>
        {siteHeader}
        <FadoPage
          onBack={() => navigate({ kind: "home" })}
          onArticle={() =>
            navigate({ kind: "article", title: "Теплові насоси FADO" })
          }
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (view.kind === "brand" && view.title.toLowerCase() === "aux")
    return (
      <>
        {siteHeader}
        <AuxPage
          onBack={() => navigate({ kind: "home" })}
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (view.kind === "brand" && view.title.toLowerCase() === "lg")
    return (
      <>
        {siteHeader}
        <LgThermaVPage
          onBack={() => navigate({ kind: "home" })}
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (view.kind === "brand" && view.title.toLowerCase() === "viessmann")
    return (
      <>
        {siteHeader}
        <ViessmannPage
          onBack={() => navigate({ kind: "home" })}
          onContact={() => {
            navigate({ kind: "home" });
            window.setTimeout(
              () =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" }),
              40,
            );
          }}
        />
      </>
    );
  if (view.kind === "brand")
    return (
      <>
        {siteHeader}
        <DetailPage
          eyebrow="Бренд"
          title={view.title}
          onBack={() => navigate({ kind: "home" })}
          text="Сторінка бренду готова для наповнення перевіреними даними: офіційні серії обладнання, документація, умови застосування та доступність у регіоні. Технічні характеристики, ціни й сумісність буде додано після перевірки офіційних джерел."
        />
      </>
    );
  if (view.kind === "article")
    return (
      <>
        {siteHeader}
        <DetailPage
          eyebrow="База знань · матеріал для підготовки"
          title={view.title}
          onBack={() => navigate({ kind: "home" })}
          text="Матеріал готується. Будь-які технічні твердження для цієї теми потрібно перевірити за офіційною документацією виробників і розрахунком для конкретного об’єкта."
        />
      </>
    );
  if (view.kind === "privacy")
    return (
      <>
        {siteHeader}
        <DetailPage
          eyebrow="Документ · чернетка"
          title="Політика конфіденційності"
          onBack={() => navigate({ kind: "home" })}
          text="Ця сторінка поки є заглушкою, а не завершеною політикою. До публічного запуску власник сайту має надати юридичне ім’я або назву, контактні дані, правову підставу й мету обробки, строки зберігання заявок, порядок реалізації прав користувачів, а також відомості про одержувачів даних і хостинг. Не надсилайте персональні дані, доки політику не заповнено та не опубліковано."
        />
      </>
    );

  return (
    <>
      {siteHeader}
      <main id="home">
        <HeroSection goTo={goTo} />
        <SolutionsSection goTo={goTo} />
        <ProcessSection />
        <SelectionSection
          form={form}
          step={step}
          message={formMessage}
          status={selectionStatus}
          onPatch={patch}
          onSubmit={(event) => {
            void submitLead(event, "selection");
          }}
          onNext={selectionNext}
          onBack={() => {
            setFormMessage("");
            setStep((current) => current - 1);
          }}
          onPrivacy={() => navigate({ kind: "privacy" })}
        />
        <BrandsSection
          brands={brands}
          onBrand={(title) => navigate({ kind: "brand", title })}
        />
        <KnowledgeSection
          articles={articles}
          onArticle={(title) => navigate({ kind: "article", title })}
        />
        <ContactSection
          message={contactMessage}
          consent={contactConsent}
          onConsentChange={setContactConsent}
          status={contactStatus}
          onSubmit={(event) => {
            void submitLead(event, "contact");
          }}
          onPrivacy={() => navigate({ kind: "privacy" })}
        />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <button
                className="wordmark footer-mark"
                onClick={() => goTo("home")}
              >
                <img
                  className="wordmark-logo footer-logo"
                  src={`${import.meta.env.BASE_URL}images/logo_tvd_new2.png`}
                  alt=""
                />
                <span>
                  ПП TVD<small>РІШЕННЯ ДЛЯ ТЕПЛА</small>
                </span>
              </button>
              <p className="footer-promise">
                Продуманий підбір обладнання для тепла
                <br />
                починається з діалогу.
              </p>
            </div>
            <div className="footer-column">
              <span>НАВІГАЦІЯ</span>
              <button onClick={() => goTo("solutions")}>Рішення</button>
              <button onClick={() => goTo("brands")}>Бренди</button>
              <button onClick={() => goTo("knowledge")}>База знань</button>
            </div>
            <div className="footer-column">
              <span>ЗВ’ЯЗОК</span>
              <button onClick={() => goTo("contact")}>Залишити запит ↗</button>
              <p>
                Телефон: <i>+38(063)878-82-81</i>
              </p>
              <p>
                Адреса:{" "}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Вінниця%2C%20вул.%20Бучми%2C%20126"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i>м. Вінниця, вул. Бучми, 126</i>
                </a>
              </p>
            </div>
            <div className="footer-column">
              <span>ГЕОГРАФІЯ</span>
              <p>Поділля</p>
              <button onClick={() => navigate({ kind: "privacy" })}>
                Політика конфіденційності
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Городецький В.</span>
            <span>Вінниця</span>
            <button onClick={() => goTo("home")}>НАГОРУ ↑</button>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
