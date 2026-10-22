import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  /** Optional button on the right (stacks below on mobile). */
  action?: ReactNode;
}

/** The concept's `.page-hero` used at the top of every secondary page. */
export function PageHero({ eyebrow, title, intro, action }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        {action}
      </div>
    </section>
  );
}
