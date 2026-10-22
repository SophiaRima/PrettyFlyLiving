import type { ReviewData } from "~/lib/types";

/** First letter of the guest's name, for the avatar circle. */
function initial(name: string): string {
  return Array.from(name.trim())[0]?.toUpperCase() ?? "";
}

/** The concept's `.quote-card` review. */
export function QuoteCard({ review }: { review: ReviewData }) {
  const stars = Math.max(1, Math.min(5, review.rating));
  return (
    <div className="quote-card">
      <div className="stars" aria-label={`${stars} out of 5 stars`}>
        {"★".repeat(stars)}
      </div>
      <blockquote>“{review.body}”</blockquote>
      <div className="person person-row">
        <span className="avatar" aria-hidden="true">
          {initial(review.guestName)}
        </span>
        <div>
          {review.guestName} {review.context && <small>{review.context}</small>}
        </div>
      </div>
    </div>
  );
}
