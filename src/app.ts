import { business as biz } from "./config";
import { areas, posts, services } from "./site/content";
import { escapeHtml, svgArrow } from "./site/html";
import { areaSlug, servicePath } from "./site/components";
import { footer, header } from "./site/chrome";
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
} from "./site/pages";

interface BirdsEffect {
  destroy: () => void;
}

interface BirdsOptions {
  el: Element;
  THREE: unknown;
  backgroundAlpha: number;
  backgroundColor: number;
  colorMode: string;
  color1: number;
  color2: number;
  quantity: number;
  birdSize: number;
  wingSpan: number;
  speedLimit: number;
  separation: number;
  alignment: number;
  cohesion: number;
  mouseControls: boolean;
  touchControls: boolean;
  gyroControls: boolean;
  scale: number;
  scaleMobile: number;
}

interface ApiResponse {
  ok: boolean;
  id?: string;
  error?: string;
}

declare global {
  interface Window {
    THREE?: unknown;
    VANTA?: {
      BIRDS?: (options: BirdsOptions) => BirdsEffect | undefined;
    };
  }

  interface Navigator {
    connection?: { saveData?: boolean };
  }
}

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("The #app container is missing from index.html.");
const app: HTMLDivElement = appRoot;

let heroBirdsEffect: BirdsEffect | null = null;
const vendorLoads = new Map<string, Promise<void>>();

function loadVendorScript(src: string): Promise<void> {
  const existing = vendorLoads.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
  vendorLoads.set(src, promise);
  return promise;
}

function startHeroBirds(): void {
  const hero = document.querySelector<HTMLElement>(".hero");
  if (!hero) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hero.classList.add("reduced-motion");
    return;
  }
  const smallScreen = matchMedia("(max-width: 700px)").matches;
  const lowPower = navigator.connection?.saveData === true || navigator.hardwareConcurrency <= 4;
  if (smallScreen || lowPower) {
    hero.classList.add("has-birds-fallback");
    return;
  }
  const start = async (): Promise<void> => {
    try {
      if (!window.THREE) await loadVendorScript("/assets/vendor/three-r134.min.js");
      if (!window.VANTA?.BIRDS) await loadVendorScript("/assets/vendor/vanta-birds.min.js");
      if (!hero.isConnected || heroBirdsEffect) return;
      const birds = window.VANTA?.BIRDS;
      if (!birds) return;
      heroBirdsEffect = birds({
        el: hero,
        THREE: window.THREE,
        backgroundAlpha: 0,
        backgroundColor: 0x071521,
        colorMode: "lerp",
        color1: 0x277f96,
        color2: 0x42c6dc,
        quantity: 3,
        birdSize: 1,
        wingSpan: 23,
        speedLimit: 3,
        separation: 20,
        alignment: 20,
        cohesion: 20,
        mouseControls: false,
        touchControls: false,
        gyroControls: false,
        scale: 1,
        scaleMobile: 1.5
      }) ?? null;
      if (heroBirdsEffect) hero.classList.add("has-birds-background");
    } catch (error) {
      console.warn("Home background animation unavailable; keeping the lightweight fallback.", error);
    }
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => void start(), { timeout: 1400 });
  } else {
    setTimeout(() => void start(), 180);
  }
}

function setMeta(title: string, description: string, path: string): void {
  document.title = title;
  const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.content = description;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `${biz.website}${path}`;
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = title;
  const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  if (ogDescription) ogDescription.content = description;
  const structuredData = document.getElementById("structured-data");
  if (structuredData) {
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      name: biz.name,
      url: biz.website,
      telephone: biz.phoneLink || undefined,
      email: biz.email.includes("[") ? undefined : biz.email,
      address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
      areaServed: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Moving and relocation services",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: service.title, url: `${biz.website}${servicePath(service)}` }
        }))
      }
    });
  }
}

function bindPageMotion(): void {
  const items = Array.from(
    app.querySelectorAll<HTMLElement>(
      ".service-card,.step,.review-card,.faq-item,.image-stack,.why-photo,.gallery-grid button,.page-intro,.hero-copy"
    )
  );
  items.forEach((item, index) => item.style.setProperty("--motion-delay", `${(index % 6) * 28}ms`));
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("motion-in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("motion-in");
          observer.unobserve(entry.target);
        }
      }),
    { rootMargin: "0px 0px -36px 0px", threshold: 0.08 }
  );
  items.forEach((item) => observer.observe(item));
}

