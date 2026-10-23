export default function HeroSection({ goTo }: { goTo: (id: string) => void }) {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />ТЕПЛОВІ НАСОСИ · ВІННИЦЯ</p>
          <h1>Тепло, яке<br />починається<br /><span>з правильного</span><br /><span>рішення.</span></h1>
          <p className="hero-lead">Допоможемо розібратися з тепловим насосом для вашого приватного будинку — з урахуванням об’єкта та ваших планів.</p>
          <div className="hero-actions">
            <button className="button button-dark" onClick={() => goTo('selection')}>Підібрати рішення <span>↗</span></button>
            <button className="button button-outline" onClick={() => goTo('process')}>Як це працює <span>↓</span></button>
          </div>
          <div className="hero-foot"><span className="orange-dot" />Вінниця та область <span className="foot-divider" />Перший крок — розмова про ваш будинок</div>
        </div>
        <div className="hero-visual">
          <img src={`${import.meta.env.BASE_URL}images/home-heat-pump-hero.jpg`} alt="Сучасний приватний будинок із зовнішнім блоком теплового насоса" />
          <div className="image-label"><span>01 / 04</span><i />Проєкт починається з умов об’єкта</div>
          <div className="hero-stamp" aria-hidden="true">ТЕПЛО<br />ПОРУЧ<span>↗</span></div>
        </div>
      </div>
    </section>
    <section className="trust-strip">
      <div className="container trust-grid">
        <span>01 <b>Локальна консультація</b></span><span>02 <b>Технічний підхід</b></span><span>03 <b>Супровід по етапах</b></span><span className="trust-note">Рішення під конкретний будинок</span>
      </div>
    </section>
  </>;
}
