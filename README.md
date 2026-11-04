# Movers & Packers website

Static marketing site for KI Movers, written in TypeScript and deployed as a
Cloudflare Worker with static assets. Quote and contact submissions are stored in
Cloudflare D1.

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run db:migrate:local   # first run only: creates the local D1 schema
npm run dev                # builds the site, then starts wrangler dev
```

Open <http://localhost:8787>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Builds `./dist` and serves it with `wrangler dev` (local D1 included) |
| `npm run build` | Bundles `src/app.ts` and copies the static files into `./dist` |
| `npm run typecheck` | Type-checks the browser app and the Worker |
| `npm run deploy` | Builds and deploys with `wrangler deploy` |
| `npm run db:migrate:local` / `db:migrate:remote` | Applies `migrations/` to the local or remote D1 database |
| `npm run cf-typegen` | Regenerates `worker-configuration.d.ts` after changing `wrangler.jsonc` |

## Project layout

- `src/app.ts` — router, page metadata, navigation, theme toggle and form handling.
- `src/site/` — page templates, shared components, header/footer and site content.
- `src/config.ts` — company details and verified figures.
- `src/data/reviews.ts` — review content.
- `worker/index.ts` — the Worker: `POST /api/quote` and `POST /api/contact` write to D1,
  everything else is served from the static assets in `./dist`.
- `migrations/` — D1 schema.
- `scripts/build.mjs` — esbuild bundle plus static file copy.
- `index.html`, `styles.css`, `robots.txt`, `sitemap.xml`, `assets/` — static files,
  copied into `./dist` at build time.

## Deploying to Cloudflare Workers

1. Authenticate once: `npx wrangler login`.
2. Create the database: `npx wrangler d1 create ki-movers-submissions`.
3. Copy the returned `database_id` into `wrangler.jsonc`, replacing the placeholder.
4. Apply the schema: `npm run db:migrate:remote`.
5. Deploy: `npm run deploy`.

Routing is configured in `wrangler.jsonc`: assets are served first, only `/api/*`
runs the Worker, and unknown page URLs fall back to `index.html` so the
client-side router keeps working.

### Submissions

Each enquiry is stored in the `submissions` table as readable columns plus the full
JSON payload:

```bash
npx wrangler d1 execute ki-movers-submissions --remote \
  --command "SELECT submitted_at, kind, name, phone, email, service FROM submissions ORDER BY submitted_at DESC"
```

`data/submissions.jsonl` belongs to the previous Node server and is no longer
written to. Import any records you want to keep before removing it.

## Before launch

- Update the central company details and verified figures in `src/config.ts`.
- Replace `https://example.com` in `src/config.ts`, `index.html`, `robots.txt` and
  `sitemap.xml` with the production domain.
- Replace placeholder review content with permissioned, verified customer feedback.
- Update the privacy and terms text to match the operator's actual policies; note
  that enquiry records now live in D1.
- Images and fonts load from Unsplash and Google Fonts.
