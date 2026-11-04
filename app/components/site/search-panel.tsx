import { Form } from "react-router";

import { minStayNights } from "~/lib/site";

import { keepCheckOutAfter } from "./check-out-field";

/** The concept's home search panel. GET /stays?area=&in=&out=&guests= */
export function SearchPanel({ areas }: { areas: string[] }) {
  return (
    <Form className="search-panel" id="home-search" method="get" action="/stays" viewTransition>
      <div className="field">
        <label htmlFor="s-location">Where in Nairobi?</label>
        <select id="s-location" name="area" defaultValue="">
          <option value="">All locations</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="s-in">Check in</label>
        <input
          id="s-in"
          name="in"
          type="date"
          aria-label="Check in"
          onChange={(event) => keepCheckOutAfter(event.currentTarget, minStayNights)}
        />
      </div>
      <div className="field">
        <label htmlFor="s-out">Check out</label>
        <input id="s-out" name="out" type="date" aria-label={`Check out, at least ${minStayNights} nights after check in`} />
      </div>
      <div className="field">
        <label htmlFor="s-guests">Guests</label>
        {/* Typed, not a dropdown, from 1 with no upper limit (client, 2026-11-04). */}
        <input
          id="s-guests"
          name="guests"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          defaultValue={2}
        />
      </div>
      <button className="btn" type="submit">
        Find a stay ↗
      </button>
    </Form>
  );
}
