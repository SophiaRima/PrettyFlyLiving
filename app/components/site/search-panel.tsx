import { Form } from "react-router";

/** The concept's home search panel. GET /stays?area=&in=&out=&guests= */
export function SearchPanel({ areas }: { areas: string[] }) {
  return (
    <Form className="search-panel" id="home-search" method="get" action="/stays">
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
        <input id="s-in" name="in" type="date" aria-label="Check in" />
      </div>
      <div className="field">
        <label htmlFor="s-out">Check out</label>
        <input id="s-out" name="out" type="date" aria-label="Check out" />
      </div>
      <div className="field">
        <label htmlFor="s-guests">Guests</label>
        <select id="s-guests" name="guests" defaultValue="2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} guest{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <button className="btn" type="submit">
        Find a stay ↗
      </button>
    </Form>
  );
}