function hidePageLoader(): void {
  const loader = document.querySelector<HTMLElement>(".site-loader");
  if (!loader || loader.dataset.done) return;
  loader.dataset.done = "true";
  setTimeout(() => {
    loader.classList.add("done");
    setTimeout(() => loader.remove(), 340);
  }, 220);
}

function mount(): void {
  heroBirdsEffect?.destroy();
  heroBirdsEffect = null;
  document.querySelector(".hero")?.classList.remove("has-birds-background");
  const path = decodeURI(location.pathname).replace(/\/$/, "") || "/";
  document.body.classList.toggle("quote-page", path === "/quote");
  const seg = path.split("/").filter(Boolean);
  let body: string;
  let title = `${biz.name} | Movers and Packers in Dubai`;
  let desc = "Thoughtful home, villa and office moving in Dubai and across the UAE.";

  if (path === "/") {
    body = home();
  } else if (path === "/about") {
    body = aboutPage();
    title = `About | ${biz.name}`;
  } else if (path === "/services") {
    body = servicesPage();
    title = `Moving Services in Dubai | ${biz.name}`;
  } else if (seg[0] === "services" && seg[1]) {
    body = servicePage(seg[1]) ?? notFound();
    title = `${services.find((service) => service.slug === seg[1])?.title ?? "Moving"} in Dubai | ${biz.name}`;
  } else if (path === "/areas") {
    body = areasPage();
    title = `Areas We Serve | ${biz.name}`;
  } else if (seg[0] === "areas" && seg[1]) {
    body = areaPage(seg[1]) ?? notFound();
    title = `Movers in ${areas.find((area) => areaSlug(area) === seg[1]) ?? "Dubai"} | ${biz.name}`;
  } else if (path === "/gallery") {
    body = galleryPage();
    title = `Moving Gallery | ${biz.name}`;
  } else if (path === "/blog") {
    body = blogPage();
    title = `Moving Journal | ${biz.name}`;
  } else if (seg[0] === "blog" && seg[1]) {
    body = postPage(seg[1]) ?? notFound();
    title = `${posts.find((post) => post.slug === seg[1])?.title ?? "Moving Journal"} | ${biz.name}`;
  } else if (path === "/quote") {
    body = quotePage();
    title = `Get a Moving Quote | ${biz.name}`;
  } else if (path === "/contact") {
    body = contactPage();
    title = `Contact | ${biz.name}`;
  } else if (path === "/privacy") {
    body = legalPage("privacy");
    title = `Privacy | ${biz.name}`;
  } else if (path === "/terms") {
    body = legalPage("terms");
    title = `Terms | ${biz.name}`;
  } else {
    body = notFound();
  }

  app.innerHTML = header() + body + footer();
  app.classList.remove("route-enter");
  void app.offsetWidth;
  app.classList.add("route-enter");
  setMeta(title, desc, path);
  bind();
  bindPageMotion();
  if (path === "/") startHeroBirds();
  hidePageLoader();
}

function transitionMount(): Promise<void> {
  if (typeof document.startViewTransition === "function") {
    return document.startViewTransition(() => mount()).updateCallbackDone;
  }
  mount();
  return Promise.resolve();
}

function bindThemeToggle(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!toggle) return;
  const root = document.documentElement;
  const apply = (theme: string): void => {
    const night = theme === "dark";
    root.dataset.theme = night ? "dark" : "light";
    toggle.setAttribute("aria-label", night ? "Switch to day mode" : "Switch to night mode");
    toggle.setAttribute("aria-pressed", String(night));
    toggle.title = night ? "Switch to day mode" : "Switch to night mode";
    toggle.classList.toggle("is-night", night);
    const meta = document.querySelector<HTMLMetaElement>("meta[name=theme-color]");
    if (meta) meta.content = night ? "#071521" : "#f7fafc";
  };
  toggle.addEventListener("click", () => apply(root.dataset.theme === "dark" ? "light" : "dark"));
  apply(root.dataset.theme || "light");
}

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function formControl(form: HTMLFormElement, name: string): FormControl | null {
  const control = form.elements.namedItem(name);
  if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) {
    return control;
  }
  return null;
}

