# Pretty Fly Living

Booking website for Pretty Fly Living's furnished monthly-stay apartments in Nairobi ([prettyflyliving.com](https://prettyflyliving.com)).

React Router v7 (framework mode) on Cloudflare Workers, with D1 (Drizzle), R2, Turnstile and Resend. Project rules, architecture and the design spec are in [AGENTS.md](AGENTS.md). The client-approved design is [design/concept/index.html](design/concept/index.html).

## Requirements

- Node.js 22 or later
- npm

No Cloudflare account is needed for local development: D1 and R2 are simulated locally.

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars   # local secrets (Turnstile test keys, Resend placeholder)
npm run db:migrate:local         # create the local D1 tables
npm run db:seed                  # load the concept's sample stays, guides, FAQs and reviews, plus Little Urban Nook
npm run dev                      # http://localhost:5173
```

`npm run db:seed` can be re-run at any time. It resets the content tables, but not the inboxes or admin users. It also copies the photos in `scripts/seed-media/` into local R2; those are Little Urban Nook's real photos, which every seeded stay and extra service uses for now. Only the Nairobi guides still use Unsplash placeholders. The page photos in `public/images/` come from the same set.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with local D1/R2 |
| `npm run build` | Production build |
| `npm run preview` | Build, then serve the production build locally |
| `npm run deploy` | Build and deploy with Wrangler |
| `npm run typecheck` | Generate Wrangler + route types, then `tsc` |
| `npm run test` | Unit tests (Vitest) |
| `npm run db:generate` | Generate a migration after editing `app/.server/db/schema.ts` |
| `npm run db:migrate:local` | Apply migrations to the local database |
| `npm run db:migrate:remote` | Apply migrations to the production database |
| `npm run db:seed` | Load placeholder content into the local database |
| `npm run admin:create` | Create the admin user or reset their password (local database; add `-- --remote` for production) |

After changing `wrangler.jsonc`, run `npm run typecheck` to regenerate `worker-configuration.d.ts`.

## Admin dashboard

The dashboard is at `/admin`. Create a login for the local database first:

```bash
npm run admin:create             # prompts for email and password (at least 12 characters)
```

It needs Node 22.18 or later (it runs TypeScript directly), and the `PASSWORD_PEPPER` secret from `.dev.vars` (see `.dev.vars.example`). Running it again with the same email resets the password and signs that user out everywhere. In production, run `PASSWORD_PEPPER=<the production value> npm run admin:create -- --remote`.

From the dashboard you can:

- read and answer booking requests, contact messages and owner enquiries. Replies open your own email app or WhatsApp with a prefilled message.
- confirm a booking with **Confirm & block dates**. A booking request never blocks dates by itself.
- add and edit properties, their photos, and blocked dates (Calendar tab). Properties are never deleted; untick Published to hide one.
- edit Nairobi guides (Markdown, with a preview), guide photos, reviews, FAQs and extra services.
- change your login email or password under **Settings**. This works for 10 minutes after signing in (otherwise it asks you to sign in again), and changing the password signs you out on every other device.

Photos are resized to WebP in the browser, stored in R2 and served from `/media/…`. Five failed logins from one IP lock logins from that IP for 15 minutes.

## Project layout

```
design/              client-approved concept and original logo (reference only)
workers/app.ts       Cloudflare Worker entry
wrangler.jsonc       bindings (D1, R2), public vars, required secrets
drizzle/             SQL migrations
scripts/seed.sql     local placeholder content
scripts/seed-media/  seed photos, copied into local R2 by db:seed
app/.server/         server-only code (database, auth, email, storage)
app/lib/             shared helpers and site constants
app/styles/site.css  public site styles (the concept CSS, ported verbatim)
app/styles/admin.css admin styles (Tailwind + shadcn/ui)
app/components/ui/   shadcn components (admin only)
app/routes/          pages and resource routes
public/brand/        logo exports, icons and the default share image
```

## Deployment

Production setup happens in Phase 5 (see AGENTS.md section 11), inside Sophiah's Cloudflare account:

1. `npx wrangler d1 create prettyflyliving-db`, then paste the returned `database_id` into `wrangler.jsonc`.
2. `npx wrangler r2 bucket create prettyflyliving-media`
3. `npm run db:migrate:remote`
4. `npx wrangler secret put RESEND_API_KEY`, `npx wrangler secret put TURNSTILE_SECRET_KEY` and `npx wrangler secret put PASSWORD_PEPPER` (a new random value, see `.dev.vars.example`; keep it in Sophiah's password manager, since `admin:create -- --remote` needs it and changing it invalidates the admin password). Then create the admin with `PASSWORD_PEPPER=<that value> npm run admin:create -- --remote`, log in on the live site and check the Worker's metrics for `exceededCpu` (error 1102).
5. Put the production Turnstile site key in `wrangler.jsonc`.
6. `npm run deploy`, then attach the custom domain `prettyflyliving.com`.

Until step 1 is done, `wrangler.jsonc` holds a placeholder database id, so an early deploy fails instead of creating resources in the wrong account.
