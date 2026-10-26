import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router";

import { bedroomLabel, countLabel, formatKes } from "~/lib/site";
import type { PropertyCardData } from "~/lib/types";

import { CARD_SIZES, Img } from "./img";
import { useSavedStays } from "./saved-stays";

interface PropertyCardProps {
  property: PropertyCardData;
  /** First card of a page whose photo is the likely LCP (e.g. /stays). */
  priority?: boolean;
}

/** The concept's card(): exact markup, real data. */
export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useSavedStays();
  const href = `/stays/${property.slug}`;
  const saved = isSaved(property.slug);

  function onSave(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    toggle(property.slug);
  }

  return (
    <article className="property-card">
      {/* Clicking the photo opens the stay, as in the concept. */}
      <div className="property-image" onClick={() => navigate(href)}>
        <Img
          src={property.coverKey}
          alt={property.name}
          width={property.coverWidth}
          height={property.coverHeight}
          sizes={CARD_SIZES}
          priority={priority}
        />
        {property.tag && <span className="pill">{property.tag}</span>}
        <button
          type="button"
          className={saved ? "heart saved" : "heart"}
          aria-label={`Save ${property.name}`}
          aria-pressed={saved}
          onClick={onSave}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="property-body">
        <div className="location">{property.area} · Nairobi</div>
        <div className="property-title-row">
          <h3>{property.name}</h3>
          {property.rating !== null && (
            <span className="rating">★ {property.rating.toFixed(1)}</span>
          )}
        </div>
        <div className="meta">
          <span>{bedroomLabel(property.bedrooms, "bed")}</span>
          <span>{property.bathrooms} bath</span>
          <span>{countLabel(property.sleeps, "guest")}</span>
          <span>{property.propertyType}</span>
        </div>
        <div className="price-row">
          <div className="price">
            {formatKes(property.monthlyPriceKes)} <small>/ month</small>
          </div>
          <Link to={href}>View stay ↗</Link>
        </div>
      </div>
    </article>
  );
}
