import SectionHead from '../components/SectionHead';

export default function BrandsSection({ brands, onBrand }: { brands: readonly string[]; onBrand: (brand: string) => void }) {
  return <section className="section brands-section" id="brands">
    <div className="container">
      <SectionHead label="БРЕНДИ" title={<>Виробників, які<br /><span>ми рекомендуємо.</span></>} intro="Сторінки брендів допоможуть Вам самостійно розібратися про виробників теплових насосів які представлені у нас." />
      <div className="brand-grid">{brands.map((brand, i) => <button className="brand-card" key={brand} onClick={() => onBrand(brand)}>
        <span className="brand-num">0{i + 1} / БРЕНД</span>{brand === 'Viessmann' ? <img className="brand-name brand-logo-viessmann" src={`${import.meta.env.BASE_URL}images/viessmann-wordmark-vitorange.png`} alt="Viessmann" /> : brand === 'LG' ? <img className="brand-name brand-logo-lg" src={`${import.meta.env.BASE_URL}images/lg-logo.svg`} alt="LG" /> : brand === 'AUX' ? <img className="brand-name brand-logo-aux" src={`${import.meta.env.BASE_URL}images/aux-logo.png`} alt="AUX" /> : brand === 'FADO' ? <img className="brand-name brand-logo-fado" src={`${import.meta.env.BASE_URL}images/fado-logo.svg`} alt="FADO" /> : <span className="brand-name">{brand}</span>}<span className="brand-detail">{brand === 'Viessmann' ? 'Vitocal · моноблоки та спліт' : 'Огляд і офіційні дані'}</span>{brand === 'Viessmann' && <span className="brand-price">від €6 472</span>}{brand === 'FADO' && <span className="brand-price">від $4 600</span>}{brand === 'AUX' && <span className="brand-price">від $4 980</span>}{brand === 'LG' && <span className="brand-price">від $8 520</span>}<span className="brand-arrow" aria-hidden="true">↗</span>
      </button>)}</div>
      <p className="accuracy-note"><span>i</span> Детальні модельні характеристики та сумісність потрібно перевірити за офіційною документацією.</p>
    </div>
  </section>;
}
