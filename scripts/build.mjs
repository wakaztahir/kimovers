import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outdir = "dist";
const buildDir = ".build";
const placeholderUrl = "https://example.com";
const rawSiteUrl = process.env.SITE_URL?.trim();
const siteUrl = (rawSiteUrl || placeholderUrl).replace(/\/+$/, "");
const staticEntries = ["styles.css", "_headers"];
const define = { __SITE_URL__: JSON.stringify(siteUrl) };

if (!rawSiteUrl) {
  console.warn(
    `SITE_URL is not set, so canonical URLs, the sitemap and robots.txt use ${placeholderUrl}.\n` +
      "Set SITE_URL=https://your-domain.com (or run `npm run deploy`) before going live."
  );
}

await rm(outdir, { recursive: true, force: true });
await rm(buildDir, { recursive: true, force: true });
await mkdir(outdir, { recursive: true });
await mkdir(buildDir, { recursive: true });

await build({
  entryPoints: ["src/app.ts"],
  outfile: `${outdir}/app.js`,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  define,
  logLevel: "info"
});

// The site templates are pure string builders, so the same code that runs in
// the browser can render every page to static HTML at build time.
const prerenderEntry = `${buildDir}/prerender.mjs`;
await build({
  entryPoints: ["src/prerender.ts"],
  outfile: prerenderEntry,
  bundle: true,
  format: "esm",
  platform: "node",
  target: ["node20"],
  define,
  logLevel: "warning"
});

const prerender = await import(pathToFileURL(`${process.cwd()}/${prerenderEntry}`).href);
const pages = prerender.renderPages();

for (const page of pages) {
  const target = `${outdir}/${page.file}`;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, page.html);
}

const buildDate = new Date().toISOString().slice(0, 10);
await writeFile(`${outdir}/sitemap.xml`, prerender.renderSitemap(buildDate));
await writeFile(`${outdir}/robots.txt`, prerender.renderRobots());

await Promise.all([
  ...staticEntries.map((entry) => cp(entry, `${outdir}/${entry}`)),
  cp("assets", `${outdir}/assets`, { recursive: true })
]);

const routeCount = pages.length - 1;
console.log(`Pre-rendered ${routeCount} routes + 404.html into ./${outdir}`);
console.log(`Canonical origin: ${siteUrl}`);