function fieldValue(form: HTMLFormElement, name: string): string {
  return formControl(form, name)?.value ?? "";
}

function readApiResponse(payload: unknown): ApiResponse {
  if (typeof payload !== "object" || payload === null) return { ok: false };
  const record = payload as Record<string, unknown>;
  return {
    ok: record.ok === true,
    id: typeof record.id === "string" ? record.id : undefined,
    error: typeof record.error === "string" ? record.error : undefined
  };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function bindQuote(): void {
  const form = document.querySelector<HTMLFormElement>("#quote-form");
  if (!form) return;
  const steps = Array.from(form.querySelectorAll<HTMLElement>(".form-step"));
  const progress = Array.from(form.querySelectorAll<HTMLElement>(".quote-progress span"));
  const back = form.querySelector<HTMLButtonElement>("#quote-back");
  const next = form.querySelector<HTMLButtonElement>("#quote-next");
  const submit = form.querySelector<HTMLButtonElement>("#quote-submit");
  const error = form.querySelector<HTMLElement>(".form-error");
  if (!back || !next || !submit || !error) return;

  let current = 0;

  const refresh = (): void => {
    steps.forEach((step, index) => step.classList.toggle("active", index === current));
    progress.forEach((step, index) => step.classList.toggle("active", index <= current));
    back.style.visibility = current ? "visible" : "hidden";
    next.style.display = current < 3 ? "inline-flex" : "none";
    submit.style.display = current === 3 ? "inline-flex" : "none";
    error.textContent = "";
    if (current === 3) {
      const summary = form.querySelector<HTMLElement>("#quote-summary");
      if (summary) {
        summary.textContent = [
          ["Service", fieldValue(form, "service")],
          ["Property size", fieldValue(form, "size") || "Not specified"],
          ["Moving from", fieldValue(form, "from")],
          ["Moving to", fieldValue(form, "to")],
          ["Preferred date", fieldValue(form, "date")],
          ["Additional services", fieldValue(form, "extras") || "None"],
          ["Name", fieldValue(form, "name")],
          ["Phone", fieldValue(form, "phone")],
          ["WhatsApp", fieldValue(form, "whatsapp") || "Same as phone"],
          ["Email", fieldValue(form, "email")],
          ["Comments", fieldValue(form, "comments") || "None"]
        ]
          .map(([label, value]) => `${label}: ${value}`)
          .join("\n");
      }
    }
  };

  const check = (): boolean => {
    const fields = steps[current].querySelectorAll<FormControl>("[required]:not([type=checkbox])");
    for (const element of fields) {
      if (!element.checkValidity()) {
        error.textContent =
          element instanceof HTMLInputElement && element.type === "email"
            ? "Enter a valid email address."
            : "Please complete the required fields before continuing.";
        element.focus();
        return false;
      }
    }
    return true;
  };

  next.onclick = () => {
    if (check()) {
      current++;
      refresh();
    }
  };

  back.onclick = () => {
    current = Math.max(0, current - 1);
    refresh();
  };

  const dateInput = form.querySelector<HTMLInputElement>("input[type=date]");
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

  const requested = new URLSearchParams(location.search).get("service");
  if (requested) {
    const select = formControl(form, "service");
    if (select instanceof HTMLSelectElement) {
      const option = Array.from(select.options).find((candidate) =>
        candidate.value.toLowerCase().includes(requested.toLowerCase().split(" ")[0])
      );
      if (option) select.value = option.value;
    }
  }

  form.onsubmit = async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.textContent = "Sending…";
    error.textContent = "";
    const data = Object.fromEntries(new FormData(form));
    delete data.consent;
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = readApiResponse(await response.json());
      if (!response.ok) throw new Error(result.error || "Unable to send your request.");
      form.innerHTML = `<div class="form-status"><strong>Thank you — your request has been saved.</strong><br>Your enquiry reference is ${escapeHtml(
        (result.id ?? "").slice(0, 8)
      )}. The moving team can follow up using the contact details you provided.</div>`;
    } catch (err) {
      submit.disabled = false;
      submit.innerHTML = `Send request ${svgArrow}`;
      error.textContent = `${errorMessage(err, "Unable to send your request.")} Please try again.`;
    }
  };
}

