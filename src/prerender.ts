import { siteUrl } from "./config";
import { listRoutes, resolveNotFound, resolveRoute } from "./site/router";
import { renderDocument } from "./site/shell";

export interface PrerenderedFile {
  file: string;
  html: string;
  status: number;
}

const fileFor = (path: string): string => (path === "/" ? "index.html" : `${path.slice(1)}.html`);

const absoluteUrl = (path: string): string => `${siteUrl}${path === "/" ? "/" : path}`;

/** Every route as a static HTML file, plus a real 404 page. */
export function renderPages(): PrerenderedFile[] {
  const pages: PrerenderedFile[] = listRoutes().map((route) => {
    const resolved = resolveRoute(route.path);
    return { file: fileFor(route.path), html: renderDocument(resolved), status: resolved.status };
  });

  pages.push({ file: "404.html", html: renderDocument(resolveNotFound()), status: 404 });
  return pages;
}

export function renderSitemap(buildDate: string): string {
  const entries = listRoutes()
    .map(
      (route) =>
        `  <url>\n    <loc>${absoluteUrl(route.path)}</loc>\n    <lastmod>${buildDate}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority.toFixed(1)}</priority>\n  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

export function renderRobots(): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

export { siteUrl };
