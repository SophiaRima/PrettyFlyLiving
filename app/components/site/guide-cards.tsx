import { Link } from "react-router";

import type { GuideCardData } from "~/lib/types";

import { Img } from "./img";

/** Home page photo tile (the concept's `.guide-card`). */
export function GuideTile({ guide }: { guide: GuideCardData }) {
  return (
    <Link className="guide-card" to={`/things-to-do/${guide.slug}`}>
      <Img src={guide.coverKey} alt={guide.title} width={guide.coverWidth} height={guide.coverHeight} />
      <div className="guide-copy">
        <small>{guide.category}</small>
        <h3>{guide.title}</h3>
      </div>
    </Link>
  );
}

const COLLAGE_SIZE = 3;

/**
 * Things to Do index card: a 3-photo collage (cover large on the left),
 * then the category, title, excerpt, highlight chips and a link.
 */
export function GuideArticleCard({ guide }: { guide: GuideCardData }) {
  const href = `/things-to-do/${guide.slug}`;
  const shown = guide.photos.slice(0, COLLAGE_SIZE);
  return (
    <article className="article-card guide-article">
      <Link
        className={`guide-collage count-${shown.length}`}
        to={href}
        tabIndex={-1}
        aria-hidden="true"
      >
        {shown.map((photo) => (
          <span key={photo.key}>
            <Img src={photo.key} alt="" width={photo.width} height={photo.height} />
          </span>
        ))}
      </Link>
      <div className="property-body">
        <div className="guide-article-head">
          <div className="article-tag">{guide.category} · Nairobi guide</div>
          {guide.photos.length > 0 && <span>{guide.photos.length} views</span>}
        </div>
        <h3>
          <Link to={href}>{guide.title}</Link>
        </h3>
        <p>{guide.excerpt}</p>
        {guide.highlights.length > 0 && (
          <ul className="guide-highlights">
            {guide.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
        <Link className="text-link" to={href}>
          Explore the local edit ↗
        </Link>
      </div>
    </article>
  );
}
