import { business as biz } from "../config";
import { reviews } from "../data/reviews";
import { faqs, images, services, type Service } from "./content";
import { escapeHtml, svgArrow } from "./html";

export const brand = `<a class="brand" href="/" aria-label="${biz.name} home"><img class="brand-mark" src="/assets/logo-mark.png" alt="${biz.name} logo"><span class="brand-name">${biz.name}<small>Relocation Simplified</small></span></a>`;

const serviceIconPaths: Readonly<Record<string, string>> = {
  "apartment-moving": '<path d="M4 21V5l8-2 8 2v16M2 21h20M8 8h1m6 0h1M8 12h1m6 0h1M10 21v-5h4v5"/>',
  "house-moving": '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-6h6v6"/>',
  "villa-moving": '<path d="m2 11 10-8 10 8M4 10v11h16V10M8 21v-7h8v7M8 10h.01M16 10h.01"/>',
  "office-relocation":
    '<path d="M4 21V4h11v17M15 9h5v12M2 21h20M7 8h1m3 0h1M7 12h1m3 0h1M7 16h1m3 0h1m6-3h.01m0 4h.01"/>',
  "furniture-moving": '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M4 11h16v6H4zM6 17v3m12-3v3M8 11V9m8 2V9"/>',
  "local-moving": '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  "international-moving": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  "packing-unpacking": '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7 5.8l9 5"/>',
  storage: '<path d="M3 21V4h18v17M3 10h18M3 16h18M8 7h.01M8 13h.01M8 19h.01"/>',
  "warehouse-moving": '<path d="m2 10 10-7 10 7v11H2V10ZM7 21v-7h10v7M6 11h.01M10 11h.01M14 11h.01M18 11h.01"/>',
  "truck-rental":
    '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>',
  "handyman-services": '<path d="m14 6 4-4 4 4-4 4M13 7 4 16a2.1 2.1 0 0 0 3 3l9-9M5 5l2-2 5 5-2 2M3 21h8"/>',
  "piano-moving":
    '<path d="M4 4h16v16H4zM8 4v7h3V4m2 0v7h3V4M8 15h.01M11 15h.01M14 15h.01M17 15h.01M8 18h.01M11 18h.01M14 18h.01M17 18h.01"/>',
  "commercial-relocation": '<path d="M3 21V8l9-5 9 5v13M2 21h20M7 11h2m6 0h2M7 15h2m6 0h2M10 21v-4h4v4"/>'
};

const serviceIcons: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(serviceIconPaths).map(([id, paths]) => [id, `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`])
);

const serviceCompact: Readonly<Record<string, string>> = {
  "apartment-moving": "City apartments, moved with care.",
  "villa-moving": "Room-by-room villa moves.",
  "office-relocation": "Workspaces moved smoothly."
};

export const servicePath = (service: Service): string => `/services/${service.slug}`;

export const areaSlug = (area: string): string => area.toLowerCase().replaceAll(" ", "-");

export const areaPath = (area: string): string => `/areas/${areaSlug(area)}`;

export function serviceCard(service: Service, index: number, wide = false): string {
  const number = String(index + 1).padStart(2, "0");
  return `<a class="service-card ${wide ? "wide" : ""}" href="${servicePath(service)}"><span class="service-num">${number} / ${services.length}</span><span class="service-symbol">${serviceIcons[service.slug] ?? ""}</span><h3>${service.title}</h3><p class="service-description-full">${service.description}</p><p class="service-description-compact">${serviceCompact[service.slug] ?? service.description}</p><span class="text-link"><span class="service-link-label">Explore service</span> ${svgArrow}</span></a>`;
}

const gallerySources: readonly (readonly [string, string])[] = [
  [images.pack, "Two movers wrapping a sofa for safe transport"],
  [images.truck, "Boxes secured in the back of a moving van"],
  [images.interior, "Dubai apartment living room"],
  [images.office, "Modern office workspace prepared for relocation"],
  [images.living, "Dubai Marina residential towers"],
  [images.apartment, "Dubai Marina skyline"]
];

export function galleryItems(limit = 6): string {
  return gallerySources
    .slice(0, limit)
    .map(
      ([src, label]) =>
        `<button data-lightbox="${src}" aria-label="View ${label}"><img loading="lazy" src="${src}" alt="${label}"></button>`
    )
    .join("");
}

export function faqMarkup(): string {
  return faqs
    .map(
      (faq) =>
        `<div class="faq-item"><button class="faq-q" aria-expanded="false"><span>${faq.question}</span><b>＋</b></button><div class="faq-a">${faq.answer}</div></div>`
    )
    .join("");
}

export function reviewStars(rating: number): string {
  return `<span class="review-stars" role="img" aria-label="${rating} out of 5 stars">${"★".repeat(rating)}<span class="review-stars-empty">${"☆".repeat(5 - rating)}</span></span>`;
}

export function reviewsSection(): string {
  return `<section class="section reviews-section" id="reviews"><div class="container"><div class="reviews-heading"><div><div class="eyebrow">Kind words from customers</div><h2>Reviews from real moves.</h2><p>Reviews shown here are from the KI Movers profile on ServiceMarket.</p><a class="servicemarket-open-button" href="https://servicemarket.com/service-provider/kashif-irshad" target="_blank" rel="noopener noreferrer">Read the reviews on ServiceMarket ${svgArrow}</a></div><div class="rating-summary"><span class="rating-score">4.81<small> / 5.0</small></span><span class="aggregate-stars" role="img" aria-label="4.81 out of 5 stars">★★★★★</span><span class="rating-count">357 ratings on ServiceMarket</span><a class="review-source verified-source" href="https://servicemarket.com/service-provider/kashif-irshad" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>View verified profile ↗</a></div></div><div class="reviews-grid">${reviews
    .map(
      (review, index) =>
        `<article class="review-card" style="--review-order:${index}"><div class="review-card-top">${reviewStars(review.rating)}<span class="review-service">${escapeHtml(review.service)}</span></div><h3>${escapeHtml(review.title)}</h3><div class="review-quote-mark" aria-hidden="true">“</div><p class="review-comment">${escapeHtml(review.comment)}</p><footer class="review-meta"><span class="review-avatar" aria-hidden="true">${escapeHtml(review.name.slice(0, 1).toUpperCase())}</span><span class="review-name">${escapeHtml(review.name)}</span><span class="review-date"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>${escapeHtml(review.date)}</span></footer></article>`
    )
    .join("")}</div></div></section>`;
}

export function pageHero(title: string, description: string, crumb = "Home"): string {
  return `<section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="/">Home</a> &nbsp;/&nbsp; ${crumb}</div><div class="page-intro"><div class="eyebrow">A more considered move</div><h1>${title}</h1><p>${description}</p></div></div></section>`;
}
