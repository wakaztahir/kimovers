import { business as biz, siteUrl } from "../config";
import { areaSlug, servicePath } from "./components";
import { areas, faqs, posts, services } from "./content";
import {
  aboutPage,
  areaPage,
  areasPage,
  blogPage,
  contactPage,
  galleryPage,
  home,
  legalPage,
  notFound,
  postPage,
  quotePage,
  servicePage,
  servicesPage
} from "./pages";

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  canonical: string | null;
  /** Only set when a page should be kept out of search results. */
  robots: string | null;
  jsonLd: readonly Record<string, unknown>[];
}

export interface ResolvedRoute {
  html: string;
  meta: PageMeta;
  status: 200 | 404;
}

export interface SitemapRoute {
  path: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

interface Breadcrumb {
  name: string;
  path: string;
}

const ORG_ID = `${siteUrl}/#organization`;

const absoluteUrl = (path: string): string => `${siteUrl}${path === "/" ? "/" : path}`;

/** Mirrors how the browser treats URLs: decoded, no trailing slash. */
export function normalizePath(rawPath: string): string {
  return decodeURI(rawPath).replace(/\/+$/, "") || "/";
}

function organizationSchema(): Record<string, unknown> {
  return {
    "@type": "MovingCompany",
    "@id": ORG_ID,
    name: biz.name,
    url: `${siteUrl}/`,
    telephone: biz.phoneLink || undefined,
    email: biz.email.includes("[") ? undefined : biz.email,
    image: `${siteUrl}/assets/og-cover.jpg`,
    address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
    areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Moving and relocation services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.title, url: absoluteUrl(servicePath(service)) }
      }))
    }
  };
}

function websiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: biz.name,
    inLanguage: "en",
    publisher: { "@id": ORG_ID }
  };
}

function breadcrumbSchema(items: readonly Breadcrumb[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

function serviceSchema(title: string, description: string, path: string): Record<string, unknown> {
  return {
    "@type": "Service",
    name: `${title} in Dubai`,
    serviceType: title,
    description,
    url: absoluteUrl(path),
    provider: { "@id": ORG_ID },
    areaServed: ["Dubai", "Abu Dhabi", "Sharjah"]
  };
}

function faqSchema(): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  };
}

function webPageSchema(title: string, description: string, path: string): Record<string, unknown> {
  return {
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": ORG_ID }
  };
}

interface PageOptions {
  title: string;
  description: string;
  breadcrumbs?: readonly Breadcrumb[];
  jsonLd?: readonly Record<string, unknown>[];
}

function page(path: string, html: string, options: PageOptions): ResolvedRoute {
  return {
    html,
    status: 200,
    meta: {
      path,
      title: options.title,
      description: options.description,
      canonical: absoluteUrl(path),
      robots: null,
      jsonLd: [
        organizationSchema(),
        ...(options.breadcrumbs ? [breadcrumbSchema(options.breadcrumbs)] : []),
        ...(options.jsonLd ?? [])
      ]
    }
  };
}

const HOME_BREADCRUMB: readonly Breadcrumb[] = [{ name: "Home", path: "/" }];

