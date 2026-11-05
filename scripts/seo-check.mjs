import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const dist = "dist";
const errors = [];
const failures = (message) => errors.push(message);

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
};

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const match = (html, pattern) => {
  const found = html.match(pattern);
  return found ? decodeEntities(found[1].trim()) : null;
};

const all = (html, pattern) => [...html.matchAll(pattern)];

if (!existsSync(`${dist}/index.html`)) {
  console.error("dist/ is missing or was not pre-rendered. Run `npm run build` first.");
  process.exit(1);
}

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const urlForFile = (file) => {
  const rel = file.slice(dist.length + 1).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return null;
  return `/${rel.replace(/\.html$/, "")}`;
};

const home = await readFile(`${dist}/index.html`, "utf8");
const canonicalOrigin = match(home, /<link rel="canonical" href="([^"]+)"/)?.replace(/\/$/, "") ?? null;
const envOrigin = process.env.SITE_URL?.trim().replace(/\/+$/, "") ?? null;
const origin = envOrigin ?? canonicalOrigin;

if (!canonicalOrigin) failures("index.html has no <link rel=\"canonical\">, so the site origin cannot be detected.");
if (envOrigin && canonicalOrigin && envOrigin !== canonicalOrigin) {
  failures(`index.html canonical origin ${canonicalOrigin} does not match SITE_URL ${envOrigin}. Rebuild with the same SITE_URL.`);
}
if (origin === "https://example.com") {
  failures("The build still uses the placeholder origin https://example.com. Set SITE_URL to the production domain.");
}

const seenTitles = new Map();
const seenDescriptions = new Map();
const pageUrls = new Map();
const internalLinks = new Set();

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const url = urlForFile(file);
  const label = url ?? "/404.html (404 page)";
  const isNotFound = url === null;
  if (url) pageUrls.set(url, file);

  const title = match(html, /<title>([^<]*)<\/title>/);
  const description = match(html, /<meta name="description" content="([^"]*)"/);
  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/);
  const robots = match(html, /<meta name="robots" content="([^"]*)"/);
  const ogImage = match(html, /<meta property="og:image" content="([^"]+)"/);
  const ogUrl = match(html, /<meta property="og:url" content="([^"]+)"/);
  const twitterCard = match(html, /<meta name="twitter:card" content="([^"]+)"/);
  const h1Count = all(html, /<h1[\s>]/g).length;

  if (!title) failures(`${label}: missing <title>.`);
  else if (title.length > 62) failures(`${label}: title is ${title.length} characters (max 62): "${title}"`);

  if (!description) failures(`${label}: missing meta description.`);
  else if (description.length > 160) failures(`${label}: description is ${description.length} characters (max 160).`);
  else if (description.length < 50) failures(`${label}: description is only ${description.length} characters (aim for 50-160).`);

  if (h1Count !== 1) failures(`${label}: expected exactly one <h1>, found ${h1Count}.`);

  if (!isNotFound) {
    if (!canonical) failures(`${label}: missing canonical URL.`);
    else if (!canonical.startsWith(`${origin}/`)) failures(`${label}: canonical ${canonical} is not on ${origin}.`);
    if (!ogUrl || ogUrl !== canonical) failures(`${label}: og:url should equal the canonical URL.`);
    if (!robots) {
      // An indexable page is fine without a robots tag.
    } else if (/noindex/i.test(robots)) failures(`${label}: indexable page is marked noindex (${robots}).`);
    if (title && seenTitles.has(title)) failures(`${label}: duplicate title also used by ${seenTitles.get(title)}.`);
    if (description && seenDescriptions.has(description)) {
      failures(`${label}: duplicate description also used by ${seenDescriptions.get(description)}.`);
    }
    if (title) seenTitles.set(title, label);
    if (description) seenDescriptions.set(description, label);
  } else {
    if (canonical) failures("404 page should not declare a canonical URL.");
    if (!robots || !/noindex/i.test(robots)) failures("404 page must be marked noindex.");
  }

  if (!ogImage) failures(`${label}: missing og:image.`);
  else {
    if (!ogImage.startsWith(`${origin}/`)) failures(`${label}: og:image ${ogImage} is not absolute on ${origin}.`);
    const localImage = ogImage.startsWith(origin) ? `${dist}${ogImage.slice(origin.length)}` : null;
    if (localImage && !existsSync(localImage)) failures(`${label}: og:image file ${localImage} does not exist.`);
  }
  if (!twitterCard) failures(`${label}: missing twitter:card.`);

  const structuredData = all(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  if (!isNotFound && structuredData.length === 0) failures(`${label}: missing JSON-LD structured data.`);
  for (const [, json] of structuredData) {
    try {
      JSON.parse(json.replace(/\\u003c/g, "<"));
    } catch {
      failures(`${label}: JSON-LD does not parse.`);
    }
  }

  for (const [, href] of all(html, /href="([^"]+)"/g)) {
    if (href.startsWith("/") && !href.startsWith("//")) internalLinks.add(href.split(/[?#]/)[0]);
  }
  for (const [, src] of all(html, /src="([^"]+)"/g)) {
    if (src.startsWith("/") && !src.startsWith("//")) internalLinks.add(src.split(/[?#]/)[0]);
  }
}

const resolveLink = (href) => {
  if (href === "/") return `${dist}/index.html`;
  const clean = href.replace(/\/+$/, "");
  const candidates = [`${dist}${clean}`, `${dist}${clean}.html`, `${dist}${clean}/index.html`];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};

for (const href of [...internalLinks].sort()) {
  if (href === "" || href === "/" || href.startsWith("/api/") || href === "/admin" || href.startsWith("/admin/")) continue;
  if (!resolveLink(href)) failures(`Broken internal link: ${href}`);
}

const sitemap = await readFile(`${dist}/sitemap.xml`, "utf8").catch(() => null);
if (!sitemap) {
  failures("dist/sitemap.xml is missing.");
} else {
  const locs = all(sitemap, /<loc>([^<]+)<\/loc>/g).map(([, loc]) => loc);
  if (!locs.length) failures("sitemap.xml contains no URLs.");
  if (new Set(locs).size !== locs.length) failures("sitemap.xml contains duplicate URLs.");
  for (const loc of locs) {
    if (!origin || !loc.startsWith(`${origin}/`)) failures(`sitemap.xml URL is not on ${origin}: ${loc}`);
    const path = origin && loc.startsWith(origin) ? loc.slice(origin.length) || "/" : null;
    if (path && !pageUrls.has(path)) failures(`sitemap.xml lists ${loc}, but no page was pre-rendered for it.`);
  }
  for (const url of pageUrls.keys()) {
    if (!locs.includes(`${origin}${url}`)) failures(`${url} is pre-rendered but missing from sitemap.xml.`);
  }
}

const robotsTxt = await readFile(`${dist}/robots.txt`, "utf8").catch(() => null);
if (!robotsTxt) failures("dist/robots.txt is missing.");
else {
  if (!robotsTxt.includes(`Sitemap: ${origin}/sitemap.xml`)) failures("robots.txt does not point at the sitemap.");
  if (!/Disallow: \/admin/.test(robotsTxt)) failures("robots.txt should disallow /admin.");
}

if (errors.length) {
  console.error(`SEO check failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`SEO check passed for ${pageUrls.size} pages + 404 page on ${origin}.`);
console.log(`  ${seenDescriptions.size} unique descriptions, ${internalLinks.size} internal links, sitemap and robots.txt valid.`);
