# Restaurant Cafe App

A point-of-sale and order-management app for a small cafe. Customers browse the
menu and place an order from their phone; the cashier and kitchen see it live in
an admin area, take payment, and move the order through its lifecycle.

The UI is in Indonesian, the code and this document are in English.

## Features

- **Customer side** — menu with categories, product detail sheet with quantity and
  notes, cart, and a bill / order-status page. No account needed; the session is
  tracked with a cookie.
- **Pay-first order policy** — one order = one session = one bill. `processOrder()`
  refuses a new order while a session is still open.
- **Order lifecycle** — sessions go `open → processing → closed / cancelled`; each
  order batch goes `pending → processing → done / cancelled`, with an optional
  estimated preparation time.
- **Cashier POS** — create orders for walk-in customers, mark paid, verify or reject
  a bank transfer proof, print a receipt, daily revenue and best-seller reports.
- **Realtime updates** — Pusher Channels (optional). Without it the app falls back
  to polling every 10 seconds.
- **Multi-user admin** — `owner` and `cashier` roles. Cashiers cannot open reports, settings or
  user management. The first owner account is created from a setup form when no user exists.
- **Server-side safety** — prices are always computed on the server, quantities are
  validated, and order writes go through one atomic `db.batch`.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | SvelteKit (Svelte 5), TypeScript |
| Styling | Tailwind CSS v4 (admin), plain CSS tokens (public side) |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM, 5 SQL migrations |
| Hosting | Cloudflare Pages / Workers (`adapter-cloudflare`), R2 for images |
| Auth | Cookie sessions; passwords hashed with PBKDF2-SHA256 (100k iterations, Web Crypto) |
| Realtime | Pusher Channels over its REST API (no Node SDK, works on Workers) |

## Data model

```
tables
  └── table_sessions   (open / processing / closed / cancelled)
        └── order_batches   (pending / processing / done / cancelled)
              └── order_items
users ── auth_sessions        menus ── categories        settings
```

## Run locally

Requires Node.js 20+.

```bash
npm ci
cp .dev.vars.example .dev.vars          # optional: Pusher keys
npx wrangler d1 migrations apply restaurant-db --local
npx wrangler d1 execute restaurant-db --local --file=seed.sql   # sample menu
npm run build && npx wrangler pages dev .svelte-kit/cloudflare
```

Open the admin area at `/admin/login`. On first run it shows a form to create the
owner account. For a real deployment, set the real D1 `database_id` in
`wrangler.json` (it is a placeholder in this repository) and add the Pusher values
as secrets with `npx wrangler pages secret put <NAME>`.

## Checks

```bash
npm run check    # svelte-kit sync + svelte-check (0 errors)
npm run lint     # prettier + eslint
```

## Known limitations

- No automated tests yet.
- The public pages ship with only design tokens and a minimal base stylesheet.
  The original decorative images and stylesheet came from a third-party template
  and were removed from this repository, so the customer side looks plain.
- Payment is recorded manually (cash, or a transfer proof checked by the cashier);
  there is no payment gateway.

## Notes on how it was built

`CLAUDE.md` and `GEMINI.md` are the working notes I keep for AI coding assistants
(architecture, conventions, rules such as which commands they may not run). They
are kept in the repository on purpose.
