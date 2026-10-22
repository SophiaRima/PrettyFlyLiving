import type { CSSProperties, ReactNode } from "react";

interface CtaBandProps {
  eyebrow?: string;
  title: string;
  text: string;
  /** One button, or several wrapped in `.cta-actions`. */
  children: ReactNode;
  style?: CSSProperties;
}

/** The concept's sage `.cta-band`. */
export function CtaBand({ eyebrow, title, text, children, style }: CtaBandProps) {
  return (
    <div className="cta-band" style={style}>
      <div>
        {eyebrow && (
          <div className="eyebrow" style={{ color: "#e0e5db" }}>
            {eyebrow}
          </div>
        )}
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {children}
    </div>
  );
}

/** CTA band in its usual section wrapper (`padding-top: 0`). */
export function CtaSection(props: CtaBandProps) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <CtaBand {...props} />
      </div>
    </section>
  );
}
