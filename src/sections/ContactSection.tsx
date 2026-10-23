import type { FormEvent } from 'react';
import SectionHead from '../components/SectionHead';

export default function ContactSection({ message, onSubmit, onPrivacy }: { message: string; onSubmit: (event: FormEvent) => void; onPrivacy: () => void }) {
  return <section className="section contact-section" id="contact">
    <div className="container contact-layout">
      <div>
        <SectionHead n="05" label="ЗВ’ЯЗОК" title={<>Є питання?<br /><span>Напишіть нам.</span></>} intro="Залиште номер телефону й короткий коментар — у робочій версії ми зв’яжемося з вами." />
        <div className="contact-place"><span className="orange-dot" />Вінниця та область</div>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <label className="field-label" htmlFor="cname">Ім’я</label><input id="cname" placeholder="Як до вас звертатися?" required />
        <label className="field-label" htmlFor="cphone">Телефон</label><input id="cphone" type="tel" placeholder="+380 …" required />
        <label className="field-label" htmlFor="comment">Короткий коментар <span className="optional">необов’язково</span></label>
        <textarea id="comment" rows={3} placeholder="Що хотіли б дізнатися?" />
        <label className="consent"><input type="checkbox" required />
          <span>Погоджуюся, щоб зі мною зв’язалися щодо мого звернення. <button type="button" className="inline-link" onClick={onPrivacy}>Деталі — у політиці конфіденційності</button></span>
        </label>
        <button className="button button-dark" type="submit">Надіслати запит <span>↗</span></button>
        {message && <p className="form-message" role="status">{message}</p>}
        <p className="privacy-hint">Демонстраційний режим: повідомлення не надсилається.</p>
      </form>
    </div>
  </section>;
}
