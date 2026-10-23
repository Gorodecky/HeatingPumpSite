import SectionHead from '../components/SectionHead';

export default function BrandsSection({ brands, onBrand }: { brands: readonly string[]; onBrand: (brand: string) => void }) {
  return <section className="section brands-section" id="brands">
    <div className="container">
      <SectionHead n="03" label="БРЕНДИ" title={<>Виробники, про які<br /><span>можна дізнатися.</span></>} intro="Сторінки брендів допоможуть зібрати перевірену інформацію про офіційні лінійки та документацію." />
      <div className="brand-grid">{brands.map((brand, i) => <button className="brand-card" key={brand} onClick={() => onBrand(brand)}>
        <span className="brand-num">0{i + 1} / БРЕНД</span><span className="brand-name">{brand}</span><span className="brand-detail">{brand === 'Viessmann' ? 'Vitocal · моноблоки та спліт' : 'Огляд і офіційні дані'}</span><span className="brand-arrow" aria-hidden="true">↗</span>
      </button>)}</div>
      <p className="accuracy-note"><span>i</span> Модельні характеристики, ціни та сумісність не наведено: їх потрібно перевірити за офіційною документацією.</p>
    </div>
  </section>;
}
