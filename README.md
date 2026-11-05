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
| `npm run build` | Bundles the app, pre-renders every route to HTML and generates `sitemap.xml` / `robots.txt` in `./dist` |
| `npm run verify` | Type-check, build and SEO check in one go |
| `npm run seo:check` | Validates titles, descriptions, canonicals, structured data, links, sitemap and robots in `./dist` |
| `npm run typecheck` | Type-checks the browser app and the Worker |
| `npm run deploy` | One-command deploy: database, migrations, secrets, build, SEO check, upload |
| `npm run deploy:dry` | Same build/check plus a Wrangler `--dry-run`, without touching Cloudflare |
| `npm run db:migrate:local` / `db:migrate:remote` | Applies `migrations/` to the local or remote D1 database |
| `npm run cf-typegen` | Regenerates `worker-configuration.d.ts` after changing `wrangler.jsonc` |

For the admin page, also copy the local credentials file once:

```bash
cp .dev.vars.example .dev.vars   # then edit the username and password
```

## Project layout

- `src/app.ts` — navigation, theme toggle, form handling and client-side metadata updates.
- `src/site/router.ts` — the routing table: page content, titles, descriptions, canonicals and JSON-LD.
- `src/site/shell.ts` / `src/prerender.ts` — render complete HTML documents for the build.
- `src/site/` — page templates, shared components, header/footer and site content.
- `src/config.ts` — company details, verified figures and the production origin (`https://kimovers.com`).
- `src/data/reviews.ts` — review content.
- `worker/index.ts` — the Worker: `POST /api/quote` and `POST /api/contact` write to D1,
  `/admin` lists submissions, everything else is served from the static assets in `./dist`.
- `worker/admin.ts` — the authenticated submissions page.
- `_headers` — security and caching headers for the static assets.
- `migrations/` — D1 schema.
- `scripts/build.mjs` — esbuild bundle, pre-render, sitemap/robots generation, static copy.
- `scripts/seo-check.mjs` — SEO validation for the built site.
- `scripts/deploy.mjs` — idempotent deploy (D1, migrations, secrets, build, check, upload).
- `styles.css`, `_headers`, `assets/` — static files copied into `./dist` at build time.
- `docs/DEPLOYMENT.md`, `docs/SEO.md` — deployment steps and how the metadata works.

## Deploying to Cloudflare Workers

```bash
npx wrangler login          # once per machine
npm run deploy
```

The script creates or reuses the D1 database, applies migrations, sets the admin
secrets if they are missing, builds, runs the SEO check and deploys.
It is safe to run again. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the manual
steps, custom domains, CI and troubleshooting.

Every route is pre-rendered to its own HTML file, so Cloudflare serves them straight
from `./dist`: `/about` comes from `about.html`, `/about/` redirects to `/about`, and
unknown URLs get `404.html` with a real `404` status. Only `/api/*` and `/admin*`
run the Worker.

### Submissions

Each enquiry is stored in the `submissions` table as readable columns plus the full
JSON payload:

```bash
npx wrangler d1 execute ki-movers-submissions --remote \
  --command "SELECT submitted_at, kind, name, phone, email, service FROM submissions ORDER BY submitted_at DESC"
```

`data/submissions.jsonl` belongs to the previous Node server and is no longer
written to. Import any records you want to keep before removing it.

### Admin page

`/admin` shows the latest 50 submissions, newest first, with the full JSON payload
behind a details toggle. It sets `noindex`, `no-store` and its own CSP, and it is
excluded in `robots.txt`.

Access uses HTTP Basic auth with the single shared credential pair above. Until
both secrets are set the page returns `503`; wrong or missing credentials get
`401` with a `WWW-Authenticate` challenge. Workers are only served over HTTPS, so
the credentials travel encrypted — still pick a long, unique password, and rotate
it with `npx wrangler secret put ADMIN_PASSWORD` if it is ever shared.

### Security and caching headers

Static assets get their headers from `_headers`, which `scripts/build.mjs` copies
into `./dist`:

- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Strict-Transport-Security`, COOP and CORP on every asset.
- A CSP that allows only same-origin scripts and images, same-origin `fetch`, and
  the Google Fonts stylesheet/font origins the design uses.
- `/assets/*` is cached for a week (`max-age=604800`) since photos and vendor
  libraries only change with a deploy; HTML, `app.js` and `styles.css` keep
  Cloudflare's default `max-age=0, must-revalidate` so a deploy is visible at once.

Worker responses are not covered by `_headers`, so `worker/index.ts` and
`worker/admin.ts` set their own headers (`no-store`, `nosniff`, `noindex` and the
admin CSP).

## Before launch

- Update the central company details and verified figures in `src/config.ts`.
- Confirm `https://kimovers.com` is the canonical host and redirect `www` to it.
- Replace placeholder review content with permissioned, verified customer feedback.
- Update the privacy and terms text to match the operator's actual policies; note
  that enquiry records now live in D1.
- Images and fonts load from Unsplash and Google Fonts.
