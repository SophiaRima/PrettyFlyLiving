# AGENTS.md — Pretty Fly Living

Instructions for AI coding agents working in this repository. This file is the source of truth for this project and **overrides any AGENTS.md or CLAUDE.md in parent folders** (for example `../AGENTS.md`, which belongs to a different project).

---

## 1. Product

**prettyflyliving.com** is the booking website for Pretty Fly Living's furnished apartments in Nairobi, rented by the month or longer.

- **Client:** Sophiah Rimando Priscilla, Pretty Fly Living
- **Built by:** 45Creatives
- **Domains:** `prettyflyliving.com` (main); `prettyflyliving.co.ke` 301-redirects to it
- **Audience:** guests looking for monthly stays in Nairobi, and property owners

Three user groups:

| Who | Can |
|---|---|
| Guests | Search by area, dates and guests; browse and filter stays; view a property's photos, details, amenities and availability calendar; send a booking request; read Why Us, reviews, Nairobi guides and FAQs; contact via WhatsApp, email, phone or the contact form |
| Property owners | Read the Property Management page and send an owner enquiry |
| Sophiah (admin) | Log in to a private dashboard; manage properties, photos, details and pricing; block and unblock dates; view and respond to booking requests, contact messages and owner enquiries; edit FAQs, reviews and Nairobi guides; get an email for every booking request and enquiry |

There is **no online payment** in this phase. Sophiah confirms bookings by WhatsApp or email, then blocks the dates herself. A booking request is never a confirmed reservation, and the UI says so.

### Out of scope (do not build unless asked)

- Calendar sync with Airbnb, Booking.com or a channel manager (keep the data model ready for it, see §6)
- Online payments, including M-Pesa
- Guest accounts or guest login (the "save" heart on cards is browser-only, see §5)
- An in-app email client (admin replies through prefilled `mailto:` / `wa.me` links)
- A site-settings table (contact constants live in `app/lib/site.ts`)
- Content writing, extra SEO work, analytics, or features not listed here

Do not overbuild. Keep it small enough that any qualified developer can maintain it after handover.

---

## 2. Tech stack

Everything runs on **Cloudflare's free tier in Sophiah's own account**.

| Layer | Technology |
|---|---|
| Framework | React Router v7, **framework mode**, TypeScript, SSR on |
| Public site styling | The client-approved concept stylesheet, ported as plain CSS (§5) |
| Admin styling | Tailwind CSS v4 + shadcn/ui |
| Hosting / backend | Cloudflare Workers (`@cloudflare/vite-plugin`, `wrangler`) |
| Database | Cloudflare D1 (SQLite) with Drizzle ORM |
| Image storage | Cloudflare R2 |
| Spam protection | Cloudflare Turnstile + honeypot field |
| Validation | Zod |
| Email alerts | Resend (sending domain `send.prettyflyliving.com`) to Sophiah's Truehost mailbox `contact@prettyflyliving.com` |
| Admin auth | Peppered PBKDF2 password hash (WebCrypto) + secure session cookie |
| Tests | Vitest for pure logic |

Do **not** add: a separate backend framework, Node-only server packages (`@react-router/node`, `@react-router/serve`, Express), Docker, another database or ORM, an auth SaaS, a CSS-in-JS library, or paid Cloudflare products.

---

## 3. Read the docs first

React Router v7 changes often. Before writing routing, loader, action, middleware or config code, read the installed docs for the installed version:

```
node_modules/react-router/docs/
```

Use these project skills in `.agents/skills/`:

| Task | Skill |
|---|---|
| Routes, loaders, actions, forms, middleware, SSR | `react-router` (identify the mode → read `references/framework-mode.md`) |
| Workers, D1, R2, bindings, deploy | `cloudflare`, `wrangler`, `workers-best-practices` |
| Admin UI components | `shadcn` |
| Spam protection on forms | `turnstile-spin` |
| Email alerts | `resend`, `email-best-practices` (and `react-email` only if templates get complex) |
| Performance pass | `web-perf` |

Do not invent APIs from memory when a doc or skill covers them.

---

## 4. Architecture

```
Browser ──► Cloudflare Worker (React Router SSR: loaders/actions)
                 ├─ D1 (Drizzle)      properties, calendars, requests, content, admin
                 ├─ R2                photos, served via /media/*
                 ├─ Turnstile         siteverify on every public form + admin login
                 └─ Resend (fetch)    email to Sophiah via ctx.waitUntil
```

### Folder layout

