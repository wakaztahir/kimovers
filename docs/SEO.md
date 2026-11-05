# SEO

Every route is pre-rendered to its own HTML file at build time, so crawlers get
complete `<head>` metadata, structured data and page content without running
JavaScript. The client-side router then keeps the same metadata in sync as visitors
navigate.

## Where metadata lives

`src/site/router.ts` is the single source of truth. `resolveRoute(path)` returns:

- `html` — the page template.
- `meta.title`, `meta.description` — unique per page.
- `meta.canonical` — absolute URL built from `SITE_URL` (`null` for the 404 page).
- `meta.robots` — `noindex, follow` for the 404 page, `null` everywhere else.
- `meta.jsonLd` — structured data for the page.
- `status` — `200`, or `404` for unknown paths.

Both sides use it:

- `src/prerender.ts` + `src/site/shell.ts` render complete documents for the build.
- `src/app.ts` calls the same `resolveRoute` and `applyMeta` on navigation, so the
  title, description, canonical, Open Graph, Twitter and robots tags never drift
  between the static HTML and the client-rendered page.

`listRoutes()` feeds `sitemap.xml`, so a route that exists in the router is in the
sitemap and vice versa.

## Build output

`npm run build` writes to `./dist`:

- `index.html`, `about.html`, `services.html`, `services/<slug>.html`, … — one file
  per route. Cloudflare's asset handler serves `/about` from `about.html` and
  redirects `/about/` to `/about`.
- `404.html` — served with a real `404` status for unknown URLs
  (`not_found_handling: "404-page"`), instead of the previous soft-404 `200`.
- `sitemap.xml` — every indexable route with `lastmod` set to the build date.
- `robots.txt` — allows everything except `/admin`, and points at the sitemap.

The origin in all of these comes from `SITE_URL` (see
[DEPLOYMENT.md](./DEPLOYMENT.md)). Nothing is hard-coded.

## Structured data

Emitted as a single `application/ld+json` block with an array of nodes:

| Node | Where |
| --- | --- |
| `MovingCompany` | Every page, with contact details, service area and the service catalogue |
| `WebSite` | Home page |
| `BreadcrumbList` | Every page except home and 404 |
| `Service` | Service detail and area pages |
| `FAQPage` | Service detail pages (matches the FAQ section shown on the page) |
| `WebPage` | Articles, quote and contact pages |

No dates or ratings are invented — Google penalises review markup that is not tied
to real, visible reviews, so the site intentionally omits `aggregateRating`.

## Editing or adding pages

1. Add or edit the template in `src/site/pages.ts`.
2. Add a branch to `resolveRoute` in `src/site/router.ts` with a unique title
   (≤ 62 characters) and description (50–160 characters).
3. Add the path to `listRoutes()` so it reaches `sitemap.xml`.
4. Run `npm run verify` — it type-checks, builds and runs the SEO check.

The checker (`scripts/seo-check.mjs`) fails the build on:

- missing or duplicate titles/descriptions, or titles/descriptions outside the
  recommended length;
- a page without exactly one `<h1>`;
- missing or relative canonical, `og:url` that differs from the canonical,
  `noindex` on an indexable page, or a 404 page that is indexable or has a
  canonical;
- missing `og:image`/`twitter:card`, or an `og:image` file that is not in `dist`;
- broken internal links;
- missing or invalid JSON-LD;
- a sitemap that does not match the pre-rendered pages, or a missing sitemap entry
  in `robots.txt`;
- the placeholder `https://example.com` origin in a production build.

## Post-launch checklist

1. Confirm the canonical host: `https://` without `www`, serving `200`, with `/`
   redirecting nothing and `/about/` redirecting to `/about`.
2. Submit `https://your-domain.com/sitemap.xml` in Google Search Console and Bing
   Webmaster Tools.
3. Validate the home page, one service page and one article in the
   [Rich Results Test](https://search.google.com/test/rich-results).
4. Preview a shared link (WhatsApp, LinkedIn, X) to confirm the Open Graph image and
   text. `assets/og-cover.jpg` is 1200×630 and referenced absolutely.
5. Add the site to analytics or a uptime monitor if required, and keep
   `REVIEW CONTENT` and the marked placeholder values in `src/config.ts` out of the
   live site until they are verified.
