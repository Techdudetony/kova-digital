/* UTILITIES */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* NAV SCROLL STATE */
const initNavScroll = () => {
  const nav = qs(".nav");
  if (!nav) return; // Exit silently if nav is not on this page

  const SCROLL_THRESHOLD = 60; // px before nav gets filled background

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);
  };

  /* Throttle scroll handler via requestAnimationFrame for performance */
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    },
    { passive: true },
  );

  onScroll(); // Run once on load in case page is already scrolled
};

/* MOBILE MENU TOGGLE */
const initMobileMenu = () => {
  const hamburger = qs(".nav__hamburger");
  const mobileNav = qs(".nav__mobile");
  if (!hamburger || !mobileNav) return;

  const toggle = (force) => {
    const isOpen =
      typeof force === "boolean"
        ? force
        : !hamburger.classList.contains("is-open");

    hamburger.classList.toggle("is-open", isOpen);
    mobileNav.classList.toggle("is-open", isOpen);

    /* Prevent body scroll when menu is open */
    document.body.style.overflow = isOpen ? "hidden" : "";

    /* Accessibility - announce state to screen readers */
    hamburger.setAttribute("aria-expanded", String(isOpen));
  };

  hamburger.addEventListener("click", () => toggle());

  /* Close menu when any mobile link is clicked */
  qsa(".nav__mobile-link, .nav__mobile-cta", mobileNav).forEach((link) =>
    link.addEventListener("click", () => toggle(false)),
  );

  /* Close menu on ESC key */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
};

/* ACTIVE NAV LINK */
const initActiveNav = () => {
  const links = qsa(".nav__link, .nav__mobile-link");
  if (!links.length) return;

  /* Match current page path to nav link href */
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  links.forEach((link) => {
    const linkPath =
      new URL(link.href, window.location.origin).pathname.replace(/\/$/, "") ||
      "/";

    if (linkPath === currentPath) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
};

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  initNavScroll();
  initMobileMenu();
  initActiveNav();
});
