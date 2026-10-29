import type { ReactNode } from "react";

export default function SectionHead({
  label,
  title,
  intro,
}: {
  label: string;
  title: ReactNode;
  intro: string;
}) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">
          <span className="eyebrow-line" />
          {label}
        </p>
        <h2>{title}</h2>
      </div>
      <p className="section-intro">{intro}</p>
    </div>
  );
}