```
design/concept/index.html      CLIENT-APPROVED DESIGN (read-only reference, see §5)
design/logo-original.jpg       logo as supplied by the client
workers/app.ts                 Worker entry: createRequestHandler, passes env/ctx as context
wrangler.jsonc                 D1 (DB) + R2 (MEDIA) bindings, vars, custom domain
drizzle/                       generated SQL migrations
app/styles/site.css            public site stylesheet = the concept CSS, ported (linked only by routes/_site.tsx)
app/styles/admin.css           Tailwind + shadcn theme (linked only by routes/admin/_layout.tsx)
app/.server/db/schema.ts       Drizzle schema (single source of truth for tables)
app/.server/db/client.ts       drizzle(env.DB)
app/.server/queries/*.ts       one file per domain: properties, availability, bookings, content, inbox
app/.server/auth.ts            password hashing, session create/verify/destroy, login throttle
app/.server/turnstile.ts       verifyTurnstile(token, ip, env)
app/.server/email.ts           sendNotification() + small HTML templates
app/.server/media.ts           R2 put/delete/key helpers
app/.server/markdown.ts        guide body → safe HTML (external links open in a new tab)
app/lib/validation.ts          Zod schemas for every form
app/lib/dates.ts               range overlap, expand-to-days, nights helpers (pure, unit-tested)
app/lib/site.ts                WhatsApp number, email, phone, nav items, price brackets, prefilled messages
app/components/site/           public components mirroring the concept: SiteHeader, SiteFooter, PropertyCard,
                               SearchPanel, LiveFilterForm, Gallery (+ photo viewer),
                               AvailabilityCalendar, BookingCard, MobileBookBar, GuideTile, GuideArticleCard,
                               ServiceGrid, QuoteCard, CtaBand, PageHero, WhatsAppButton, Toast, SavedStays
app/components/ui/             shadcn components (admin only; generated, edit sparingly)
app/components/admin/          admin-only components
app/routes/                    route modules (see §7)
public/brand/                  logo exports (header, footer/reversed, favicon, OG image)
```

### Layer rules

- Anything that touches D1, R2, secrets, Turnstile or Resend lives in `app/.server/` and is called only from loaders and actions. Never import `.server` code into a component.
- Route modules stay thin: parse the request, call `.server` functions, return data or a redirect.
- Components only render data handed to them by loaders. No data fetching inside components.
- Middleware is enabled (`future.v8_middleware`), so `context` is a `RouterContextProvider`. Reach bindings with `const { env, ctx } = context.get(cloudflareContext)` (from `~/context`, set in `workers/app.ts`), never through globals.
- Public components never import from `app/components/ui/` (shadcn), and admin components never use the concept classes.

---

## 5. Design: the concept is the spec

`design/concept/index.html` is the **client-approved design**. The client wants the public site to match it **exactly**: layout, copy, spacing, type, colours, radii, hover and transition details, and every responsive breakpoint (1100, 980, 720, 520 and 390px). Open it in a browser next to your work and compare at each breakpoint. When the concept and the brief disagree, **the concept wins on look and layout**. Features the brief requires that the concept lacks are added using the concept's own existing patterns (§5.4). Never invent a new visual style.

The concept is a hash-routed, hardcoded-data prototype. Rebuild its markup as React components with real routes and loader data. Do not copy its `<script>`.

### 5.1 Styling strategy

- Port the concept's entire `<style>` block into `app/styles/site.css` **verbatim and in the same order**, including the "Visual polish pass" and "Responsive polish pass" overrides. Later rules intentionally override earlier ones, so do not merge or reorder them.
- Link `site.css` only from `routes/_site.tsx` via its `links` export (`import siteCss from "~/styles/site.css?url"`). Link `admin.css` only from the admin layout. The root route loads fonts only and has **no global stylesheet**. This keeps Tailwind's preflight off the public site (it would remove the concept's paragraph spacing) and keeps the concept's global `img`/`body` rules out of the admin.
- `admin.css` restricts Tailwind's scan to admin code: `@import "tailwindcss" source(none);` plus `@source` for `app/routes/admin`, `app/components/admin` and `app/components/ui`.
- Use the concept's class names (`btn`, `btn-light`, `section`, `section-head`, `property-card`, `booking-card`, `cta-band` …) in JSX via `className`. No Tailwind utilities on public pages. When something new is needed, add a small rule at the end of `site.css` under a `/* Production additions */` comment, built from the existing tokens.
- Inline `style=` attributes in the concept (for example `style="padding-top:20px"` on sections) become React `style` props with the same values.
- Fonts are exactly the concept's: **DM Serif Display** (headings, `.serif`, brand) and **Poppins 300/400/500/600/700** (everything else), **self-hosted** (latin + latin-ext woff2 in `app/styles/fonts/`, `@font-face` rules in `app/styles/fonts.css`). `root.tsx` links `fonts.css` and preloads Poppins 400 and DM Serif Display latin. No Google Fonts requests: they blocked the first paint (Phase 4 decision).

