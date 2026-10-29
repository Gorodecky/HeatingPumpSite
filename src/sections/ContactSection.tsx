import type { FormEvent } from "react";
import SectionHead from "../components/SectionHead";

export default function ContactSection({
  message,
  consent,
  onConsentChange,
  status,
  onSubmit,
  onPrivacy,
}: {
  message: string;
  consent: boolean;
  onConsentChange: (value: boolean) => void;
  status: "idle" | "sending" | "success" | "error";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPrivacy: () => void;
}) {
  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-layout">
        <div>
          <SectionHead
            label="ЗВ’ЯЗОК"
            title={
              <>
                Є питання?
                <br />
                <span>Напишіть нам.</span>
              </>
            }
            intro="Залиште номер телефону й короткий коментар — у робочій версії ми зв’яжемося з вами."
          />
          <div className="contact-place">
            <span className="orange-dot" />
            Вінниця та область
          </div>
        </div>
        <form className="contact-form" onSubmit={onSubmit}>
          <label className="field-label" htmlFor="cname">
            Ім’я
          </label>
          <input
            id="cname"
            name="name"
            placeholder="Як до вас звертатися?"
            required
          />
          <label className="field-label" htmlFor="cphone">
            Телефон
          </label>
          <input
            id="cphone"
            name="phone"
            type="tel"
            placeholder="+380 …"
            required
          />
          <label className="field-label" htmlFor="comment">
            Короткий коментар <span className="optional">необов’язково</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            placeholder="Що хотіли б дізнатися?"
          />
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => onConsentChange(event.target.checked)}
              required
            />
            <span>
              Погоджуюся на обробку персональних даних, щоб отримати відповідь
              на це звернення.{" "}
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
          <button
            className="button button-dark"
            type="submit"
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
          <p className="contact-callout">
            Або зателефонуйте нам:{" "}
            <a href="tel:+380638788281">+38 (063) 878-82-81</a>
          </p>
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
            Демонстраційний режим: повідомлення не надсилається.
          </p>
        </form>
      </div>
    </section>
  );
}