/** The single source of truth for page content and metadata. */
export function resolveRoute(rawPath: string): ResolvedRoute {
  const path = normalizePath(rawPath);
  const segments = path.split("/").filter(Boolean);

  if (path === "/") {
    return page(path, home(), {
      title: `${biz.name} | Movers and Packers in Dubai`,
      description:
        "Thoughtful home, villa and office moving in Dubai and across the UAE. Clear plans, careful handling and one point of contact.",
      jsonLd: [websiteSchema()]
    });
  }

  if (path === "/about") {
    return page(path, aboutPage(), {
      title: `About us | ${biz.name}`,
      description:
        "Meet the team behind KI Movers and the principles that shape our home, villa and office moves across Dubai.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "About us", path: "/about" }]
    });
  }

  if (path === "/services") {
    return page(path, servicesPage(), {
      title: `Moving services in Dubai | ${biz.name}`,
      description:
        "Apartment, villa, office, furniture, packing and international moving in Dubai, planned around your property and schedule.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Services", path: "/services" }]
    });
  }

  if (segments[0] === "services" && segments[1]) {
    const service = services.find((item) => item.slug === segments[1]);
    const html = servicePage(segments[1]);
    if (service && html) {
      return page(path, html, {
        title: `${service.title} in Dubai | ${biz.name}`,
        description: service.description,
        breadcrumbs: [
          ...HOME_BREADCRUMB,
          { name: "Services", path: "/services" },
          { name: service.title, path: servicePath(service) }
        ],
        jsonLd: [serviceSchema(service.title, service.description, path), faqSchema()]
      });
    }
  }

  if (path === "/areas") {
    return page(path, areasPage(), {
      title: `Areas we serve | ${biz.name}`,
      description:
        "Moving across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah and Fujairah, with local knowledge for each area.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Areas we serve", path: "/areas" }]
    });
  }

  if (segments[0] === "areas" && segments[1]) {
    const area = areas.find((item) => areaSlug(item) === segments[1]);
    const html = areaPage(segments[1]);
    if (area && html) {
      return page(path, html, {
        title: `Movers in ${area} | ${biz.name}`,
        description: `Movers in ${area}: apartment, villa and office moves planned around your building access, timing and priorities.`,
        breadcrumbs: [
          ...HOME_BREADCRUMB,
          { name: "Areas we serve", path: "/areas" },
          { name: area, path: `/areas/${areaSlug(area)}` }
        ],
        jsonLd: [serviceSchema(`${area} moving`, `Moving services in ${area}.`, path)]
      });
    }
  }

  if (path === "/gallery") {
    return page(path, galleryPage(), {
      title: `Moving gallery | ${biz.name}`,
      description:
        "Photos from recent moves in Dubai: packing, furniture protection, loading and the details that make a move feel calm.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Gallery", path: "/gallery" }]
    });
  }

  if (path === "/blog") {
    return page(path, blogPage(), {
      title: `Moving journal | ${biz.name}`,
      description:
        "Practical moving guides for Dubai: planning a calmer moving day, packing fragile items and preparing your building move.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Journal", path: "/blog" }]
    });
  }

  if (segments[0] === "blog" && segments[1]) {
    const post = posts.find((item) => item.slug === segments[1]);
    const html = postPage(segments[1]);
    if (post && html) {
      const title = `${post.title} | ${biz.name}`;
      return page(path, html, {
        title,
        description: post.excerpt,
        breadcrumbs: [
          ...HOME_BREADCRUMB,
          { name: "Journal", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` }
        ],
        jsonLd: [webPageSchema(title, post.excerpt, path)]
      });
    }
  }

  if (path === "/quote") {
    return page(path, quotePage(), {
      title: `Get a moving quote | ${biz.name}`,
      description:
        "Tell us about your move and request a moving quote from KI Movers in Dubai. Share your route, timing and property details.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Get a quote", path: "/quote" }],
      jsonLd: [webPageSchema("Get a moving quote", "Request a moving quote from KI Movers in Dubai.", path)]
    });
  }

  if (path === "/contact") {
    return page(path, contactPage(), {
      title: `Contact | ${biz.name}`,
      description:
        "Contact KI Movers in Dubai about a home, villa or office move. Send a message or call the team directly.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Contact", path: "/contact" }],
      jsonLd: [webPageSchema("Contact", "Contact KI Movers in Dubai about your move.", path)]
    });
  }

  if (path === "/privacy") {
    return page(path, legalPage("privacy"), {
      title: `Privacy policy | ${biz.name}`,
      description:
        "How enquiry information submitted through the KI Movers website is stored, used and kept secure.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Privacy", path: "/privacy" }]
    });
  }

  if (path === "/terms") {
    return page(path, legalPage("terms"), {
      title: `Terms of use | ${biz.name}`,
      description: "The terms that apply to using the KI Movers website and sending a moving enquiry.",
      breadcrumbs: [...HOME_BREADCRUMB, { name: "Terms", path: "/terms" }]
    });
  }

  return resolveNotFound(path);
}

/** The 404 page, also used for unknown slugs and the generated 404.html. */
export function resolveNotFound(path = "/404"): ResolvedRoute {
  return {
    html: notFound(),
    status: 404,
    meta: {
      path,
      title: `Page not found | ${biz.name}`,
      description:
        "The page you were looking for could not be found. Return to KI Movers to explore moving services in Dubai.",
      canonical: null,
      robots: "noindex, follow",
      jsonLd: []
    }
  };
}

/** Every indexable page, in the order it appears in sitemap.xml. */
export function listRoutes(): SitemapRoute[] {
  const routes: SitemapRoute[] = [{ path: "/", changefreq: "weekly", priority: 1 }];

  routes.push(
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/services", changefreq: "monthly", priority: 0.9 }
  );
  for (const service of services) {
    routes.push({ path: servicePath(service), changefreq: "monthly", priority: 0.8 });
  }
  routes.push({ path: "/areas", changefreq: "monthly", priority: 0.8 });
  for (const area of areas) {
    routes.push({ path: `/areas/${areaSlug(area)}`, changefreq: "monthly", priority: 0.6 });
  }
  routes.push(
    { path: "/gallery", changefreq: "monthly", priority: 0.6 },
    { path: "/blog", changefreq: "weekly", priority: 0.7 }
  );
  for (const post of posts) {
    routes.push({ path: `/blog/${post.slug}`, changefreq: "yearly", priority: 0.5 });
  }
  routes.push(
    { path: "/quote", changefreq: "yearly", priority: 0.9 },
    { path: "/contact", changefreq: "yearly", priority: 0.7 },
    { path: "/privacy", changefreq: "yearly", priority: 0.2 },
    { path: "/terms", changefreq: "yearly", priority: 0.2 }
  );

  return routes;
}
