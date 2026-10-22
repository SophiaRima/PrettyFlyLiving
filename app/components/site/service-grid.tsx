export interface ServiceItem {
  icon: string;
  title: string;
  text: string;
}

/** The concept's `.service-grid` of icon cards. */
export function ServiceGrid({ items }: { items: readonly ServiceItem[] }) {
  return (
    <div className="service-grid">
      {items.map((item) => (
        <div className="service-card" key={item.title}>
          <div className="service-icon" aria-hidden="true">
            {item.icon}
          </div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}
