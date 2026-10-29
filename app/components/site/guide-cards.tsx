import { Link } from "react-router";

import type { GuideCardData } from "~/lib/types";

import { CARD_SIZES, Img } from "./img";

/** Home page photo tile (the concept's `.guide-card`). */
export function GuideTile({ guide }: { guide: GuideCardData }) {
  return (
    <Link viewTransition className="guide-card" to={`/things-to-do/${guide.slug}`}>
      <Img
        src={guide.coverKey}
        alt={guide.title}
        width={guide.coverWidth}
        height={guide.coverHeight}
        sizes={CARD_SIZES}
      />
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
export function GuideArticleCard({ guide, priority = false }: { guide: GuideCardData; priority?: boolean }) {
  const href = `/things-to-do/${guide.slug}`;
  const shown = guide.photos.slice(0, COLLAGE_SIZE);
  return (
    <article className="article-card guide-article">
      <Link
        viewTransition
        className={`guide-collage count-${shown.length}`}
        to={href}
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* On the first card the large cover is the likely LCP; its two
            neighbours load eagerly too, since they're on screen with it. */}
        {shown.map((photo, i) => (
          <span key={photo.key}>
            <Img
              src={photo.key}
              alt=""
              width={photo.width}
              height={photo.height}
              sizes={CARD_SIZES}
              priority={priority && i === 0}
              eager={priority}
            />
          </span>
        ))}
      </Link>
      <div className="property-body">
        <div className="guide-article-head">
          <div className="article-tag">{guide.category} · Nairobi guide</div>
          {guide.photos.length > 0 && <span>{guide.photos.length} views</span>}
        </div>
        <h3>
          <Link viewTransition to={href}>{guide.title}</Link>
        </h3>
        <p>{guide.excerpt}</p>
        {guide.highlights.length > 0 && (
          <ul className="guide-highlights">
            {guide.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
        <Link viewTransition className="text-link" to={href}>
          Explore the local edit ↗
        </Link>
      </div>
    </article>
  );
}