function bindContact(): void {
  const form = document.querySelector<HTMLFormElement>("#contact-form");
  if (!form) return;
  form.onsubmit = async (event) => {
    event.preventDefault();
    const status = form.querySelector<HTMLElement>("#contact-status");
    const button = form.querySelector<HTMLButtonElement>("button[type=submit]");
    if (!status || !button) return;
    status.innerHTML = "";
    if (!form.reportValidity()) return;
    button.disabled = true;
    button.textContent = "Sending…";
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const result = readApiResponse(await response.json());
      if (!response.ok) throw new Error(result.error || "Unable to send your message.");
      status.innerHTML = `<div class="form-status">Thanks, your message is saved. Reference: ${escapeHtml(
        (result.id ?? "").slice(0, 8)
      )}</div>`;
      form.reset();
    } catch (err) {
      status.innerHTML = `<div class="form-status error">${escapeHtml(
        errorMessage(err, "Unable to send your message.")
      )} Please try again.</div>`;
    } finally {
      button.disabled = false;
      button.innerHTML = `Send your message ${svgArrow}`;
    }
  };
}

function bind(): void {
  bindThemeToggle();
  document.querySelector<HTMLButtonElement>(".hamb")?.addEventListener("click", (event) => {
    const nav = document.querySelector(".nav-links");
    const button = event.currentTarget;
    if (!nav || !(button instanceof HTMLButtonElement)) return;
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "×" : "☰";
  });
  window.onscroll = () => {
    document.querySelector(".header")?.classList.toggle("scrolled", scrollY > 8);
    document.querySelector(".back-top")?.classList.toggle("show", scrollY > 500);
  };
  document.querySelector(".back-top")?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  document.querySelectorAll<HTMLButtonElement>(".faq-q").forEach((button) =>
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (!item) return;
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
      const sign = button.querySelector("b");
      if (sign) sign.textContent = open ? "−" : "＋";
    })
  );
  document.querySelectorAll<HTMLButtonElement>("[data-lightbox]").forEach((button) =>
    button.addEventListener("click", () => {
      const lightbox = document.querySelector(".lightbox");
      const image = lightbox?.querySelector("img");
      if (!lightbox || !image || !button.dataset.lightbox) return;
      image.src = button.dataset.lightbox;
      lightbox.classList.add("open");
    })
  );
  const lightbox = document.querySelector(".lightbox");
  lightbox?.querySelector("button")?.addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.classList.remove("open");
  });
  bindQuote();
  bindContact();
}

function destinationFor(path: string): string | null {
  if (path === "/") return null;
  if (path === "/about") return ".intro-grid";
  if (path === "/services") return ".services-section .service-grid";
  if (path.startsWith("/services/")) return ".service-detail-grid";
  if (path === "/areas") return ".areas-section .section-head";
  if (path.startsWith("/areas/")) return ".service-detail-grid";
  if (path === "/gallery") return ".gallery-page-grid";
  if (path === "/blog") return ".blog-grid";
  if (path.startsWith("/blog/")) return "article.content-prose";
  if (path === "/quote") return "#quote-form";
  if (path === "/contact") return ".contact-grid";
  if (path === "/privacy" || path === "/terms") return "article.content-prose";
  return ".not-found";
}

function scrollToDestination(selector: string | null, behavior: ScrollBehavior = "instant"): void {
  if (!selector) {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  const target = document.querySelector(selector);
  if (!target) {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  const headerHeight = document.querySelector(".header")?.getBoundingClientRect().height || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
  event.preventDefault();
  const previousPath = location.pathname;
  history.pushState({}, "", url.pathname + url.search + url.hash);
  if (url.hash) {
    if (previousPath === url.pathname) {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    void transitionMount().then(() =>
      requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" }))
    );
    return;
  }
  void transitionMount().then(() => requestAnimationFrame(() => scrollToDestination(destinationFor(url.pathname))));
});

window.addEventListener("popstate", () => {
  void transitionMount().then(() =>
    requestAnimationFrame(() =>
      location.hash
        ? document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" })
        : scrollToDestination(destinationFor(location.pathname))
    )
  );
});

mount();
