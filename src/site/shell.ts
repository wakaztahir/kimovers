import { business as biz, siteUrl } from "../config";
import { footer, header } from "./chrome";
import { escapeHtml } from "./html";
import type { ResolvedRoute } from "./router";

const OG_IMAGE = `${siteUrl}/assets/og-cover.jpg`;
const OG_IMAGE_ALT = `${biz.name} team preparing furniture for a move in Dubai`;

/**
 * Builds a complete HTML document for a route. The same output is used for the
 * pre-rendered files in ./dist and, without the surrounding document, by the
 * client-side router.
 */
export function renderDocument(route: ResolvedRoute): string {
  const { meta } = route;
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const ogUrl = escapeHtml(meta.canonical ?? `${siteUrl}${meta.path}`);
  const canonical = meta.canonical ? `\n  <link rel="canonical" href="${escapeHtml(meta.canonical)}">` : "";
  const robots = meta.robots ? `\n  <meta name="robots" content="${escapeHtml(meta.robots)}">` : "";
  const structuredData = meta.jsonLd.length
    ? `\n  <script type="application/ld+json" id="structured-data">${JSON.stringify(meta.jsonLd).replace(/</g, "\\u003c")}</script>`
    : "";
  const bodyClass = meta.path === "/quote" ? ' class="quote-page"' : "";

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7fafc">
  <title>${title}</title>
  <meta name="description" content="${description}">${canonical}${robots}
  <meta property="og:site_name" content="${escapeHtml(biz.name)}">
  <meta property="og:locale" content="en_AE">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${ogUrl}">
  <meta property="og:image" content="${escapeHtml(OG_IMAGE)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(OG_IMAGE_ALT)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${escapeHtml(OG_IMAGE)}">
  <link rel="icon" type="image/png" href="/assets/logo-mark.png">
  <link rel="apple-touch-icon" href="/assets/logo-mark.png">
  <link rel="stylesheet" href="/styles.css">${structuredData}
</head>
<body${bodyClass}>
  <div class="site-loader" role="status" aria-label="Loading Movers and Packers"><span class="loader-mark">N</span><span class="loader-line"></span><small>Preparing your move</small></div>
  <div id="app">${header()}${route.html}${footer()}</div>
  <script type="module" src="/app.js"></script>
</body>
</html>`;
}
