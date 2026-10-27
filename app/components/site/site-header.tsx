import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { navItems, site } from "~/lib/site";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigating.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // While the mobile drawer is open: lock page scroll, close on Escape, and
  // move focus into the drawer (and back to the menu button afterwards).
  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    // The drawer starts off-screen and slides in; browsers refuse focus until
    // it is on its way in, so focus the X shortly after opening.
    const timer = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 80);
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  return (
    <header className={menuOpen ? "site-header menu-open" : "site-header"}>
      <div className="container nav-wrap">
        <Link className="brand" to="/" aria-label={`${site.name} home`}>
          <img
            src="/brand/logo.webp"
            alt={site.name}
            width={73}
            height={52}
            loading="eager"
          />
        </Link>
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="nav"
          onClick={() => setMenuOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        {/* Mobile only: dims the uncovered half of the screen; tap to close. */}
        <div
          className="nav-backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <nav className={menuOpen ? "nav open" : "nav"} id="nav" aria-label="Main">
          {/* Mobile drawer header with its own close (X) button. */}
          <div className="nav-drawer-head">
            <span className="eyebrow">Menu</span>
            <button
              ref={closeRef}
              className="nav-close"
              type="button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end>
              {item.label}
            </NavLink>
          ))}
          <Link className="btn nav-cta" to="/stays">
            Find your stay ↗
          </Link>
        </nav>
        <div className="nav-actions">
          <Link className="btn" to="/stays">
            Find your stay ↗
          </Link>
        </div>
      </div>
    </header>
  );
}
