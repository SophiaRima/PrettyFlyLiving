import { Link } from "react-router";

import { site, whatsappUrl } from "~/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link className="brand" to="/" aria-label={`${site.name} home`}>
              <img
                src="/brand/logo-light.png"
                alt={site.name}
                width={101}
                height={72}
                loading="lazy"
              />
            </Link>
            <p style={{ maxWidth: 260, marginTop: 20 }}>
              Thoughtfully selected spaces. Considered hospitality. A more
              comfortable way to experience Nairobi.
            </p>
          </div>
          <div>
            <h2 className="footer-heading">Explore</h2>
            <div className="footer-links">
              <Link to="/stays">Our stays</Link>
              <Link to="/why-us">Why stay with us</Link>
              <Link to="/things-to-do">Nairobi guides</Link>
              <Link to="/management">Property management</Link>
            </div>
          </div>
          <div>
            <h2 className="footer-heading">Guest support</h2>
            <div className="footer-links">
              <Link to="/faqs">Frequently asked questions</Link>
              <Link to="/contact">Contact us</Link>
              <Link to="/contact">Booking enquiries</Link>
              <Link to="/privacy-policy">Privacy &amp; terms</Link>
            </div>
          </div>
          <div>
            <h2 className="footer-heading">Let’s connect</h2>
            <p>Have a question about a stay or your property?</p>
            <div className="footer-links">
              <a href={`mailto:${site.email}`} target="_blank" rel="noopener noreferrer">
                {site.email}
              </a>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                WhatsApp our team ↗
              </a>
              <span>{site.location}</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>Made for feeling at home.</span>
        </div>
      </div>
    </footer>
  );
}
