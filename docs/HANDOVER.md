# Pretty Fly Living: Website Handover

As of 27 October 2026 · 45Creatives

prettyflyliving.com is live on Cloudflare in Sophiah's own accounts, costs nothing to run today, and is managed from the admin dashboard at prettyflyliving.com/admin.

## At a glance

The site went live on 27 October 2026. Guests can browse stays, check availability and send booking requests; Sophiah answers them from the dashboard.

| Area | State on 27 Oct 2026 |
| --- | --- |
| Website | Live at https://prettyflyliving.com. `www` and plain `http://` redirect there. |
| Stays | 1 published: Little Urban Nook (Kilimani), 31 photos |
| Reviews | 11 real Airbnb reviews: 9 published, the 4★ and 3★ ones waiting for Sophiah's decision |
| FAQs | 10 for guests, 10 for owners |
| Extra services | 3: Airport Transfers; Nairobi, With a Local; Extra Cleaning and Laundry |
| Nairobi guides | 6 draft guides (one per category, 5 photos each) loaded on 27 Oct 2026, waiting for Sophiah to review and publish under Nairobi guides. Photo credits are at the end of each guide. |
| Email alerts | Not arriving yet: Truehost has not activated contact@prettyflyliving.com. Every request is still saved in the dashboard. |
| prettyflyliving.co.ke | Not redirecting yet: its nameservers at the registrar are broken. |

There are no online payments. A booking request is never a confirmed reservation: Sophiah confirms by WhatsApp or email, then blocks the dates.

## What you own

Every account below belongs to Sophiah; 45Creatives keeps no account the site depends on. All of them are on free plans today.

| Account | What it does for the site | Cost today |
| --- | --- | --- |
| Cloudflare | Runs the website (Workers), stores the database (D1) and photos (R2), serves the domain's DNS, protects the forms (Turnstile) | Free. A card is on file because R2 requires one. |
| Resend | Sends the alert email for every booking request, contact message and owner enquiry, from notifications@send.prettyflyliving.com | Free: up to 100 emails a day, 3,000 a month |
| Truehost | The contact@prettyflyliving.com mailbox, where alerts arrive and guests write | Sophiah's email plan |
| GitHub | The website's code: github.com/SophiaRima/PrettyFlyLiving | Free |
| KWE Holding (Hosting.com) | Registrar for prettyflyliving.co.ke | Yearly domain renewal |

Open question: which registrar holds prettyflyliving.com, and when does it renew? Its DNS is on Cloudflare, but the registration itself must be renewed where it was bought.

If the site ever outgrows the free plan, the first upgrade is Cloudflare Workers Paid at US$5 a month (see "When something goes wrong").

## Logins and secrets

Keep all of these in one password manager that only Sophiah controls. Nothing here should ever be sent by email, WhatsApp or chat.

| Item | Used for | Where it lives |
| --- | --- | --- |
| Admin login: sophiahpriscilla.va@gmail.com + password | Signing in at prettyflyliving.com/admin | Sophiah's password manager |
| Password pepper (a long random string) | A secret mixed into the admin password. Needed only to reset a forgotten admin password. | Cloudflare (as the Worker secret `PASSWORD_PEPPER`) and the password manager. 45Creatives holds the only other copy and hands it over at handover. |
| Cloudflare, Resend, Truehost, GitHub and registrar logins | Running and paying for each service | Sophiah's password manager, each with two-factor sign-in turned on |

What to know about the admin login:

- Sophiah can change her login email or password herself under **Settings**, within 10 minutes of signing in. Changing the password signs out every other device.
- There is no "forgot password" link. A forgotten password is reset by a developer using the pepper, so losing the pepper means a developer must replace it (a five-minute job, not a disaster).
- Five wrong passwords from one connection lock sign-ins from it for 15 minutes.
- A sign-in lasts 30 days on a device; **Log out** ends it.

## Running the site day to day

Everything below happens in the dashboard at prettyflyliving.com/admin. The **Overview** page shows what is new and the upcoming check-ins.

### A booking request, start to finish

