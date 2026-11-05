import { business as biz } from "../config";
import { services } from "./content";
import { svgArrow } from "./html";
import { brand, servicePath } from "./components";

export function header(): string {
  return `<header class="header"><div class="container nav">${brand}<nav class="nav-links" id="nav-links"><a href="/">Home</a><a href="/about">About Us</a><div class="menu-group"><a class="nav-service-link" href="/services" aria-haspopup="true">Services</a><div class="dropdown">${services
    .slice(0, 7)
    .map((service) => `<a href="${servicePath(service)}">${service.title}</a>`)
    .join("")}<a href="/services">All services →</a></div></div><a href="/areas">Areas we serve</a><a href="/#process">Our process</a><a href="/blog">Journal</a><a href="/contact">Contact</a></nav><div class="nav-right"><button class="theme-toggle" type="button" aria-label="Switch to night mode" title="Switch to night mode"><svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.6 8.6 0 1 0 20.2 15.1Z"/></svg><svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg></button><a class="btn dark" href="/quote">Plan your move ${svgArrow}</a><button class="hamb" aria-label="Open navigation" aria-expanded="false">☰</button></div></div></header>`;
}

export function footer(): string {
  return `<footer class="footer"><div class="container"><div class="footer-grid"><div class="footer-about">${brand}<p>Moving should feel like a beginning. We make room for a more considered, more human way to get there.</p><a class="text-link" href="/about">Meet the team ${svgArrow}</a></div><div><h4>Explore</h4><div class="footer-links"><a href="/about">About us</a><a href="/services">All services</a><a href="/areas">Areas we serve</a><a href="/gallery">Gallery</a><a href="/blog">Journal</a></div></div><div><h4>Popular services</h4><div class="footer-links">${services
    .slice(0, 5)
    .map((service) => `<a href="${servicePath(service)}">${service.title}</a>`)
    .join("")}</div></div><div><h4>Get in touch</h4><div class="footer-contact"><a href="tel:${biz.phoneLink}">${biz.phone}</a>${biz.email.includes('[')?'':`<span>${biz.email}</span>`}<span>${biz.address}</span><a href="/quote">Request a moving plan ${svgArrow}</a></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${biz.name}. All rights reserved.</span><span><a href="/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/terms">Terms</a></span></div></div></footer><div class="floating-contact"><a class="floating-quote" href="/quote">Get a free quote ${svgArrow}</a></div><button class="back-top" aria-label="Back to top">↑</button><div class="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image"><button aria-label="Close image">×</button><img alt=""></div>`;
}
