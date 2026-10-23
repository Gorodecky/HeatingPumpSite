import type { ReactNode } from 'react';

export default function SectionHead({ n, label, title, intro }: {
  n: string;
  label: string;
  title: ReactNode;
  intro: string;
}) {
  return <div className="section-head">
    <div className="section-index">{n}<span> / 05</span></div>
    <div>
      <p className="eyebrow"><span className="eyebrow-line" />{label}</p>
      <h2>{title}</h2>
    </div>
    <p className="section-intro">{intro}</p>
  </div>;
}