1. A guest sends a request from a stay's page. It appears under **Booking requests** as *New*, and an alert email goes to contact@prettyflyliving.com.
2. Open it and click **Reply by email** or **Reply on WhatsApp**: your own email app or WhatsApp opens with a message already written.
3. Set the status to *Contacted* and add private notes if useful.
4. Once the stay is agreed and paid as you arrange it, click **Confirm & block dates**. The request becomes *Confirmed* and those nights disappear from the stay's calendar for other guests.
5. If it doesn't go ahead, set it to *Declined*, or delete it: **Delete** on its row in the list, or **Delete request** at the bottom of its page. Deleting a confirmed request leaves its nights blocked; unblock them on the calendar if the stay is off.

### Keeping calendars in step with Airbnb

The site does not sync with Airbnb or Booking.com. When a stay is booked elsewhere, block those dates on the site the same day: **Properties → the stay → Calendar**, select the nights, then click Block these nights. Do the same on Airbnb when a booking comes through this site.

### Other inboxes

- **Messages**: the Contact page form. Reply from the message, then click **Mark handled**.
- **Owner enquiries**: the Property Management form, with the owner's answers to all four steps.

Each message and enquiry also has a **Delete** button, for spam or anything you no longer need. Deleting can't be undone.

On a phone or tablet, the dashboard's sections are under the **Menu** button at the top right.

### Editing content

| What | Where in the dashboard | Good to know |
| --- | --- | --- |
| Stays: details, price, photos, calendar | Properties | Prices are whole KES per month. A stay is never deleted: untick *Published* to hide it. The first photo is the card photo. |
| Featured stays on the Home page | Properties → tick *Featured* | Home shows up to four. |
| Reviews | Reviews | Never publish a review that wasn't really written. The featured one appears on Home. |
| FAQs | FAQs | Separate lists for guests and property owners. |
| Nairobi guides (Things to Do) | Nairobi guides | Written in Markdown with a preview; each guide has a Photos tab. Links to venues open in a new tab. |
| Extra services on Why Us | Extra services | Each card's button opens WhatsApp about that service. |

Photos can be JPEG, PNG or WebP up to 10 MB. The dashboard shrinks and converts them before uploading, so phone photos are fine.

## What only a developer can change

These live in the website's code, not the dashboard, so changing them means a small code update and a redeploy.

- **Contact details**: the WhatsApp number (+254 708 854 755), phone, email address and the pre-written WhatsApp messages.
- **Page wording** on Home, Why Us, Property Management, Contact and the Privacy Policy, and the FAQ page intros.
- **Page photos** that aren't stays, guides or services: the Home hero and the photos beside the text on Home, Why Us and Property Management.
- **The "Max monthly price" options** on Our Stays (now KES 60,000 to 250,000) and the "Browse by" shortcuts on Things to Do.
- **Where alert emails go** (now contact@prettyflyliving.com).
- **Design, layout and new features**, such as online payments or calendar sync with Airbnb.
- **Domain, DNS and email settings** in Cloudflare and Truehost.

## When something goes wrong

Most problems are fixed in a dashboard setting; anything marked *developer* needs one.

| What you see | What to do |
| --- | --- |
| No alert emails arrive | Check **Booking requests**, **Messages** and **Owner enquiries** in the dashboard: requests are always saved there. Then check the contact@ mailbox works by sending it a test from Gmail. If that bounces, it's a Truehost problem: contact Truehost support. |
| "Too many failed attempts" at sign-in | Wait 15 minutes, then sign in again. |
| Forgot the admin password | *Developer*: resets it with the pepper. |
| A form says the security check failed | In Cloudflare → **Turnstile**, check the site's widget lists prettyflyliving.com and www.prettyflyliving.com as hostnames. |
| The site shows a Cloudflare error 1102, or is slow at busy times | The free plan's processing limit was reached. Upgrade Cloudflare to **Workers Paid** (US$5 a month): Workers & Pages → Plans. Nothing else changes. |
| The browser says "Not secure" | Open https://prettyflyliving.com (with https). If it persists, check Cloudflare → SSL/TLS → Edge Certificates → **Always Use HTTPS** is on. |
| A guest sees dates as free that are booked | Block them under **Properties → the stay → Calendar**. The site only knows about bookings confirmed in the dashboard or blocked by hand. |
| A photo upload fails | Use a JPEG, PNG or WebP under 10 MB. |
| The whole site is down | Check https://www.cloudflarestatus.com, then *developer*: Cloudflare → Workers & Pages → prettyflyliving → Observability shows the errors. |

## Still open

