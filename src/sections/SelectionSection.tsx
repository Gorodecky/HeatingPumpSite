import type { FormEvent } from "react";
import SectionHead from "../components/SectionHead";
import {
  areas,
  heatingTypes,
  objectTypes,
  timing,
  type SelectionForm,
} from "../data/siteContent";

type FormKey = keyof SelectionForm;

export default function SelectionSection({
  form,
  step,
  message,
  status,
  onPatch,
  onSubmit,
  onNext,
  onBack,
  onPrivacy,
}: {
  form: SelectionForm;
  step: number;
  message: string;
  status: "idle" | "sending" | "success" | "error";
  onPatch: (key: FormKey, value: string | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNext: () => void;
  onBack: () => void;
  onPrivacy: () => void;
}) {
  const choice = (key: FormKey, options: readonly string[]) => (
    <div className="choice-row">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={`choice ${form[key] === option ? "selected" : ""}`}
          aria-pressed={form[key] === option}
          onClick={() => onPatch(key, option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
  return (
    <section className="section selection-section" id="selection">
      <div className="container form-layout">
        <div className="form-aside">
          <SectionHead
            label="ПОПЕРЕДНІЙ ПІДБІР"
            title={
              <>
                Розкажіть
                <br />
                <span>про свій будинок.</span>
              </>
            }
            intro="Кілька запитань допоможуть підготуватися до розмови. Це не калькулятор потужності, вартості експлуатації чи окупності."
          />
          <div className="form-aside-note">
            <span>!</span> Для точного рішення потрібен інженерний розрахунок
            теплових втрат і перевірка умов об’єкта.
          </div>
        </div>
        <form className="selection-form" onSubmit={onSubmit}>
          <div className="step-top">
            <span>КРОК {step} З 3</span>
            <span className="step-progress">
              <i style={{ width: `${step * 33.333}%` }} />
            </span>
          </div>
          {step === 1 && (
            <>
              <label className="field-label" htmlFor="city">
                Населений пункт
              </label>
              <input
                id="city"
                value={form.city}
                onChange={(e) => onPatch("city", e.target.value)}
                placeholder="Наприклад, Вінниця"
                autoComplete="address-level2"
              />
              <label className="field-label">Орієнтовна площа</label>
              {choice("area", areas)}
              <label className="field-label">Тип об’єкта</label>
              {choice("object", objectTypes)}
            </>
          )}
          {step === 2 && (
            <>
              <label className="field-label">Яка система опалення?</label>
              {choice("heating", heatingTypes)}
              <label className="field-label spaced-label">
                Коли плануєте реалізацію?
              </label>
              {choice("timing", timing)}
              <p className="form-hint">
                Можна обрати «Не знаю» — це нормально на етапі знайомства.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <label className="field-label" htmlFor="name">
                Як до вас звертатися?
              </label>
              <input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => onPatch("name", e.target.value)}
                placeholder="Ваше ім’я"
                required
              />
              <label className="field-label" htmlFor="phone">
                Телефон для зв’язку
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => onPatch("phone", e.target.value)}
                placeholder="+380 …"
                required
              />
              <label className="consent">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => onPatch("consent", e.target.checked)}
                  required
                />
                <span>
                  Погоджуюся на обробку персональних даних, щоб отримати
                  відповідь на цей запит.{" "}
                  <a
                    href="/privacy"
                    className="inline-link"
                    onClick={(event) => {
                      event.preventDefault();
                      onPrivacy();
                    }}
                  >
                    Політика конфіденційності
                  </a>
                </span>
              </label>
            </>
          )}
          <div className="form-controls">
            {step > 1 && (
              <button
                type="button"
                className="button button-outline"
                onClick={onBack}
              >
                ← Назад
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="button button-dark"
                onClick={onNext}
              >
                Далі <span>→</span>
              </button>
            ) : (
              <button
                type="submit"
                className="button button-dark"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  "Надсилаємо…"
                ) : (
                  <>
                    Надіслати запит <span>↗</span>
                  </>
                )}
              </button>
            )}
          </div>
          {status === "sending" && (
            <p className="form-message" role="status">
              Надсилаємо запит…
            </p>
          )}
          {message && (
            <p
              className="form-message"
              role={status === "error" ? "alert" : "status"}
            >
              {message}
            </p>
          )}
          <p className="privacy-hint">
            Демонстраційний режим: дані не передаються та не зберігаються.
          </p>
        </form>
      </div>
    </section>
  );
}