### 5.2 Tokens (from the concept; do not change)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#242820` | text, primary buttons, footer background |
| `--muted` | `#65685e` | body copy, labels (the concept's `#73766c`, darkened for WCAG AA contrast; override in `site.css` Production additions) |
| `--paper` | `#f7f5ef` | page background |
| `--white` | `#fffefa` | cards, panels |
| `--sage` | `#536653` | accent, eyebrows, hover, CTA band |
| `--sage2` | `#e5e9df` | soft accent surfaces |
| `--sand` | `#e9dfd0` | image placeholders |
| `--line` | `#e5e1d8` | borders, dividers |
| Section tints | `#eeece3`, `#eeece5` | page heroes, quote section |
| WhatsApp | `#238b62` | floating button |

The base font size is 90% on `:root`/`html`, buttons are 4px-radius rectangles, cards have 8px radii, and the primary content width on desktops is the concept's `min(1160px, 100% − 64px)` (`calc(100% − 48px)` on tablets and phones, §5.5). All of this already comes from `site.css`.

### 5.3 Logo

- The client's logo (`design/logo-original.jpg`: house outline in terracotta, botanical sprig, "Pretty Fly" script and "Living" in forest green, tagline "Beautiful. Comfortable. Secure") **replaces the concept's text wordmark** in the header and footer brand slots (`.brand`).
- Use a cropped, **transparent** export in `public/brand/`. Prefer SVG; use a 2× PNG until an SVG exists. Never place the JPG with its cream background on the site.
- Header: drop the tagline line and size the logo to fit the header height (about 52px tall on desktop, 44px at ≤720px) without changing the header height. Check that the "Pretty Fly" script stays legible. If it doesn't, ask for a horizontal lockup instead of shrinking it further.
- Footer: the footer is dark (`#242820`), so use a **light/reversed** version of the logo. Keep the concept's footer text ("Thoughtfully selected spaces…") beside it.
- Logo `alt` is "Pretty Fly Living". Generate the favicon, `apple-touch-icon` and the default OG image from the logo.
- Do not adopt the logo's terracotta as a UI colour. The site palette stays the concept's (§5.2).

### 5.4 Concept ↔ brief reconciliation

| Area | Decision |
|---|---|
| Home vs Our Stays | Follow the concept: `/` is **Home** (hero, search panel, intro strip, 3 featured stays, "More than a place to stay", review, 4 guides, owner CTA band), and `/stays` is **Our stays** with the filter bar and full grid. |
| Home search panel | Concept fields: Where in Nairobi? / Check in / Check out / Guests. Submits a GET to `/stays?area=&in=&out=&guests=`. The stays loader hides properties that are blocked on those dates or sleep fewer guests. |
| Stays filter bar | Concept filters (text, area, bedrooms, max monthly price, sort) plus **check-in, check-out and guests** (client decision; labelled date fields styled like the home search panel, and the home search fills them) as GET query params filtered on the server, so links are shareable and work without JS. Updates as you type/select, like the concept (debounced submit). Area options come from the DB. Price brackets live in `app/lib/site.ts` (the concept's KES 1,500/2,500/3,500 are placeholders). |
| Brief's "Need help choosing an apartment?" banner | Add a concept `cta-band` at the bottom of `/stays` with "Need help choosing an apartment?", plus **WhatsApp** and **email** buttons, and keep the concept's "Need a recommendation?" hero button. |
| Property card | Exactly the concept card: tag pill, save heart, area · Nairobi, name, rating, meta (beds · bath · guests · type), price `/ month`, "View stay ↗". The tag and rating come from the DB and are **hidden when empty**. Never show an invented rating. |
| Save heart | Browser-only favourites in `localStorage` (wrapped in try/catch) with the concept's toast. No account, nothing stored on the server. |
| Property page | Concept layout: breadcrumb, 5-photo gallery (opens the image modal), location line, meta, description, "The details that make it feel like home" amenities, "Good to know" (per-property text with the concept copy as default), Availability, "Frequently asked about this stay" (concept's 3 accordions), "Explore similar stays" (2 cards, same area first), sticky booking card, mobile sticky book bar. |
| Availability calendar | Rendered with the concept's `.calendar` grid styles, showing real blocked dates (`.blocked`) and selection (`.selected`). Add previous/next month buttons using concept styles, since monthly stays span months. Clicking a day fills the check-in date, as in the concept. Remove the "demo calendar" disclaimer. |
| Booking card | Concept fields: check-in, check-out, guests (1…sleeps), name, **"Email or phone"** (one field). "Request to book ↗" saves to D1 and emails Sophiah, replacing the concept's WhatsApp handoff. Success state uses the concept's `form-status` with "Your request has been sent… not a confirmed reservation" plus an optional "Send on WhatsApp too ↗" button. "Ask us on WhatsApp" stays as in the concept. |
| Why Us | Concept page (hero, story split, 6 standards cards, quote, CTA band), with the client's copy (§5.5): "Our story" in the split and "Our standards" in the cards. The brief also requires **extra services (cards with photos)** and **reviews**, so add a "More for your stay" section using `article-card` (photo, optional eyebrow, title, description, details line, WhatsApp enquiry button) and show published reviews as `quote-card`s. Both go between the standards and the CTA band. |
| Things to Do | Concept **Nairobi guides**: `/things-to-do` index (search + category filter + `article-card` grid + CTA band) and `/things-to-do/:slug` guide article pages (page hero, cover, body, CTA band, back link). Categories: Food, Entertainment, Nightlife, Activities, Shopping, Attractions. Guide bodies are admin-edited Markdown, and external venue links open in a new tab. |
| Property Management | Concept page as-is (hero, split, 6 service cards = the brief's What We Do list, 4 steps, owner form). The owner form is the client's **Property Management Enquiry Form** (§5.5), not the concept's short form. |
| FAQs | Concept layout: tab switch "For guests" / "For property owners" (`?tab=owners`, so it works without JS), accordions from the DB, and the "Need a human answer?" side box. The brief's "Still have a question?" banner = the concept's hero button + side box, and the side box gets **WhatsApp** and **email** links. Each tab has the client's heading and intro, and ends with its own CTA band (guests: "Find your next stay"; owners: "Let's talk about your property" → the owner form). **Never** write "we reply within minutes" in our own copy; the client's guest FAQ promising a reply "within one hour" is theirs and stays as written. |
| Contact | Concept page plus a **Phone** contact-method row (brief), in the same style as WhatsApp/Email. Form fields follow the concept: enquiry type, name, email, phone, message. Remove the concept's "Demo form" note. |
| Privacy Policy | Not in the concept: build `/privacy-policy` with `page-hero` + `article-layout`. The footer's "Privacy & terms" link points here. |
| Floating WhatsApp button | The concept's square green button and position, but with a real WhatsApp SVG icon instead of the placeholder `◔` glyph. It appears on every public page. |
| Icons | Keep the concept's Unicode glyphs (⌂ ✳ ♡ ◷ ✓ ⌘ ↗ ★ …) as-is. Don't swap in an icon library on public pages. |
| Copy | The concept's copy is the default site copy. Contact details come from `app/lib/site.ts` (replace `254700000000` and `hello@prettyflyliving.com`), and prices, photos, ratings and reviews come from the DB. Remove every prototype-only disclaimer. |
| Images | The concept's Unsplash URLs may be used **only in local seed data**. Production images come from R2. |

### 5.5 Client revisions (approved changes to the concept)

These were requested after the concept was approved and **override it**. Their CSS lives in the "Client revisions" block at the end of `site.css`.

| Revision | Implementation |
|---|---|
| Mobile menu | At ≤720px a solid black (`#000`) three-bar button sits at the top right of the header. It opens a drawer that slides in from the right and covers **half the screen** (`50vw`, full height). The drawer has a "Menu" label, a black **X** close button, the nav links and a "Find your stay ↗" button. A dimmed backdrop covers the other half. The X, a tap on the backdrop, Esc or choosing a link closes it. Page scroll is locked while it is open, focus moves to the X, and focus returns to the menu button afterwards. The header's `backdrop-filter` is off on mobile so the fixed drawer is not trapped inside the header. |
| More height | Taller hero (`min-height` 640px desktop / 560px tablet / 580px mobile) and more vertical section padding (128px desktop / 96px tablet / 76px mobile), with taller page heroes, split images and guide tiles. |
| Smaller property cards | Four cards per row above 1100px (three at 981–1100px), 172px photos (180px on mobile), and tighter card padding and type. Home shows four featured stays. Scoped to `.property-card` only. |
| Guide galleries | Every Things to Do guide has several photos (`guide_photos`, §6), not one. Guide pages replace the single cover with the concept's `.gallery` grid. The photo viewer steps through every photo (arrows, ← → keys, Esc) and shows "+N photos" when there are more than five. The cover photo always comes first. |
| Things to Do index | Matches the client's updated reference: a "Browse by" row of topic shortcut chips under the filter bar (defined in `guideTopics` in `app/lib/site.ts`, each setting `?q=` or `?category=`), and **two cards per row**. Each card has a 3-photo collage (cover large on the left, two stacked on the right, sand gaps, no frames), "Category · Nairobi guide" with "N views" (photo count) on the right, a serif title, the excerpt, a divider, the guide's `highlights` as sage chips, and "Explore the local edit ↗". One column at ≤720px. |
| Save heart | The empty ♡ on property cards is black (`#000`) for visibility on photos; the saved ♥ keeps the concept red. |
| Side margins | Desktops (above 980px) use the concept's centred column, `min(1160px, 100% − 64px)` (`min(100% − 48px, 960px)` at 981–1100px), like the client's Airbnb reference (2026-10-29). Tablets and phones have 24px side margins (22px at ≤520px, 20px at ≤390px). Header, sections and footer all follow it. History: a narrower `min(1080px, 100% − 160px)`, then on 2026-10-28 briefly `min(1440px, 100% − 96px)` and full width with a 24px edge; on 2026-10-29 the client had the full-width layout, with its wide-screen and proportional-photo adaptations, undone. Don't spread the site across wide screens again. |
| Admin width | The admin content stops at 1440px, and its Photos tab adds columns with the space it has (2 / 3 / 4). |
| Hero photo | The client's living-room photo (`public/images/hero-living-*.webp`, 640–1920px; the original is 1920px wide, so nothing larger is exported). Above 980px the hero is **full bleed**, like the client's Airbnb reference (2026-10-29): the photo fills the screen edge to edge, straight under the header, with square corners, `clamp(640px, 45vw, 100svh − 120px)` tall so it never becomes a thin strip. The copy (concept style: dark text, "Browse our stays", tagline) and the search panel stay inside the content column, and the paper-coloured gradient covers only the headline's band (fading out 660px from the column's left edge); the rest of the photo is clear. At ≤980px the photo sits above the copy inside the column at its own shape (16:10 tablet, 4:3 phone) with **no gradient**, so it is never zoomed into a tall box. |
| Date fields | Native date inputs show black (`#000`) dates and a solid black calendar icon for visibility, on every public date field. |
| Tagline | "Beautiful stays, thoughtfully managed." replaces the concept's "Feel at home, wherever you're from." (home hero note, and the close of the Why Us story). |
| Client copy (2026-10) | Why Us "Our story" and "Our standards", the three extra services (Airport Transfers; Nairobi, With a Local; Extra Cleaning and Laundry), the 10 guest and 10 owner FAQs (seed data) and the FAQ tab intros and CTA bands are the client's own wording. Keep it as written; only straight apostrophes became ’. |
| Owner enquiry form | Four numbered steps in the client's wording: (1) about your property (location*, units*, property type* for one unit or "type + number of units" rows with "+ Add another property type" for several, same location, furnishing, listed online, listing links); (2) support needed (12 checkboxes); (3) tell us more; (4) contact details (name*, email*, phone/WhatsApp*, preferred contact method). Repeated answers post under numbered names (`unitType1`, `support3` …) and are gathered in `ownerEnquirySchema`. Without JS the form shows one row. |
| Gentle motion | Added 2026-10-29, awaiting the client's approval (site.css client revision 13). Pages cross-fade (0.22s) through React Router's `viewTransition` on every public `Link`/`NavLink`, the stay card's photo click and the home search, but **not** the live stays filter. The photo viewer and each photo fade in, accordions open smoothly where `interpolate-size` is supported, the save heart pops only when tapped, and `.form-status` messages fade in. Under `prefers-reduced-motion: reduce` all of it is off, along with the concept's hover lifts, photo zooms, menu slide and smooth scrolling. No animation library. |

---

## 6. Data model (D1 via Drizzle)

| Table | Key columns | Notes |
|---|---|---|
| `properties` | id, slug (unique), name, area, address, map_url, property_type (`Apartment`, `Loft`, …), tag (nullable, card pill), rating (nullable, admin-entered, e.g. `4.9`), description, good_to_know (nullable), bedrooms, bathrooms, sleeps, monthly_price_kes, min_nights (default 30), amenities (JSON text[]), is_featured, is_published, sort_order, created_at, updated_at | `area` powers search; featured → Home grid |
| `property_photos` | id, property_id, r2_key, alt, width, height (nullable, read from the upload), sort_order | lowest `sort_order` is the card cover; first 5 fill the gallery |
| `availability_blocks` | id, property_id, start_date, end_date (**exclusive**), source (`admin` \| `booking` \| `ical`), external_uid (nullable), note | date **ranges**, not per-day rows |
| `booking_requests` | id, property_id, check_in, check_out, guests, name, contact (email or phone, as entered), status (`new` \| `contacted` \| `confirmed` \| `declined`), admin_notes, created_at | admin reply link: `mailto:` if `contact` contains `@`, else `wa.me` |
| `contact_messages` | id, enquiry_type (`Booking a stay` \| `Property management` \| `General question`), name, email, phone, message, status (`new` \| `handled`), created_at | |
| `owner_enquiries` | id, name, email, phone, property_area, property_type, units, unit_breakdown (JSON [{type, count}], nullable), same_location, furnishing, listed_online, listing_links, support_needed (JSON text[]), preferred_contact, message, status, created_at | `property_type` holds the single type or a summary like "2 × Studio, 1 × 1-bedroom apartment"; the newer columns are null on older enquiries |
| `faqs` | id, audience (`guest` \| `owner`), question, answer, sort_order, is_published | |
| `reviews` | id, guest_name, context (e.g. "Recent Nairobi stay"), body, rating, property_id (nullable), is_featured, sort_order, is_published | featured → Home quote card |
| `guides` | id, slug (unique), title, category, excerpt, cover_r2_key, cover_width, cover_height, highlights (JSON text[], card chips), body_md, is_featured, sort_order, is_published, created_at, updated_at | Things to Do; featured → Home guide grid |
| `guide_photos` | id, guide_id, r2_key, alt, width, height, sort_order | gallery photos per guide (§5.5); shown after the cover |
| `extra_services` | id, eyebrow (nullable), title, description, details (nullable), cta_label (nullable), image_r2_key, image_width, image_height, sort_order, is_published | Why Us extra services cards; the button opens WhatsApp about that service |
| `admin_users` | id, email, password_hash, created_at | one row, created with a CLI script |
| `sessions` | id (SHA-256 of the token), user_id, expires_at, signed_in_at (nullable) | `signed_in_at` gates Settings changes (§9) |
| `login_attempts` | ip, attempted_at | throttle: 5 failures per 15 minutes |
| `content_version` | id (always 1), version | moved on by every successful dashboard POST (admin layout middleware); the public page cache (`workers/page-cache.ts`) keys pages by it and Nairobi's date, so edits show at once |

Rules:

- **Dates** are `YYYY-MM-DD` strings in Nairobi local time. Ranges are half-open `[start, end)`, so a check-out day can be the next guest's check-in day. Put all date logic in `app/lib/dates.ts` and unit-test it.
- **Availability** is the set of `availability_blocks`. Never store availability per day. A future calendar sync only inserts rows with `source = 'ical'` and an `external_uid`, so do not break that shape.
- A booking request **does not block dates by itself**. Dates are blocked only when the admin confirms the booking ("Confirm & block dates" creates a `source = 'booking'` block) or blocks them manually.
- Prices are whole KES integers.
- Schema changes go through `app/.server/db/schema.ts` → `npm run db:generate` → a new migration in `drizzle/`. Never edit an applied migration.

---

## 7. Routes

Public pages share `routes/_site.tsx` (links `site.css`; renders SiteHeader, SiteFooter, the floating WhatsApp button and the toast). Navigation follows the concept: Home · Our stays · Why us · Things to do · Property management · FAQs · Contact, plus the "Find your stay ↗" button.

| Path | Concept screen | Notes |
|---|---|---|
| `/` | `home()` | featured stays, featured review, featured guides from the DB |
| `/stays` | `stays()` | filters via query params; date/guest availability filter |
| `/stays/:slug` | `detail()` | booking action |
| `/why-us` | `why()` | + extra services + reviews (§5.4) |
| `/things-to-do` | `experiences()` | `?q=&category=` |
| `/things-to-do/:slug` | `guideDetail()` | |
| `/management` | `management()` | owner enquiry action; `#owner-enquiry` anchor kept |
| `/faqs` | `faqs()` | `?tab=owners` |
| `/contact` | `contact()` | contact action |
| `/privacy-policy` | — | `page-hero` + `article-layout` |

Resource routes: `/sitemap.xml` (dynamic from D1: stays and guides), `/robots.txt`, `/media/*` (streams from R2 with `Cache-Control: public, max-age=31536000, immutable`).

Admin pages share `routes/admin/_layout.tsx` (links `admin.css`), protected by middleware (or a loader guard, per the installed docs) that redirects to `/admin/login` without a valid session:

`/admin/login`, `/admin/logout` (POST), `/admin` (overview: new-item counts, upcoming check-ins), `/admin/properties`, `/admin/properties/new`, `/admin/properties/:id` (tabs: Details · Photos · Calendar), `/admin/bookings` (+ `/:id`), `/admin/messages`, `/admin/enquiries`, `/admin/faqs`, `/admin/reviews`, `/admin/guides` (with a Photos tab for the guide gallery, like properties), `/admin/extra-services`, `/admin/settings` (change the login email or password; allowed only within 10 minutes of signing in, and a password change signs out other sessions).

Admin must stay out of search engines: `noindex` meta on every admin page and `Disallow: /admin` in `robots.txt`.

---

## 8. Conventions

### Forms (Request to Book, Contact, Owner Enquiry)

Every public form must, in this order on the server:

1. Reject a filled honeypot field silently.
2. Verify the Turnstile token with siteverify.
3. Validate with the Zod schema from `app/lib/validation.ts`.
4. Run business checks (booking: valid range, `check_out > check_in`, at least `min_nights`, no overlap with existing blocks, guests ≤ `sleeps`).
5. Save to D1.
6. Send the email to Sophiah inside `ctx.waitUntil`. An email failure is logged and never loses the saved record or fails the response.

Use React Router `<Form>` / `useFetcher` so forms work without JavaScript. On error, return field errors and keep the user's values. Show results in the concept's `.form-status` element, and place the Turnstile widget above the submit button so it doesn't disturb the concept layout.

### Public UI

- Match the concept (§5) at every breakpoint. Mobile-first checks happen at 360, 390, 520, 720, 980 and 1100px+.
- Public date fields are native `<input type="date">`, as in the concept. No date-picker library on public pages.
- Modals (photo viewer), the mobile nav toggle, toasts, FAQ tabs and the save heart reproduce the concept's behaviour with small client components. Accordions use native `<details>`/`<summary>` like the concept.
- **External links** (WhatsApp, email, guide venue links) open in a new tab with `target="_blank" rel="noopener noreferrer"`.
- Prices display as `KES 120,000` with `/ month` in a `<small>`, using the concept's `money()` format (`en-KE` grouping).
- Prefilled WhatsApp messages reuse the concept's wording (in `app/lib/site.ts`).

### Admin UI

- Tailwind + shadcn only, clean and functional. It doesn't need to match the concept, but use the concept's fonts and `--sage` as the primary colour so it feels on-brand.
- The admin calendar uses the shadcn `Calendar` (react-day-picker) in range mode for block/unblock.
- Calendar icons are always solid black (`#000`), everywhere: native date-input pickers and every `lucide-calendar*` icon, including inside coloured buttons. The rule lives in `admin.css` (public date fields: §5.5).
- Guide bodies are edited as Markdown in a textarea with a preview.

### Images

- Admin uploads are resized in the browser to a 2000px maximum, as WebP, before upload.
- The server accepts only JPEG, PNG and WebP up to 10 MB, and stores them in R2 under a content-hashed key.
- Always render `alt`, `width`, `height` and `loading="lazy"` (except the hero and the first gallery image).
- Do not use paid Cloudflare Images transformations.

### SEO

- Each route exports `meta` with a title, description, canonical URL and OG image. The concept's home `<title>` and description are the defaults.
- JSON-LD: `LodgingBusiness` sitewide, `Accommodation` + `Offer` on stay pages, `FAQPage` on FAQs, `Article` on guide pages.
- One `h1` per page, as in the concept. Guide content must be server-rendered.

### Code

- TypeScript strict. No `any`. Small functions with explicit return types on `.server` exports.
- Name files and components after the domain (`PropertyCard`, `getPublishedProperties`, `createBookingRequest`).
- Match the surrounding code's style, and avoid unrelated refactors.

---

## 9. Security

- Secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `PASSWORD_PEPPER`) are Worker secrets: set with `wrangler secret put` in production, and kept in `.dev.vars` locally (git-ignored; `.dev.vars.example` is committed). Never commit secrets or expose them to client code. Only the Turnstile **site key** is public.
- Admin passwords use PBKDF2-SHA256 via WebCrypto over an HMAC-SHA256 of the password keyed with the `PASSWORD_PEPPER` secret (per-user random salt, at least 12 characters). The iteration count (4,000, in `app/.server/password.ts`) is sized so one hash fits the free plan's CPU limit; the pepper, which never lives in D1, is what protects a stolen database. Every request does at most one hash: changing the login email or password needs a sign-in within the last 10 minutes instead of the current password. Never store or log plain passwords.
- Sessions: a 32-byte random token in an `HttpOnly; Secure; SameSite=Lax; Path=/` cookie. Only its SHA-256 hash is stored in D1, with a 30-day sliding expiry. Logout deletes the row.
- Every admin mutation is a POST action that re-checks the session and checks the `Origin` header.
- The login form uses Turnstile and the `login_attempts` throttle.
- Guide Markdown is rendered on the server with raw HTML disabled. Escape any user-supplied text placed in email HTML.
- Every account (Cloudflare, Resend, Truehost, GitHub, Hosting.com) belongs to Sophiah. Do not hardcode personal or 45Creatives credentials anywhere.

### Free-tier limits to respect

- Workers free plan allows about 10 ms CPU per request. Keep loaders lean, avoid heavy libraries in the server bundle, and measure the login (PBKDF2) cost on the live Worker before raising the iteration count.
- Resend free tier: 100 emails/day, 3,000/month. Send one notification per submission, with no guest auto-replies unless asked.
- D1: batch related writes, index `availability_blocks(property_id, start_date)`, `properties(slug)` and `guides(slug)`.

---

## 10. Commands

Run from the project root.

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server with local D1/R2 via the Cloudflare Vite plugin |
| `npm run build` | Production build |
| `npm run deploy` | `wrangler deploy` |
| `npm run typecheck` | Wrangler types + React Router typegen + `tsc` |
| `npm run test` | Vitest |
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:migrate:local` / `db:migrate:remote` | Apply migrations to local / production D1 |
| `npm run db:seed` | Load placeholder content locally (the concept's sample stays, guides, FAQs and copy) |
| `npm run admin:create` | Create or reset the admin user |

Some of these scripts are added during Phase 0 (§11). If a script is missing, add it as part of the current task; do not work around it.

**Checks:** after every change, run `npm run typecheck` and `npm run test`. Also run `npm run build` when routes, config, the Worker entry or `.server` modules change. For public UI changes, compare the page side by side with `design/concept/index.html` at the breakpoints in §8. Report the real output, and never claim a check passed without running it.

For local Turnstile, use Cloudflare's test keys (site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`).

---

## 11. Build phases

Work through these in order. Don't start a later phase's features early.

0. **Foundation:** convert the Node template to Cloudflare Workers, then add Drizzle + the schema + the first migration + a seed script built from the concept's sample data. Port the concept CSS into `app/styles/site.css`, set up `admin.css` (Tailwind + shadcn init), wire the route-scoped stylesheets and fonts, export the logo assets, and add `.dev.vars.example` and README setup steps.
1. **Public site on seed data:** header/footer/WhatsApp button, then Home, Our stays, stay detail, Why Us, Things to Do + guide pages, Property Management, FAQs, Contact and Privacy Policy. Each one must match the concept.
2. **Availability, booking and forms:** date helpers + tests, the real calendar, search and filters, the three forms with Turnstile and Resend.
3. **Admin dashboard:** auth, overview, properties + photos + calendar, inboxes, CRUD for FAQs, reviews, guides (+ guide photos) and extra services.
4. **Polish:** SEO, performance (Lighthouse mobile ≥ 90), accessibility, error pages, final side-by-side concept comparison.
5. **Deploy and handover:** Cloudflare resources and secrets, domains and the `.co.ke` redirect, DNS in Cloudflare (nameservers moved there; Truehost mail and Resend records), admin user, training, handover doc, GitHub transfer.

---

## 12. Workflow

1. Read this file, the relevant part of `design/concept/index.html`, and the skills or docs relevant to the task (§3).
2. Inspect the existing code before adding new code, and reuse helpers in `app/.server/`, `app/lib/` and `app/components/site/`.
3. For anything larger than a small fix, state a short plan (files to change, approach) and wait for approval before coding.
4. Implement only what was asked.
5. Run the checks (§10).
6. Finish with exact steps to test the change locally: URLs to open, forms to submit, and what should appear in `/admin`.