These are the items left before the handover is complete.

- [ ] Truehost activates contact@prettyflyliving.com, then send a test booking request and check the alert arrives
- [ ] Fix the prettyflyliving.co.ke nameservers at KWE Holding, then a developer redirects it to prettyflyliving.com
- [ ] 45Creatives hands the password pepper to Sophiah's password manager
- [ ] Confirm the registrar and renewal date for prettyflyliving.com
- [ ] Confirm the GitHub repository is owned by Sophiah's account, with 45Creatives as a collaborator only
- [ ] Decide on the two unpublished reviews (4★ and 3★) under **Reviews**
- [ ] Review the six draft Nairobi guides and tick Published (the first four are already Featured for the Home page)
- [ ] Dashboard training session with Sophiah
- [ ] After a quiet month, tighten the email DMARC policy (developer) and consider turning on HSTS in Cloudflare

## Appendix: for the next developer

Start with `AGENTS.md` in the repository: it is the source of truth for the product, design rules, data model and conventions. `README.md` covers local setup. The client-approved design is `design/concept/index.html`.

**Stack**: React Router v7 (framework mode, SSR) on Cloudflare Workers; D1 with Drizzle; R2 for photos (served from `/media/*`); Turnstile on every public form and the admin login; Resend for alert emails; Tailwind + shadcn/ui in the admin only. The public site's CSS is the concept's stylesheet, ported verbatim.

### Production resources (Sophiah's Cloudflare account)

| Resource | Name | Notes |
| --- | --- | --- |
| Worker | `prettyflyliving` | Custom domains prettyflyliving.com and www (www, and http on the main domain, 301 to https://prettyflyliving.com in `workers/app.ts`) |
| D1 | `prettyflyliving-db` | Western Europe. Migrations 0000–0005 applied. |
| R2 | `prettyflyliving-media` | Content-hashed keys, plus an 800px copy (`<hash>-800.webp`) of each upload |
| Secrets | `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `PASSWORD_PEPPER` | `wrangler secret put` |
| Vars | `SITE_URL`, `NOTIFY_EMAIL`, `EMAIL_FROM`, `TURNSTILE_SITE_KEY` | In `wrangler.jsonc` |

### Changing and deploying

1. `npm run typecheck`, `npm run test` and `npm run build` must pass.
2. Schema change: edit `app/.server/db/schema.ts`, run `npm run db:generate`, then `npm run db:migrate:remote` before deploying. Never edit an applied migration.
3. `npm run deploy`.
4. Admin password reset: `PASSWORD_PEPPER=<value> npm run admin:create -- --remote`.

`scripts/seed-production.sql` loaded the launch content on 27 Oct 2026. Never run it again: production content is edited in the dashboard.

### DNS (Cloudflare zone prettyflyliving.com)

- Mail (Truehost): MX `workplaceproemail.com` (10) and `workplaceproemail.net` (20); SPF `v=spf1 include:_spf.cloudoon.com ~all`; DKIM selector `smarthost`; DMARC `v=DMARC1; p=none;`. Mail hostnames stay DNS-only, never proxied.
- Resend: verified sending domain `send.prettyflyliving.com` (DKIM, return-path and MX records on `send`).
- Website: the apex and www records belong to the Worker's custom domains; don't edit them by hand.

### Known issues and next steps

- **CPU**: live requests use 17–100 ms of CPU against the free plan's nominal 10 ms. No 1102 errors so far; if they appear, move to Workers Paid rather than trimming code.
- **Cloudflare bot script**: `/cdn-cgi/challenge-platform/scripts/jsd/main.js` is still injected into pages after Bot Fight Mode was turned off. It costs the home page some Lighthouse points; it is harmless otherwise.
- **Lighthouse (mobile, 27 Oct 2026)**: accessibility 100 and SEO 100 on every page, performance 70–89.
- **.co.ke redirect**: once its nameservers work, add the zone to Cloudflare, add `prettyflyliving.co.ke` (and www) as custom domains in `wrangler.jsonc`, and add the hosts to `redirectHosts` in `workers/app.ts`.
- **Email**: move DMARC to `p=quarantine` once a Gmail "Show original" test passes SPF, DKIM and DMARC.
- **Backups**: D1 Time Travel can restore the database to an earlier point in time; check its retention on the current plan before relying on it.
