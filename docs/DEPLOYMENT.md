# Deployment

The site is a Cloudflare Worker that serves pre-rendered static files and handles
two API endpoints plus the admin page. Everything below assumes you are in the
project root.

## Prerequisites

- Node.js 20 or later (`node -v`).
- A Cloudflare account. `wrangler.jsonc` pins `account_id`
  (`fbc2b24ea91e5d6380dc6a5055d7f09b`, Alizskolqq@gmail.com), so a Wrangler login
  with several account memberships still deploys to the right one. Change that
  value to deploy elsewhere.
- A domain on Cloudflare (optional for the first deploy — the site also works on
  the `*.workers.dev` address that Wrangler prints).

## One-command deploy

```bash
npx wrangler login          # once per machine
npm run deploy
```

That is the whole first deploy. `scripts/deploy.mjs` is idempotent and will:

1. Check that Wrangler is authenticated and stop with instructions if not.
2. Create the `ki-movers-submissions` D1 database if it does not exist yet, and
   write its `database_id` into `wrangler.jsonc` (or reuse the existing one).
3. Apply `migrations/` to the remote database.
4. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` secrets if they are missing.
5. Build the site with the production origin (`https://kimovers.com`).
6. Run `npm run seo:check` and abort the deploy if it fails.
7. Run `wrangler deploy` and print the canonical origin.

When the admin secrets are created by the script it generates a password and prints
it once:

```
  Admin login: admin / <generated password>
```

Store it somewhere safe, or set your own before deploying:

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD='a long unique password' npm run deploy
```

Running the command again is safe: the database, migrations and secrets are reused.

### Check the setup without publishing

```bash
npm run deploy:dry
```

This builds the site, runs the SEO check and does a Wrangler `--dry-run` bundle. It
does not log in, create resources, write secrets or upload anything.

### Site URL

The production origin is hard-coded to `https://kimovers.com` in `src/config.ts`
and `scripts/build.mjs`. It is baked into canonical tags, Open Graph URLs, JSON-LD,
`sitemap.xml` and `robots.txt` at build time, so a normal `npm run build` /
`npm run deploy` needs no configuration.

`SITE_URL` (or `--site-url=…` on the deploy script) still overrides it if you ever
preview on another host or move domains:

```bash
SITE_URL=https://staging.kimovers.com npm run deploy:dry
```

Change the domain for good by editing the two `https://kimovers.com` defaults, then
deploy again.

## Manual deploy (CI or step by step)

```bash
npx wrangler login
npx wrangler d1 create ki-movers-submissions      # copy database_id into wrangler.jsonc
npx wrangler d1 migrations apply ki-movers-submissions --remote
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
npm run build
npm run seo:check
npx wrangler deploy
```

`npm run deploy` runs exactly these steps, so prefer it locally.

For CI, set `CLOUDFLARE_API_TOKEN` (Workers Scripts + D1 edit permissions) and
`CLOUDFLARE_ACCOUNT_ID` instead of `wrangler login`, then run the same command.
Migrations skip their confirmation prompt when the process is not interactive.

## Custom domain

1. Add the domain (or `www` subdomain) to Cloudflare.
2. Attach it to the Worker with a route in `wrangler.jsonc`:

   ```jsonc
   "routes": [{ "pattern": "kimovers.com", "custom_domain": true }]
   ```

3. Deploy again. TLS is issued automatically.

The site is built for `https://kimovers.com` without `www`. Add a Cloudflare
Redirect Rule from `www.kimovers.com` (and from `http`) so both variations land on
the canonical URL. Serving the same pages on two
hosts splits ranking signals even though the canonical tag points at one of them.

## After deploying

```bash
curl -sI https://kimovers.com/about        # 200
curl -sI https://kimovers.com/about/       # 307 to /about
curl -sI https://kimovers.com/nope         # 404
curl -s  https://kimovers.com/robots.txt   # sitemap URL and Disallow: /admin
```

Then submit `https://kimovers.com/sitemap.xml` in Google Search Console and
Bing Webmaster Tools. See [SEO.md](./SEO.md) for the full post-launch checklist.

## Operations

| Task | Command |
| --- | --- |
| Watch live logs | `npx wrangler tail` |
| List recent deployments | `npx wrangler deployments list` |
| Roll back to the previous version | `npx wrangler rollback` |
| Read submissions | `npx wrangler d1 execute ki-movers-submissions --remote --command "SELECT submitted_at, kind, name, phone, email, service FROM submissions ORDER BY submitted_at DESC"` |
| Rotate the admin password | `npx wrangler secret put ADMIN_PASSWORD` |

## Troubleshooting

- **`/admin` returns 503** — `ADMIN_USERNAME` / `ADMIN_PASSWORD` are not set for
  this Worker. Rerun `npm run deploy` or set them with `wrangler secret put`.
- **`/admin` returns 401** — the browser has cached old credentials; close it or
  use a private window.
- **Deploy fails at the SEO check** — the message names the page and rule. Fix the
  page copy (unique description, title length, missing canonical) and rerun; nothing
  is uploaded until the check passes.
- **Deploy fails because the D1 database already exists** — `wrangler.jsonc` still
  holds the placeholder id. Run `npx wrangler d1 list` and copy the real
  `database_id`, or delete the placeholder so the deploy script re-creates it.
- **An old page is still visible** — HTML is served with `max-age=0,
  must-revalidate`, so a hard refresh is enough. Assets under `/assets/` are cached
  for a week by design; give a changed asset a new file name.
- **Forms return 500** — check `npx wrangler tail`; the remote schema is probably
  behind. Run `npm run db:migrate:remote`.
