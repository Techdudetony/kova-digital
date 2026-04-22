/* UTILITIES */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* NAV SCROLL STATE */
const initNavScroll = () => {
  const nav = qs(".nav");
  if (!nav) return; // Exit silently if nav is not on this page

  const SCROLL_THRESHOLD = 60; // px before nav gets filled background
  let scrollbarTimer = null;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > SCROLL_THRESHOLD);

    /* Show scrollbar while scrolling, hide after 1s of inactivity */
    document.body.classList.add("is-scrolling");
    clearTimeout(scrollbarTimer);
    scrollbarTimer = setTimeout(() => {
      document.body.classList.remove("is-scrolling");
    }, 1000);
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

/* CONTACT FORM VALIDATION */
const initContactForm = () => {
  const form = qs("#contact-form");
  if (!form) return;

  const successMsg = qs("#form-success");

  /* Show error message and mark field invalid */
  const setError = (input, msg) => {
    const error = qs(`#${input.id}-error`);
    input.classList.add("is-invalid");
    if (error) error.textContent = msg;
  };

  /* Clear error state from a field */
  const clearError = (input) => {
    const error = qs(`#${input.id}-error`);
    input.classList.remove("is-invalid");
    if (error) error.textContent = "";
  };

  /* Validate a single field */
  const validateField = (input) => {
    const value = input.value.trim();

    if (input.required && !value) {
      setError(input, "This field is required.");
      return false;
    }

    if (input.type === "email" && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setError(input, "Please enter a valid email address.");
        return false;
      }
    }

    clearError(input);
    return true;
  };

  /* Validate on blur for immediate inline feedback */
  qsa(".form-field__input", form).forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) clearError(input);
    });
  });

  /* Full validation on submit */
  form.addEventListener("submit", (e) => {
    e.preventDefault(); /* Prevent native submit — no backend yet */

    const fields = qsa(".form-field__input[required], select[required]", form);
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) return; /* Stop if any field failed */

    /* Simulate successful submission — replace with real endpoint later */
    form.style.display = "none";
    successMsg.hidden = false;
  });
};

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  initNavScroll();
  initMobileMenu();
  initActiveNav();
  initContactForm();
});
