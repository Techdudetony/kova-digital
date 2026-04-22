/* ================================================================
   interactions.js
   Central JS for all UI-Lab component interactions.
   Sections mirror the 11 component buckets:
     1. Buttons        6. Animations
     2. Navbars        7. Loaders
     3. Footers        8. Hero Sections
     4. Forms          9. Modals
     5. Cards         10. Transitions
                      11. Code Modal (global — all pages)
   ================================================================ */

/* ── 1. BUTTONS ─────────────────────────────────────────────────
   Ripple effect — triggered on any element with [data-ripple].
   Spawns a .ripple <span>, positions it at the click point,
   then removes it once the CSS animation ends.
   ---------------------------------------------------------------- */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-ripple]"); // walk up to the ripple target
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";

  const size = Math.max(rect.width, rect.height); // circle large enough to cover the button
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`; // center on click X
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`; // center on click Y

  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove()); // clean up after animation
});

/* ── 2. NAVBARS ─────────────────────────────────────────────────
   2a. Expandable Icon Menu — one active item at a time per menu.
   2b. Pill Navbar — sliding indicator follows active item.
   2c. Mobile Hamburger — toggles slide-down menu + X animation.
   2d. Tab Bar — active tab indicator with lift animation.
   2e. Mega Menu — toggle dropdown panels, close on outside click.
   2f. Sidebar Nav — collapse sidebar width, toggle group items.
   2g. Weapon Wheel — radial segment selection by mouse angle.
   2h. Radial Action Menu — 6 items expand from centre on click.
   ---------------------------------------------------------------- */

/* ── 2a. Expandable Icon Menu ──────────────────────── */
/* One item can be active at a time within its menu. */

document.querySelectorAll("[data-nav-menu]").forEach((menu) => {
  const links = menu.querySelectorAll(".nav-menu__link");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((item) => item.classList.remove("is-active")); // clear all
      link.classList.add("is-active"); // set clicked
    });
  });
});

/* ── 2b. Pill Navbar ───────────────────────────────── */
/* Moves the sliding indicator under the active item by
   setting --indicator-left and --indicator-width CSS vars. */

document.querySelectorAll("[data-pill-nav]").forEach((nav) => {
  const items = nav.querySelectorAll(".nav-pill-bar__item");
  const indicator = nav.querySelector(".nav-pill-bar__indicator");
  if (!indicator) return;

  const moveIndicator = (item) => {
    /* offsetLeft is relative to the nav container */
    indicator.style.setProperty("--indicator-left", `${item.offsetLeft}px`);
    indicator.style.setProperty("--indicator-width", `${item.offsetWidth}px`);
  };

  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("is-active"));
      item.classList.add("is-active");
      moveIndicator(item);
    });
  });

  /* Init indicator position on the default active item */
  const active = nav.querySelector(".is-active") ?? items[0];
  if (active) requestAnimationFrame(() => moveIndicator(active));
});

/* ── 2c. Mobile Hamburger ──────────────────────────── */
/* Toggles .is-open on the nav, [hidden] on the menu,
   and aria-expanded on the toggle button. */

document.querySelectorAll("[data-hamburger]").forEach((nav) => {
  const toggle = nav.querySelector(".nav-hamburger__toggle");
  const menu = nav.querySelector(".nav-hamburger__menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen);
    menu.hidden = !isOpen;
  });
});

/* ── 2d. Tab Bar ───────────────────────────────────── */
/* Moves .is-active to the clicked tab. */

document.querySelectorAll("[data-tab-bar]").forEach((bar) => {
  const items = bar.querySelectorAll(".nav-tab-bar__item");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("is-active"));
      item.classList.add("is-active");
    });
  });
});

/* ── 2e. Mega Menu ─────────────────────────────────── */
/* Toggles [hidden] + aria-expanded on each trigger/panel pair.
   Closes open panels when clicking outside the nav. */

document.querySelectorAll("[data-mega-nav]").forEach((nav) => {
  const triggers = nav.querySelectorAll(".nav-mega__trigger[aria-expanded]");

  const closeAll = () => {
    triggers.forEach((t) => {
      t.setAttribute("aria-expanded", "false");
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = true;
    });
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panelId = trigger.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      closeAll(); // close others first

      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  /* Close when clicking outside */
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeAll();
  });
});

/* ── 2f. Sidebar Nav ───────────────────────────────── */
/* Toggles .is-collapsed on the sidebar for width animation.
   Group toggles collapse/expand their item lists. */

document.querySelectorAll("[data-sidebar]").forEach((sidebar) => {
  /* Sidebar-wide collapse toggle */
  const collapseBtn = sidebar.querySelector("[data-sidebar-toggle]");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      const collapsed = sidebar.classList.toggle("is-collapsed");
      collapseBtn.setAttribute("aria-expanded", !collapsed);
    });
  }

  /* Per-group collapse toggles */
  sidebar.querySelectorAll("[data-group-toggle]").forEach((toggle) => {
    const items = toggle.nextElementSibling; // .nav-sidebar__group-items
    if (!items) return;

    /* Set initial max-height so CSS transition works */
    items.style.maxHeight = `${items.scrollHeight}px`;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isOpen);
      items.classList.toggle("is-closed", isOpen);

      if (!isOpen) {
        items.style.maxHeight = `${items.scrollHeight}px`; // expand
      } else {
        items.style.maxHeight = "0"; // collapse
      }
    });
  });
});

/* ── 2g. Weapon Wheel ──────────────────────────────── */
/* Positions segments in a true circle via --tx/--ty CSS vars.
   Right-click opens the ring, mouseup selects and closes.
   Click fallback allows demo interaction without right-click. */

const WHEEL_SEGMENTS = 8;
const WHEEL_RADIUS = 100; // px — distance from center to segment midpoint
const WHEEL_DEAD_ZONE = 35; // px — center radius that ignores angle

document.querySelectorAll("[data-weapon-wheel]").forEach((wheel) => {
  const segments = Array.from(wheel.querySelectorAll(".weapon-wheel__segment"));
  const label = wheel.querySelector("[data-wheel-label]");
  const ring = wheel.querySelector(".weapon-wheel__ring");
  if (!segments.length || !ring) return;

  /* Position each segment around the circle using trigonometry */
  segments.forEach((seg, i) => {
    const angle = (i / WHEEL_SEGMENTS) * 2 * Math.PI - Math.PI / 2; // start at top
    const tx = Math.round(Math.cos(angle) * WHEEL_RADIUS);
    const ty = Math.round(Math.sin(angle) * WHEEL_RADIUS);
    seg.style.setProperty("--tx", `${tx}px`);
    seg.style.setProperty("--ty", `${ty}px`);
  });

  let activeSlot = -1;
  let isOpen = false;

  const openWheel = () => {
    isOpen = true;
    ring.style.opacity = "1";
    ring.style.pointerEvents = "all";
  };

  const closeWheel = () => {
    isOpen = false;
    ring.style.opacity = "0";
    ring.style.pointerEvents = "none";
  };

  /* Determine which slot the cursor angle maps to */
  const getSlot = (mx, my) => {
    const rect = wheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < WHEEL_DEAD_ZONE) return -1;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return Math.floor(angle / (360 / WHEEL_SEGMENTS)) % WHEEL_SEGMENTS;
  };

  const highlightSlot = (slot) => {
    if (slot === activeSlot) return;
    activeSlot = slot;
    segments.forEach((s) => s.classList.remove("is-selected"));
    if (slot >= 0 && segments[slot]) {
      segments[slot].classList.add("is-selected");
      if (label) label.textContent = segments[slot].dataset.label ?? "";
    } else {
      if (label) label.textContent = "";
    }
  };

  const selectCurrent = () => {
    if (activeSlot >= 0 && segments[activeSlot]) {
      if (label) label.textContent = `✓ ${segments[activeSlot].dataset.label}`;
    }
  };

  /* Right-click opens the wheel */
  wheel.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openWheel();
  });

  /* Mouse move highlights nearest segment while open */
  wheel.addEventListener("mousemove", (e) => {
    if (!isOpen) return;
    highlightSlot(getSlot(e.clientX, e.clientY));
  });

  /* Right-click release selects and closes */
  window.addEventListener("mouseup", (e) => {
    if (!isOpen) return;
    if (e.button === 2) {
      selectCurrent();
      closeWheel();
    }
  });

  /* Left-click on individual segments for demo interaction */
  segments.forEach((seg, i) => {
    seg.addEventListener("click", (e) => {
      e.stopPropagation();
      highlightSlot(i);
      selectCurrent();
    });
  });

  /* Left-click center toggles wheel open/closed for demo */
  const center = wheel.querySelector(".weapon-wheel__center");
  if (center) {
    center.addEventListener("click", () => {
      isOpen ? closeWheel() : openWheel();
    });
  }
});

/* ── 2h. Radial Action Menu ────────────────────────── */
/* Calculates --tx/--ty for each item from data-angle (degrees)
   and a fixed radius. Stagger delay added per item index.
   Toggle button controls open/close + aria-expanded. */

const RADIAL_RADIUS = 96; // px — distance from centre to item midpoint
const RADIAL_STAGGER = 30; // ms — delay between each item appearing

document.querySelectorAll("[data-radial-menu]").forEach((menu) => {
  const toggle = menu.querySelector(".radial-menu__toggle");
  const items = Array.from(menu.querySelectorAll(".radial-menu__item"));
  const label = menu.querySelector("[data-radial-label]");
  if (!toggle || !items.length) return;

  /* Pre-calculate --tx/--ty for every item from its data-angle */
  items.forEach((item, i) => {
    const angleDeg = parseFloat(item.dataset.angle ?? 0);
    const angleRad = (angleDeg * Math.PI) / 180;
    const tx = Math.round(Math.cos(angleRad) * RADIAL_RADIUS);
    const ty = Math.round(Math.sin(angleRad) * RADIAL_RADIUS);
    item.style.setProperty("--tx", `${tx}px`);
    item.style.setProperty("--ty", `${ty}px`);
    item.style.setProperty("--delay", `${i * RADIAL_STAGGER}ms`);
  });

  let isOpen = false;

  const openMenu = () => {
    isOpen = true;
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    isOpen = false;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (label) label.textContent = "";
  };

  toggle.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));

  /* Show item label on hover */
  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (label) label.textContent = item.dataset.label ?? "";
    });
    item.addEventListener("mouseleave", () => {
      if (label) label.textContent = "";
    });
    /* Close menu after selecting an action */
    item.addEventListener("click", () => {
      if (label) label.textContent = `✓ ${item.dataset.label}`;
      setTimeout(closeMenu, 600);
    });
  });

  /* Close on outside click */
  document.addEventListener("click", (e) => {
    if (isOpen && !menu.contains(e.target)) closeMenu();
  });
});

/* ── 3. FOOTERS ─────────────────────────────────────────────────
   Gooey particle generator — fills [data-particle-container]
   inside each [data-gooey-footer] with randomized blobs.
   Values are passed as CSS custom properties so the animation
   lives entirely in CSS.
   ---------------------------------------------------------------- */

const PARTICLE_COUNT = 100; // total blobs per footer instance

document.querySelectorAll("[data-gooey-footer]").forEach((footer) => {
  const container = footer.querySelector("[data-particle-container]");
  if (!container) return;
  if (container.dataset.ready === "true") return; // skip if already initialized

  const fragment = document.createDocumentFragment(); // batch DOM insertion

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement("span");
    particle.className = "gooey-footer__particle";

    // randomized per-particle values passed to CSS
    particle.style.setProperty("--dim", `${3 + Math.random() * 6}rem`); // size: 3–9rem
    particle.style.setProperty("--uplift", `${10 + Math.random() * 15}rem`); // travel: 10–25rem
    particle.style.setProperty("--pos-x", `${Math.random() * 100}%`); // horizontal: 0–100%
    particle.style.setProperty("--dur", `${3 + Math.random() * 3}s`); // duration: 3–6s
    particle.style.setProperty("--delay", `${-1 * (Math.random() * 10)}s`); // negative delay = already in motion

    fragment.appendChild(particle);
  }

  container.appendChild(fragment);
  container.dataset.ready = "true"; // mark initialized to prevent duplicate runs
});

/* ── 4. FORMS ───────────────────────────────────────────────────
   4a. Neon Search Bar — animates border spin speed based on
       typing, submit, and blur interactions.
   4b. OTP / PIN Input — auto-advances focus between digit boxes,
       handles backspace, and marks filled boxes.
   4c. Password Strength — scores input and sets data-level on
       the root element for CSS-driven bar coloring.
   4d. Credit Card — formats number, syncs preview text, flips
       card on CVV focus.
   4e. Login / Signup — toggles .is-signup on the wrapper to
       slide the circle and swap visible form.
   ---------------------------------------------------------------- */

/* ── 4a. Neon Search Bar ───────────────────────────── */

const SEARCH_DURATION_DEFAULT = 4000; // ms — idle spin speed
const SEARCH_DURATION_TYPING = 60000; // ms — near-stopped while typing
const SEARCH_DURATION_ACTIVE = 2500; // ms — fast spin on submit
const SEARCH_ACTIVE_HOLD = 1500; // ms — how long the fast spin holds
const SEARCH_LERP_FACTOR = 0.015; // interpolation speed (0–1, lower = smoother)

document.querySelectorAll("[data-search-neon]").forEach((component) => {
  const inputWrapper = component.querySelector(".search-neon__frame");
  const searchField = component.querySelector(".search-neon__field");
  const searchButton = component.querySelector(".search-neon__button");
  if (!inputWrapper || !searchField || !searchButton) return;

  let currentDuration = SEARCH_DURATION_DEFAULT;
  let targetDuration = SEARCH_DURATION_DEFAULT;
  let animationFrame = null;
  let isTyping = false;
  let isSearching = false;

  /* Smoothly lerp currentDuration toward targetDuration each frame */
  const smoothTransition = () => {
    const diff = targetDuration - currentDuration;

    if (Math.abs(diff) > 10) {
      currentDuration += diff * SEARCH_LERP_FACTOR;
      inputWrapper.style.setProperty("--spin-duration", `${currentDuration}ms`);
      animationFrame = requestAnimationFrame(smoothTransition);
    } else {
      currentDuration = targetDuration;
      inputWrapper.style.setProperty("--spin-duration", `${currentDuration}ms`);
      animationFrame = null;
    }
  };

  /* Cancel any running animation frame before starting a new one */
  const cancelTransition = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  };

  /* Slow spin while user is typing */
  searchField.addEventListener("input", () => {
    if (!isTyping && !isSearching) {
      isTyping = true;
      targetDuration = SEARCH_DURATION_TYPING;
      if (!animationFrame) smoothTransition();
    }
  });

  /* Reset to default speed on focus if field is empty */
  searchField.addEventListener("focus", () => {
    if (!isTyping && !searchField.value) {
      targetDuration = SEARCH_DURATION_DEFAULT;
      currentDuration = SEARCH_DURATION_DEFAULT;
      cancelTransition();
      inputWrapper.style.setProperty("--spin-duration", `${currentDuration}ms`);
    }
  });

  /* Return to default speed when leaving the field */
  searchField.addEventListener("blur", () => {
    if (!isSearching) {
      isTyping = false;
      targetDuration = SEARCH_DURATION_DEFAULT;
      cancelTransition();
      smoothTransition();
    }
  });

  /* Fast spin on submit, then return to default after hold period */
  searchButton.addEventListener("click", () => {
    isSearching = true;
    targetDuration = SEARCH_DURATION_ACTIVE;
    cancelTransition();
    smoothTransition();

    setTimeout(() => {
      isSearching = false;
      isTyping = false;
      targetDuration = SEARCH_DURATION_DEFAULT;
      cancelTransition();
      smoothTransition();
    }, SEARCH_ACTIVE_HOLD);
  });
});

/* ── 4b. OTP / PIN Input ───────────────────────────── */
/* Auto-advances focus to the next box on input, moves back on
   backspace, and toggles .is-filled for CSS styling. */

document.querySelectorAll("[data-otp]").forEach((group) => {
  const boxes = Array.from(group.querySelectorAll(".otp-group__box"));

  boxes.forEach((box, i) => {
    box.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\D/g, ""); // digits only
      box.value = val.slice(-1); // keep last digit
      box.classList.toggle("is-filled", box.value !== "");
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus(); // advance
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && i > 0) {
        boxes[i - 1].focus(); // move back on backspace when empty
        boxes[i - 1].value = "";
        boxes[i - 1].classList.remove("is-filled");
      }
    });

    /* Select existing value on re-focus so it's easy to replace */
    box.addEventListener("focus", () => box.select());
  });
});

/* ── 4c. Password Strength ─────────────────────────── */
/* Scores the password and sets data-level (0–4) on the root
   so CSS can color the meter bars without any inline styles. */

const PW_LEVELS = [
  { test: () => true, label: "Too short", level: 0 },
  { test: (v) => v.length >= 6, label: "Weak", level: 1 },
  { test: (v) => v.length >= 8 && /[A-Z]/.test(v), label: "Fair", level: 2 },
  {
    test: (v) => v.length >= 10 && /[^a-zA-Z0-9]/.test(v),
    label: "Strong",
    level: 3,
  },
  {
    test: (v) =>
      v.length >= 12 &&
      /[A-Z]/.test(v) &&
      /[0-9]/.test(v) &&
      /[^a-zA-Z0-9]/.test(v),
    label: "Very Strong",
    level: 4,
  },
];

document.querySelectorAll("[data-password-strength]").forEach((root) => {
  const input = root.querySelector("input[type='password']");
  const label = root.querySelector("[data-strength-label]");
  if (!input || !label) return;

  input.addEventListener("input", () => {
    const val = input.value;
    if (!val) {
      root.removeAttribute("data-level");
      label.textContent = "Enter a password";
      return;
    }
    /* Find the highest passing level */
    const result =
      [...PW_LEVELS].reverse().find((l) => l.test(val)) ?? PW_LEVELS[0];
    root.dataset.level = result.level;
    label.textContent = result.label;
  });
});

/* ── 4d. Credit Card ───────────────────────────────── */
/* Formats card number with spaces, syncs all fields to the
   card preview, and flips the card when CVV is focused. */

document.querySelectorAll("[data-credit-card]").forEach((root) => {
  const preview = root.querySelector(".cc-preview");
  const numInput = root.querySelector('[data-cc-input="number"]');
  const nameInput = root.querySelector('[data-cc-input="name"]');
  const expInput = root.querySelector('[data-cc-input="expiry"]');
  const cvvInput = root.querySelector('[data-cc-input="cvv"]');
  const numDisplay = root.querySelector("[data-cc-number]");
  const nameDisplay = root.querySelector("[data-cc-name]");
  const expDisplay = root.querySelector("[data-cc-expiry]");
  const cvvDisplay = root.querySelector("[data-cc-cvv]");
  if (!preview || !numInput) return;

  /* Format 16 digits as groups of 4 separated by spaces */
  numInput.addEventListener("input", () => {
    const digits = numInput.value.replace(/\D/g, "").slice(0, 16);
    numInput.value = digits.replace(/(.{4})/g, "$1 ").trim();
    const padded = digits.padEnd(16, "•");
    numDisplay.textContent = padded.replace(/(.{4})/g, "$1 ").trim();
  });

  nameInput?.addEventListener("input", () => {
    nameDisplay.textContent = nameInput.value.toUpperCase() || "FULL NAME";
  });

  /* Format expiry as MM / YY — extracts up to 4 digits then inserts separator */
  expInput?.addEventListener("input", () => {
    const digits = expInput.value.replace(/\D/g, "").slice(0, 4);
    expInput.value =
      digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
    expDisplay.textContent = expInput.value || "MM / YY";
  });

  /* CVV — 3 digits for Visa/MC/Discover, 4 for Amex */
  cvvInput?.addEventListener("input", () => {
    const digits = cvvInput.value.replace(/\D/g, "").slice(0, 4);
    cvvInput.value = digits;
    cvvDisplay.textContent = digits.padEnd(digits.length > 3 ? 4 : 3, "•");
  });

  /* Flip card to show CVV on back when CVV field is focused */
  cvvInput?.addEventListener("focus", () =>
    preview.classList.add("is-flipped"),
  );
  cvvInput?.addEventListener("blur", () =>
    preview.classList.remove("is-flipped"),
  );
});

/* ── 4e. Login / Signup ────────────────────────────── */
/* Toggles .is-signup on the wrapper — CSS handles the circle
   slide and form opacity swap via the class change. */

document.querySelectorAll("[data-login-wrapper]").forEach((wrapper) => {
  wrapper.querySelectorAll("[data-login-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.loginToggle;
      wrapper.classList.toggle("is-signup", target === "signup");
    });
  });
});

/* ── 5. CARDS ───────────────────────────────────────────────────
   5a. Scroll Deck Reveal — stacked cards animate out of a deck
       driven by an inner scroll area. Mouse adds 3D tilt.
   5b. Spotlight Card — radial highlight tracks the cursor via
       --x / --y CSS custom properties on each card.
   5c. Tilt Card — smooth 3D perspective tilt on mousemove,
       resets to flat on mouseleave.
   ---------------------------------------------------------------- */

/* ── 5a. Scroll Deck Reveal ────────────────────────── */

/* Fallback variation for cards beyond the preset list */
const DECK_VARIATION_FALLBACK = { x: 0, y: 0, rotate: 0 };

/* Per-card spread positions after they leave the deck */
const DECK_VARIATIONS = [
  { x: -8, y: 5, rotate: -2 },
  { x: 12, y: -3, rotate: 3 },
  { x: -5, y: 8, rotate: 1 },
  { x: 10, y: -5, rotate: -1.5 },
  { x: -10, y: 3, rotate: 2.5 },
];

const DECK_SPACING = 15; // px — z-depth between stacked cards
const DECK_BASE_OFFSET = -340; // px — final X position after card leaves deck
const DECK_TILT_RANGE = 15; // deg — max mouse tilt angle

document.querySelectorAll("[data-scroll-deck]").forEach((deckRoot) => {
  const scrollArea = deckRoot.closest(".scroll-deck-demo");
  const container = deckRoot.querySelector(".scroll-deck__container");
  const cards = Array.from(deckRoot.querySelectorAll(".scroll-deck__card"));
  const track = deckRoot.querySelector(".scroll-deck__track");
  const viewport = deckRoot.querySelector(".scroll-deck__viewport");
  if (!scrollArea || !container || !cards.length || !track || !viewport) return;

  const totalCards = cards.length;

  /* Build the initial stacked transform for a card at a given index */
  const stackedTransform = (index) => `
    translateX(${index * 2}px)
    translateY(${index * -2}px)
    translateZ(${index * DECK_SPACING}px)
    rotateY(180deg)
  `;

  /* Place all cards in their starting stacked positions */
  const positionInDeck = () => {
    cards.forEach((card, i) => {
      card.style.transform = stackedTransform(i);
      card.style.zIndex = i + 1;
    });
  };

  /* Normalize scroll progress (0–1) against the inner track height */
  const getLocalProgress = () => {
    const totalScrollable = track.offsetHeight - viewport.clientHeight;
    if (totalScrollable <= 0) return 0;
    return Math.min(scrollArea.scrollTop / totalScrollable, 1);
  };

  /* Drive card transforms from a 0–1 scroll progress value */
  const animateCards = (scrollProgress) => {
    const cardsPerSection = 1 / (totalCards + 1); // fraction of scroll each card occupies

    cards.forEach((card, index) => {
      const reversedIndex = totalCards - 1 - index; // bottom card animates first
      const cardStart = reversedIndex * cardsPerSection;
      const cardProgress = Math.max(
        0,
        Math.min(1, (scrollProgress - cardStart) / cardsPerSection),
      );
      const variation = DECK_VARIATIONS[index] ?? DECK_VARIATION_FALLBACK;

      if (cardProgress === 0) {
        /* Card still in deck — use shared stacked transform */
        card.style.transform = stackedTransform(index);
        card.style.zIndex = index + 1;
      } else if (cardProgress < 1) {
        /* Card mid-flight — arc upward then land in spread position */
        const cardsRemaining = totalCards - reversedIndex;
        const minElevation = cardsRemaining * DECK_SPACING + 100;
        const arc = Math.sin(cardProgress * Math.PI); // 0 → 1 → 0 arc

        card.style.transform = `
          translateX(${cardProgress * (DECK_BASE_OFFSET + variation.x)}px)
          translateY(${cardProgress * variation.y - 100 * arc}px)
          translateZ(${minElevation + 200 * arc + cardProgress * index * 3}px)
          rotateY(${180 - cardProgress * 180}deg)
          rotateZ(${cardProgress * variation.rotate}deg)
          scale(${1 + 0.15 * arc})
        `;
        card.style.zIndex = 100; // float above the rest during flight
      } else {
        /* Card fully landed — settle into its spread position */
        card.style.transform = `
          translateX(${DECK_BASE_OFFSET + variation.x}px)
          translateY(${variation.y}px)
          translateZ(${reversedIndex * 3}px)
          rotateY(0deg)
          rotateZ(${variation.rotate}deg)
        `;
        card.style.zIndex = 10 + reversedIndex;
      }
    });
  };

  /* 3D mouse tilt on the card container */
  const handleMouseMove = (e) => {
    const rect = deckRoot.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * DECK_TILT_RANGE;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * DECK_TILT_RANGE;
    container.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  const handleMouseLeave = () => {
    container.style.transform = "rotateY(0deg) rotateX(0deg)"; // reset tilt on exit
  };

  /* Init */
  positionInDeck();
  animateCards(0);

  scrollArea.addEventListener("scroll", () =>
    requestAnimationFrame(() => animateCards(getLocalProgress())),
  );
  deckRoot.addEventListener("mousemove", handleMouseMove, { passive: true });
  deckRoot.addEventListener("mouseleave", handleMouseLeave);
});

/* ── 5b. Spotlight Card ────────────────────────────── */
/* Tracks cursor position and exposes --x / --y as % values so
   CSS can paint a radial-gradient highlight at the pointer. */

document.querySelectorAll("[data-spotlight]").forEach((card) => {
  card.addEventListener(
    "mousemove",
    (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100; // 0–100%
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--x", `${x}%`);
      card.style.setProperty("--y", `${y}%`);
    },
    { passive: true },
  );
});

/* ── 5c. Tilt Card ─────────────────────────────────── */
/* Maps cursor offset to rotateX / rotateY for a 3D tilt effect.
   Smoothly resets on mouseleave via CSS transition. */

const TILT_MAX = 15; // deg — maximum tilt angle in any direction

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener(
    "mousemove",
    (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      card.style.transform = `perspective(800px) rotateY(${x * TILT_MAX}deg) rotateX(${-y * TILT_MAX}deg) scale(1.02)`;
    },
    { passive: true },
  );

  card.addEventListener("mouseleave", () => {
    card.style.transform = ""; // CSS transition handles the smooth reset
  });
});

/* ── 6. ANIMATIONS ──────────────────────────────────────────────
   6a. Hover Grid Nudge — translates a centered title away from
       the cursor using the mouse position within a 3×3 grid.
   6b. Infinity Heartbeat — WebGL shader rendering an animated
       glowing heart or infinity shape on a <canvas>.
   6c. Clip-Path Typewriter — types a CSS clip-path value
       character-by-character while morphing a preview shape.
   ---------------------------------------------------------------- */

/* ── 6a. Hover Grid Nudge ──────────────────────────── */

const NUDGE_STRENGTH = 60; // px — max title travel distance from center

const nudgeCard = document.getElementById("nudge");
const nudgeTitle = document.getElementById("nudge-title");

if (nudgeCard && nudgeTitle) {
  nudgeCard.addEventListener("mousemove", (e) => {
    const rect = nudgeCard.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    nudgeTitle.style.transform = `translate(
      calc(-50% + ${-mx * NUDGE_STRENGTH}px),
      calc(-50% + ${-my * NUDGE_STRENGTH}px)
    )`;
  });

  nudgeCard.addEventListener("mouseleave", () => {
    nudgeTitle.style.transform = "translate(-50%, -50%)"; // reset to center
  });
}

/* ── 6b. Infinity Heartbeat ────────────────────────── */

/* GLSL vertex shader — passes clip-space positions straight through */
const HEARTBEAT_VERT = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

/* GLSL fragment shader — SDF-based glow for heart and infinity shapes */
const HEARTBEAT_FRAG = `
  precision highp float;

  uniform float width;
  uniform float height;
  uniform float time;
  uniform int   shapeType;

  #define POINTS_COUNT 8

  vec2 shapePoints[POINTS_COUNT];

  const float animationSpeed = -0.5;
  const float segmentLength  = 0.25;
  float glowIntensity = 0.9;
  float glowRadius    = 0.015;

  float calculateBezierDistance(vec2 position, vec2 pointA, vec2 pointB, vec2 pointC) {
    vec2 vectorA = pointB - pointA;
    vec2 vectorB = pointA - 2.0 * pointB + pointC;
    vec2 vectorC = vectorA * 2.0;
    vec2 vectorD = pointA - position;

    float factorK = 1.0 / dot(vectorB, vectorB);
    float kx = factorK * dot(vectorA, vectorB);
    float ky = factorK * (2.0 * dot(vectorA, vectorA) + dot(vectorD, vectorB)) / 3.0;
    float kz = factorK * dot(vectorD, vectorA);

    float result = 0.0;
    float valueP = ky - kx * kx;
    float p3     = valueP * valueP * valueP;
    float valueQ = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    float h      = valueQ * valueQ + 4.0 * p3;

    if (h >= 0.0) {
      h = sqrt(h);
      vec2 x  = (vec2(h, -h) - valueQ) / 2.0;
      vec2 uv = sign(x) * pow(abs(x), vec2(1.0 / 3.0));

      float parameterT = clamp(uv.x + uv.y - kx, 0.0, 1.0);
      vec2  distVec    = vectorD + (vectorC + vectorB * parameterT) * parameterT;
      result = length(distVec);
    } else {
      float rootZ   = sqrt(-valueP);
      float valueV  = acos(valueQ / (valueP * rootZ * 2.0)) / 3.0;
      float valueM  = cos(valueV);
      float valueN  = sin(valueV) * 1.732050808;
      vec3  paramsT = clamp(
        vec3(valueM + valueM, -valueN - valueM, valueN - valueM) * rootZ - kx,
        0.0, 1.0
      );

      vec2  dv   = vectorD + (vectorC + vectorB * paramsT.x) * paramsT.x;
      float dist = dot(dv, dv);
      result = dist;

      dv = vectorD + (vectorC + vectorB * paramsT.y) * paramsT.y;
      result = min(result, dot(dv, dv));

      dv = vectorD + (vectorC + vectorB * paramsT.z) * paramsT.z;
      result = min(result, dot(dv, dv));
      result = sqrt(result);
    }

    return result;
  }

  vec2 getHeartPosition(float t) {
    float s = sin(t);
    float c = cos(t);
    return vec2(
      16.0 * s * s * s,
      -(13.0 * c - 5.0 * cos(2.0*t) - 2.0 * cos(3.0*t) - cos(4.0*t))
    );
  }

  vec2 getInfinityPosition(float t) {
    float scale = 20.0;
    float cosT  = cos(t);
    float sinT  = sin(t);
    float denom = 1.0 + sinT * sinT;
    return vec2(scale * cosT / denom, scale * cosT * sinT / denom);
  }

  vec2 getShapePosition(float t) {
    return shapeType == 0 ? getHeartPosition(t) : getInfinityPosition(t);
  }

  float calculateGlow(float dist, float radius, float intensity) {
    return pow(radius / dist, intensity);
  }

  float getShapeSegment(float currentTime, vec2 pixelPos, float offset, float scale) {
    for (int i = 0; i < POINTS_COUNT; i++) {
      float t = offset + float(i) * segmentLength + fract(animationSpeed * currentTime) * 6.28;
      shapePoints[i] = getShapePosition(t);
    }

    vec2  midPoint = (shapePoints[0] + shapePoints[1]) / 2.0;
    vec2  prevMid;
    float minDist  = 10000.0;

    for (int i = 0; i < POINTS_COUNT - 1; i++) {
      prevMid  = midPoint;
      midPoint = (shapePoints[i] + shapePoints[i + 1]) / 2.0;
      float d  = calculateBezierDistance(pixelPos, scale * prevMid, scale * shapePoints[i], scale * midPoint);
      minDist  = min(minDist, d);
    }

    return max(0.0, minDist);
  }

  void main() {
    vec2  res    = vec2(width, height);
    vec2  uv     = gl_FragCoord.xy / res;
    float aspect = res.x / res.y;
    vec2  relPos = vec2(0.5) - uv;
    relPos.y    /= aspect;

    if (shapeType == 0) relPos.y += 0.02;   // nudge heart slightly upward

    float scale = 0.000015 * height;

    float dist1 = getShapeSegment(time, relPos, 0.0, scale);
    float glow1 = calculateGlow(dist1, glowRadius, glowIntensity);
    vec3  color = vec3(0.0);
    color += 10.0 * vec3(smoothstep(0.003, 0.001, dist1));
    color += glow1 * vec3(0.94, 0.14, 0.4);   // pink/red trace

    float dist2 = getShapeSegment(time, relPos, 3.4, scale);
    float glow2 = calculateGlow(dist2, glowRadius, glowIntensity);
    color += 10.0 * vec3(smoothstep(0.003, 0.001, dist2));
    color += glow2 * vec3(0.2, 0.6, 1.0);     // blue trace

    color        = 1.0 - exp(-color);   // tone-map to [0,1]
    gl_FragColor = vec4(color, 1.0);
  }
`;

function initHeartbeatDemo(root) {
  const canvas = root.querySelector(".heartbeat-demo__canvas");
  const buttons = root.querySelectorAll(".heartbeat-demo__button");
  if (!canvas) return;

  const gl = canvas.getContext("webgl");

  if (!gl) {
    root.querySelector(".heartbeat-demo__stage").innerHTML = `
      <div style="height:100%;display:grid;place-items:center;padding:16px;
        text-align:center;color:var(--color-muted);font-size:var(--text-sm);">
        WebGL is not available in this browser.
      </div>
    `;
    return;
  }

  /* Compile a single shader — throws on error */
  const compileShader = (src, type) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  /* Resolve a required attribute location — throws if missing */
  const getAttr = (prog, name) => {
    const loc = gl.getAttribLocation(prog, name);
    if (loc === -1) throw new Error(`Missing attribute: ${name}`);
    return loc;
  };

  /* Resolve a required uniform location — throws if missing */
  const getUniform = (prog, name) => {
    const loc = gl.getUniformLocation(prog, name);
    if (loc === null) throw new Error(`Missing uniform: ${name}`);
    return loc;
  };

  /* Build and link the shader program */
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(HEARTBEAT_VERT, gl.VERTEX_SHADER));
  gl.attachShader(prog, compileShader(HEARTBEAT_FRAG, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  /* Full-screen quad covering clip space (-1 to 1) */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
    gl.STATIC_DRAW,
  );

  const posLoc = getAttr(prog, "position");
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 2 * 4, 0);

  const timeLoc = getUniform(prog, "time");
  const widthLoc = getUniform(prog, "width");
  const heightLoc = getUniform(prog, "height");
  const shapeTypeLoc = getUniform(prog, "shapeType");

  gl.uniform1i(shapeTypeLoc, 0); // default to heart shape

  /* Match canvas pixel resolution to its CSS display size */
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(widthLoc, canvas.width);
    gl.uniform1f(heightLoc, canvas.height);
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  /* Shape toggle buttons swap the shapeType uniform */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      gl.uniform1i(shapeTypeLoc, btn.dataset.shape === "heart" ? 0 : 1);
    });
  });

  /* Animation loop — accumulates elapsed time for the shader uniform */
  let elapsed = 0;
  let prevTime = performance.now();

  const animate = (now) => {
    elapsed += (now - prevTime) / 1000;
    prevTime = now;
    gl.uniform1f(timeLoc, elapsed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

document.querySelectorAll("[data-heartbeat-demo]").forEach(initHeartbeatDemo);

/* ── 6c. Clip-Path Typewriter ──────────────────────── */

const CLIP_TYPE_INTERVAL = 14; // ms per character typed
const CLIP_HOLD_AFTER_TYPE = 900; // ms to hold shape before auto-advancing
const CLIP_AUTO_DELAY = 1400; // ms between auto-rotations

const clipPathTypingData = [
  {
    clip: "circle(50%)",
    code: `<span class="prop">clip-path</span><span class="punct">:</span> <span class="keyword">circle</span><span class="punct">(</span><span class="number">50</span><span class="unit">%</span><span class="punct">);</span>`,
  },
  {
    clip: "polygon(50% 0%, 100% 100%, 0% 100%)",
    code: `<span class="prop">clip-path</span><span class="punct">:</span> <span class="keyword">polygon</span><span class="punct">(</span><span class="number">50</span><span class="unit">%</span> <span class="number">0</span><span class="unit">%</span><span class="punct">,</span> <span class="number">100</span><span class="unit">%</span> <span class="number">100</span><span class="unit">%</span><span class="punct">,</span> <span class="number">0</span><span class="unit">%</span> <span class="number">100</span><span class="unit">%</span><span class="punct">);</span>`,
  },
  {
    clip: "ellipse(50% 30% at 50% 50%)",
    code: `<span class="prop">clip-path</span><span class="punct">:</span> <span class="keyword">ellipse</span><span class="punct">(</span><span class="number">50</span><span class="unit">%</span> <span class="number">30</span><span class="unit">%</span> <span class="func">at</span> <span class="number">50</span><span class="unit">%</span> <span class="number">50</span><span class="unit">%</span><span class="punct">);</span>`,
  },
  {
    clip: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    code: `<span class="prop">clip-path</span><span class="punct">:</span> <span class="keyword">polygon</span><span class="punct">(</span><span class="number">50</span><span class="unit">%</span> <span class="number">0</span><span class="unit">%</span><span class="punct">,</span> <span class="number">100</span><span class="unit">%</span> <span class="number">50</span><span class="unit">%</span><span class="punct">,</span> <span class="number">50</span><span class="unit">%</span> <span class="number">100</span><span class="unit">%</span><span class="punct">,</span> <span class="number">0</span><span class="unit">%</span> <span class="number">50</span><span class="unit">%</span><span class="punct">);</span>`,
  },
  {
    clip: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    code: `<span class="prop">clip-path</span><span class="punct">:</span> <span class="keyword">polygon</span><span class="punct">(</span><span class="number">30</span><span class="unit">%</span> <span class="number">0</span><span class="unit">%</span><span class="punct">,</span> <span class="number">70</span><span class="unit">%</span> <span class="number">0</span><span class="unit">%</span><span class="punct">,</span> <span class="number">100</span><span class="unit">%</span> <span class="number">30</span><span class="unit">%</span><span class="punct">,</span> <span class="number">100</span><span class="unit">%</span> <span class="number">70</span><span class="unit">%</span><span class="punct">,</span> <span class="number">70</span><span class="unit">%</span> <span class="number">100</span><span class="unit">%</span><span class="punct">,</span> <span class="number">30</span><span class="unit">%</span> <span class="number">100</span><span class="unit">%</span><span class="punct">,</span> <span class="number">0</span><span class="unit">%</span> <span class="number">70</span><span class="unit">%</span><span class="punct">,</span> <span class="number">0</span><span class="unit">%</span> <span class="number">30</span><span class="unit">%</span><span class="punct">);</span>`,
  },
  {
    clip: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    code: `<span class="prop">clip-path</span><span class="punct">:</span> <span class="keyword">polygon</span><span class="punct">(</span><span class="number">50</span><span class="unit">%</span> <span class="number">0</span><span class="unit">%</span><span class="punct">,</span> <span class="number">61</span><span class="unit">%</span> <span class="number">35</span><span class="unit">%</span><span class="punct">,</span> <span class="number">98</span><span class="unit">%</span> <span class="number">35</span><span class="unit">%</span><span class="punct">,</span> <span class="number">68</span><span class="unit">%</span> <span class="number">57</span><span class="unit">%</span><span class="punct">,</span> <span class="number">79</span><span class="unit">%</span> <span class="number">91</span><span class="unit">%</span><span class="punct">,</span> <span class="number">50</span><span class="unit">%</span> <span class="number">70</span><span class="unit">%</span><span class="punct">,</span> <span class="number">21</span><span class="unit">%</span> <span class="number">91</span><span class="unit">%</span><span class="punct">,</span> <span class="number">32</span><span class="unit">%</span> <span class="number">57</span><span class="unit">%</span><span class="punct">,</span> <span class="number">2</span><span class="unit">%</span> <span class="number">35</span><span class="unit">%</span><span class="punct">,</span> <span class="number">39</span><span class="unit">%</span> <span class="number">35</span><span class="unit">%</span><span class="punct">);</span>`,
  },
];

function initClipPathDemo(root) {
  const shape = root.querySelector("[data-shape]");
  const codeBox = root.querySelector("[data-code]");
  const prevButton = root.querySelector('[data-action="prev"]');
  const pauseButton = root.querySelector('[data-action="pause"]');
  const nextButton = root.querySelector('[data-action="next"]');
  const indexOut = root.querySelector("[data-index]");
  const totalOut = root.querySelector("[data-total]");
  if (!shape || !codeBox || !prevButton || !pauseButton || !nextButton) return;

  const state = {
    currentIndex: 0,
    isPaused: false,
    typingTimer: null,
    holdTimer: null,
    autoTimer: null,
    isTyping: false,
  };

  totalOut.textContent = String(clipPathTypingData.length);

  /* Cancel all pending timers and clear typing state */
  const clearTimers = () => {
    clearInterval(state.typingTimer);
    clearTimeout(state.holdTimer);
    clearTimeout(state.autoTimer);
    state.typingTimer = state.holdTimer = state.autoTimer = null;
    state.isTyping = false;
    codeBox.classList.remove("is-typing");
    shape.classList.remove("is-updating");
  };

  /* Sync the counter and pause button label to current state */
  const updateMeta = () => {
    indexOut.textContent = String(state.currentIndex + 1);
    pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
  };

  /* Parse pre-built HTML tokens into {className, text} objects */
  const tokenize = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return Array.from(tmp.childNodes).map((n) => ({
      className: n.className || "",
      text: n.textContent || "",
    }));
  };

  /* Type a single item character by character, then call onDone */
  const typeItem = (item, onDone) => {
    clearTimers();
    const tokens = tokenize(item.code);
    codeBox.innerHTML = "";
    codeBox.classList.add("is-typing");
    shape.classList.add("is-updating");
    shape.style.clipPath = "inset(0 round 0px)"; // reset shape while typing
    state.isTyping = true;

    let tokenIdx = 0;
    let charIdx = 0;
    let span = null;

    state.typingTimer = setInterval(() => {
      if (tokenIdx >= tokens.length) {
        clearInterval(state.typingTimer);
        state.typingTimer = null;
        state.isTyping = false;
        codeBox.classList.remove("is-typing");
        shape.style.clipPath = item.clip;

        state.holdTimer = setTimeout(() => {
          shape.classList.remove("is-updating");
          onDone();
        }, CLIP_HOLD_AFTER_TYPE);
        return;
      }

      const token = tokens[tokenIdx];

      if (charIdx === 0) {
        span = document.createElement("span");
        span.className = token.className;
        span.textContent = "";
        codeBox.appendChild(span);
      }

      span.textContent += token.text.charAt(charIdx);
      charIdx++;

      if (charIdx >= token.text.length) {
        tokenIdx++;
        charIdx = 0;
        span = null;
      }
    }, CLIP_TYPE_INTERVAL);
  };

  /* Schedule auto-advance after the hold period */
  const scheduleNext = () => {
    if (state.isPaused) return;
    state.autoTimer = setTimeout(() => {
      goToIndex((state.currentIndex + 1) % clipPathTypingData.length, false);
    }, CLIP_AUTO_DELAY);
  };

  /* Navigate to a specific index, optionally marking as manual */
  const goToIndex = (index, manual = false) => {
    clearTimers();
    state.currentIndex =
      (index + clipPathTypingData.length) % clipPathTypingData.length;
    updateMeta();
    typeItem(clipPathTypingData[state.currentIndex], () => {
      if (!state.isPaused || !manual) scheduleNext();
    });
  };

  prevButton.addEventListener("click", () => {
    state.isPaused = true;
    updateMeta();
    goToIndex(state.currentIndex - 1, true);
  });
  nextButton.addEventListener("click", () => {
    state.isPaused = true;
    updateMeta();
    goToIndex(state.currentIndex + 1, true);
  });

  pauseButton.addEventListener("click", () => {
    state.isPaused = !state.isPaused;
    updateMeta();
    if (!state.isPaused && !state.isTyping && !state.autoTimer) scheduleNext();
    if (state.isPaused && state.autoTimer) {
      clearTimeout(state.autoTimer);
      state.autoTimer = null;
    }
  });

  updateMeta();
  goToIndex(0);
}

document.querySelectorAll("[data-clip-path-demo]").forEach(initClipPathDemo);

/* ── 8. HERO SECTIONS ───────────────────────────────────────────
   8a. Particle Field — canvas-based floating dots with connecting
       lines. Mouse proximity repels nearby particles.
   8b. 3D Tilt Hero — multi-layer parallax on mousemove. Each
       layer shifts by its data-depth value, reset on mouseleave.
   8c. Shooting Stars — populates a static star field and a
       rotated meteor shower container with randomised elements.
   ---------------------------------------------------------------- */

/* ── 8a. Particle Field ────────────────────────────────────── */

const PARTICLE_COLOR = "rgba(0, 255, 153, 0.7)"; // dot color
const PARTICLE_LINE_COLOR = "rgba(0, 255, 153, 0.15)"; // connecting line color
const PARTICLE_COUNT_HERO = 80; // number of dots
const PARTICLE_CONNECT_DIST = 120; // px — max distance to draw a line
const PARTICLE_MOUSE_DIST = 100; // px — repel radius around cursor
const PARTICLE_SPEED = 0.4; // base movement speed

document.querySelectorAll("[data-particle-hero]").forEach((hero) => {
  const canvas = hero.querySelector(".hero__canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, particles, raf;
  const mouse = { x: -999, y: -999 };

  /* Resize canvas to match hero dimensions */
  const resize = () => {
    const rect = hero.getBoundingClientRect();
    W = canvas.width = Math.floor(rect.width * (window.devicePixelRatio || 1));
    H = canvas.height = Math.floor(
      rect.height * (window.devicePixelRatio || 1),
    );
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    init();
  };

  /* Create particle objects with random position, velocity, size */
  const init = () => {
    const rW = W / (window.devicePixelRatio || 1);
    const rH = H / (window.devicePixelRatio || 1);
    particles = Array.from({ length: PARTICLE_COUNT_HERO }, () => ({
      x: Math.random() * rW,
      y: Math.random() * rH,
      vx: (Math.random() - 0.5) * PARTICLE_SPEED,
      vy: (Math.random() - 0.5) * PARTICLE_SPEED,
      r: 1 + Math.random() * 2,
    }));
  };

  /* Draw and update one frame */
  const draw = () => {
    const rW = W / (window.devicePixelRatio || 1);
    const rH = H / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, rW, rH);

    particles.forEach((p) => {
      /* Repel from mouse */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < PARTICLE_MOUSE_DIST) {
        const force = (PARTICLE_MOUSE_DIST - dist) / PARTICLE_MOUSE_DIST;
        p.vx += (dx / dist) * force * 0.5;
        p.vy += (dy / dist) * force * 0.5;
      }

      /* Dampen velocity and move */
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap at edges */
      if (p.x < 0) p.x = rW;
      if (p.x > rW) p.x = 0;
      if (p.y < 0) p.y = rH;
      if (p.y > rH) p.y = 0;

      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = PARTICLE_COLOR;
      ctx.fill();
    });

    /* Draw connecting lines between nearby particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PARTICLE_CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = PARTICLE_LINE_COLOR;
          ctx.globalAlpha = 1 - dist / PARTICLE_CONNECT_DIST; // fade with distance
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    raf = requestAnimationFrame(draw);
  };

  hero.addEventListener(
    "mousemove",
    (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    },
    { passive: true },
  );

  hero.addEventListener("mouseleave", () => {
    mouse.x = -999;
    mouse.y = -999;
  });

  window.addEventListener("resize", resize);
  resize();
  draw();
});

/* ── 8b. 3D Tilt Hero ──────────────────────────────────────── */
/* Reads data-depth per layer and shifts it proportionally
   to the cursor offset. CSS transition handles smooth reset. */

const TILT_HERO_MAX = 20; // px — max layer shift at screen edge

document.querySelectorAll("[data-tilt-hero]").forEach((hero) => {
  const layers = hero.querySelectorAll("[data-depth]");

  hero.addEventListener(
    "mousemove",
    (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth ?? 0);
        const moveX = x * TILT_HERO_MAX * depth;
        const moveY = y * TILT_HERO_MAX * depth;
        layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    },
    { passive: true },
  );

  hero.addEventListener("mouseleave", () => {
    layers.forEach((layer) => {
      layer.style.transform = "";
    }); // CSS transition resets
  });
});

/* ── 7. LOADERS ─────────────────────────────────────────────────
   7a. Progress Bar — animates fill width and percentage label
       from 0→100 on a loop, restarting after a brief pause.
   7b. Typewriter — cycles through phrases from data-phrases,
       typing and deleting each one character by character.
   ---------------------------------------------------------------- */

/* ── 7a. Progress Bar ──────────────────────────────── */

const PROGRESS_DURATION = 3000; // ms — time to fill from 0 to 100
const PROGRESS_HOLD = 800; // ms — pause at 100% before restarting
const PROGRESS_INTERVAL = 16; // ms — ~60fps update tick

document.querySelectorAll("[data-progress]").forEach((root) => {
  const fill = root.querySelector(".loader-progress__fill");
  const label = root.querySelector("[data-progress-label]");
  if (!fill || !label) return;

  let current = 0;
  let timer = null;

  const tick = () => {
    current = Math.min(
      current + 100 / (PROGRESS_DURATION / PROGRESS_INTERVAL),
      100,
    );
    const pct = Math.round(current);

    fill.style.setProperty("--progress", pct); // drives CSS width
    root.setAttribute("aria-valuenow", pct);
    label.textContent = `${pct}%`;

    if (current >= 100) {
      clearInterval(timer);
      setTimeout(restart, PROGRESS_HOLD); // pause at 100 then loop
    }
  };

  const restart = () => {
    current = 0;
    timer = setInterval(tick, PROGRESS_INTERVAL);
  };

  restart();
});

/* ── 7b. Typewriter ────────────────────────────────── */

const TW_TYPE_SPEED = 60; // ms per character typed
const TW_DELETE_SPEED = 35; // ms per character deleted (faster feels natural)
const TW_HOLD_TYPED = 1800; // ms — pause after fully typed
const TW_HOLD_DELETED = 400; // ms — pause after fully deleted

document.querySelectorAll("[data-typewriter]").forEach((el) => {
  let phrases;
  try {
    phrases = JSON.parse(el.dataset.phrases || "[]");
  } catch {
    phrases = [];
  }
  if (!phrases.length) return;

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  const tick = () => {
    const phrase = phrases[phraseIdx];
    const current = phrase.slice(0, charIdx);
    el.textContent = current;

    if (!isDeleting && charIdx === phrase.length) {
      /* Fully typed — hold then start deleting */
      setTimeout(() => {
        isDeleting = true;
        tick();
      }, TW_HOLD_TYPED);
      return;
    }

    if (isDeleting && charIdx === 0) {
      /* Fully deleted — move to next phrase */
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(tick, TW_HOLD_DELETED);
      return;
    }

    charIdx += isDeleting ? -1 : 1;
    setTimeout(tick, isDeleting ? TW_DELETE_SPEED : TW_TYPE_SPEED);
  };

  tick();
});

/* ── 8c. Shooting Stars ────────────────────────────── */
/* Populates [data-star-field] with 200 twinkling static dots
   and [data-meteor-field] with 50 shooting stars in 4 colour
   variants. All timing is randomised via inline style properties. */

const STAR_COUNT = 200;
const METEOR_COUNT = 50;
const METEOR_COLORS = ["", "is-blue", "is-purple", "is-gold"];

document.querySelectorAll("[data-star-field]").forEach((field) => {
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    field.appendChild(star);
  }
});

document.querySelectorAll("[data-meteor-field]").forEach((night) => {
  for (let i = 0; i < METEOR_COUNT; i++) {
    const meteor = document.createElement("div");
    meteor.className = "shooting-star";

    /* Randomly assign a colour variant to ~60% of meteors */
    if (Math.random() > 0.4) {
      const color =
        METEOR_COLORS[Math.floor(Math.random() * METEOR_COLORS.length)];
      if (color) meteor.classList.add(color);
    }

    meteor.style.top = `${Math.random() * 100 - 50}%`;
    meteor.style.left = `${Math.random() * 100 - 50}%`;
    meteor.style.animationDelay = `${Math.random() * 5}s`;
    meteor.style.animationDuration = `${Math.random() * 2 + 3}s`;
    night.appendChild(meteor);
  }
});

/* ── 9. MODALS ──────────────────────────────────────────────────
   9a. Modal System — open/close any overlay by id, close on
       backdrop click or Escape key, trap focus inside.
   9b. Lightbox — swaps src/alt on the shared image element.
   9c. Command Palette — filters list on input, keyboard nav,
       opened by ⌘K / Ctrl+K global shortcut.
   9d. Toast — spawns typed notifications, auto-dismisses after
       delay, supports manual close.
   ---------------------------------------------------------------- */

/* ── 9a. Modal System ──────────────────────────────── */

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* Open a modal overlay by id */
const openModal = (id) => {
  const overlay = document.getElementById(id);
  if (!overlay) return;

  overlay.removeAttribute("hidden");
  document.body.style.overflow = "hidden"; // prevent background scroll

  /* Move focus to first focusable element inside the modal */
  const firstFocusable = overlay.querySelector(FOCUSABLE);
  if (firstFocusable) firstFocusable.focus();
};

/* Close a modal overlay by id (or any ancestor overlay) */
const closeModal = (overlayOrId) => {
  const overlay =
    typeof overlayOrId === "string"
      ? document.getElementById(overlayOrId)
      : overlayOrId;
  if (!overlay) return;

  overlay.setAttribute("hidden", "");
  document.body.style.overflow = "";
};

/* Open triggers — data-modal-open="overlay-id" */
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-modal-open]");
  if (trigger) openModal(trigger.dataset.modalOpen);
});

/* Close triggers — data-modal-close on buttons inside any overlay */
document.addEventListener("click", (e) => {
  const closeBtn = e.target.closest("[data-modal-close]");
  if (closeBtn) closeModal(closeBtn.closest(".modal-overlay"));
});

/* Backdrop click closes the overlay (but not clicks on the modal itself) */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) closeModal(e.target);
});

/* Escape key closes any open overlay */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const open = document.querySelector(".modal-overlay:not([hidden])");
  if (open) closeModal(open);
});

/* Focus trap — keep Tab inside the open modal */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const overlay = document.querySelector(".modal-overlay:not([hidden])");
  if (!overlay) return;

  const focusable = Array.from(overlay.querySelectorAll(FOCUSABLE));
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ── 9b. Lightbox ──────────────────────────────────── */
/* Reads src and alt from the clicked thumbnail's data attributes
   and injects them into the shared lightbox image element. */

document.addEventListener("click", (e) => {
  const thumb = e.target.closest("[data-lightbox-src]");
  if (!thumb) return;

  const img = document.getElementById("lightbox-img");
  if (img) {
    img.src = thumb.dataset.lightboxSrc;
    img.alt = thumb.dataset.lightboxAlt ?? "";
  }

  openModal("lightbox-modal");
});

/* ── 9c. Command Palette ───────────────────────────── */
/* Filters visible list items as the user types.
   Arrow keys navigate the list. Enter selects an item.
   ⌘K / Ctrl+K opens the palette globally. */

const COMMAND_OPEN_ID = "command-modal";

/* Global keyboard shortcut */
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    const overlay = document.getElementById(COMMAND_OPEN_ID);
    if (!overlay) return;

    if (overlay.hasAttribute("hidden")) {
      openModal(COMMAND_OPEN_ID);
      /* Clear and focus the search input */
      const input = overlay.querySelector(".command__input");
      if (input) {
        input.value = "";
        input.focus();
        filterCommands("");
      }
    } else {
      closeModal(COMMAND_OPEN_ID);
    }
  }
});

/* Filter list items by query */
const filterCommands = (query) => {
  const list = document.getElementById("command-list");
  if (!list) return;

  const items = list.querySelectorAll(".command__item");
  let hasVisible = false;

  items.forEach((item) => {
    const match = item.dataset.commandValue
      ?.toLowerCase()
      .includes(query.toLowerCase());
    item.hidden = !match;
    if (match) hasVisible = true;
  });

  /* Show/hide empty state */
  let empty = list.querySelector(".command__empty");
  if (!hasVisible) {
    if (!empty) {
      empty = document.createElement("li");
      empty.className = "command__empty";
      empty.textContent = "No results found";
      list.appendChild(empty);
    }
    empty.hidden = false;
  } else if (empty) {
    empty.hidden = true;
  }
};

/* Wire up input filtering and keyboard navigation per palette */
document.querySelectorAll("[data-command]").forEach((palette) => {
  const input = palette.querySelector(".command__input");
  const list = palette.querySelector(".command__list");
  if (!input || !list) return;

  input.addEventListener("input", () => filterCommands(input.value));

  input.addEventListener("keydown", (e) => {
    const items = Array.from(
      list.querySelectorAll(".command__item:not([hidden])"),
    );
    const selected = list.querySelector(".command__item.is-selected");
    let idx = items.indexOf(selected);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selected?.classList.remove("is-selected");
      items[Math.min(idx + 1, items.length - 1)]?.classList.add("is-selected");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selected?.classList.remove("is-selected");
      items[Math.max(idx - 1, 0)]?.classList.add("is-selected");
    } else if (e.key === "Enter" && selected) {
      e.preventDefault();
      closeModal(COMMAND_OPEN_ID); // in a real app, execute the command here
    }
  });
});

/* Also focus input and clear filter when palette opens via button */
document.addEventListener("click", (e) => {
  const trigger = e.target.closest(`[data-modal-open="${COMMAND_OPEN_ID}"]`);
  if (!trigger) return;
  const overlay = document.getElementById(COMMAND_OPEN_ID);
  if (!overlay) return;
  const input = overlay.querySelector(".command__input");
  if (input) {
    input.value = "";
    filterCommands("");
    requestAnimationFrame(() => input.focus());
  }
});

/* ── 9d. Toast ─────────────────────────────────────── */

const TOAST_DURATION = 4000; // ms — auto-dismiss delay

const TOAST_CONFIG = {
  success: {
    icon: "✓",
    title: "Success",
    message: "Action completed successfully.",
  },
  error: {
    icon: "✕",
    title: "Error",
    message: "Something went wrong. Try again.",
  },
  info: {
    icon: "ℹ",
    title: "Info",
    message: "Here's something you should know.",
  },
  warning: { icon: "⚠", title: "Warning", message: "Proceed with caution." },
};

const spawnToast = (type) => {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const config = TOAST_CONFIG[type] ?? TOAST_CONFIG.info;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span class="toast__icon">${config.icon}</span>
    <div class="toast__body">
      <p class="toast__title">${config.title}</p>
      <p class="toast__message">${config.message}</p>
    </div>
    <button class="toast__close" type="button" aria-label="Dismiss">&times;</button>
  `;

  /* Manual close */
  toast
    .querySelector(".toast__close")
    .addEventListener("click", () => dismissToast(toast));

  container.appendChild(toast);

  /* Auto-dismiss after delay */
  setTimeout(() => dismissToast(toast), TOAST_DURATION);
};

/* Play exit animation then remove from DOM */
const dismissToast = (toast) => {
  if (toast.classList.contains("is-dismissing")) return;
  toast.classList.add("is-dismissing");
  toast.addEventListener("animationend", () => toast.remove(), { once: true });
};

/* Wire up toast trigger buttons */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-toast]");
  if (btn) spawnToast(btn.dataset.toast);
});

/* ── 10. TRANSITIONS ────────────────────────────────────────────
   10a. Page Transition — overlay wipe variants, correct durations.
   10b. Scroll Reveal — replay button resets and re-observes.
   10c. Stagger List — replay button resets and re-triggers.
   10d. Counter — count-up on intersection.
   10e. Magnetic Cursor — mousemove warp within element bounds.
   10f. Parallax Scroll — mousemove within scene drives layers.
   10g. Flip Number — odometer digit columns slide on change.
   10h. Page Flip — only right page flips, proper 3D book turn.
   10i. Portal Transition — circle expands from click origin.
   10j. Glitch Transition — RGB-split page-to-page transition.
   ---------------------------------------------------------------- */

/* ── 10a. Page Transition ──────────────────────────── */

const PT_DURATIONS = { slide: 1000, fade: 1400, curtain: 1700 };

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page-transition]");
  if (!btn) return;

  const variant = btn.dataset.pageTransition;
  const overlay = document.getElementById("page-transition-overlay");
  if (!overlay) return;

  overlay.className = `page-transition-overlay is-active variant-${variant}`;

  setTimeout(() => {
    overlay.className = "page-transition-overlay";
  }, PT_DURATIONS[variant] ?? 1000);
});

/* ── 10b. Scroll Reveal ────────────────────────────── */
/* Uses a container observer. Replay button resets boxes
   then re-observes so the animation fires again. */

const initReveal = (container) => {
  const boxes = Array.from(container.querySelectorAll("[data-reveal]"));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  /* Small delay so boxes aren't already in view on init */
  setTimeout(() => boxes.forEach((b) => obs.observe(b)), 100);
  return { boxes, obs };
};

document.querySelectorAll("[data-reveal-container]").forEach((container) => {
  let { boxes, obs } = initReveal(container);

  /* Replay: reset classes, re-observe */
  const replayBtn = container
    .closest(".demo-card")
    ?.querySelector("[data-reveal-replay]");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      obs.disconnect();
      boxes.forEach((b) => b.classList.remove("is-visible"));
      setTimeout(() => {
        boxes.forEach((b) => obs.observe(b));
      }, 80);
    });
  }
});

/* ── 10c. Stagger List ─────────────────────────────── */

const initStagger = (list) => {
  const items = list.querySelectorAll(".stagger-list__item");
  items.forEach((item, i) => item.style.setProperty("--i", i));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          list.classList.add("is-visible");
          obs.unobserve(list);
        }
      });
    },
    { threshold: 0.1 },
  );

  setTimeout(() => obs.observe(list), 100);
  return obs;
};

document.querySelectorAll("[data-stagger-list]").forEach((list) => {
  let obs = initStagger(list);

  const replayBtn = list
    .closest(".demo-card")
    ?.querySelector("[data-stagger-replay]");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      obs.disconnect();
      list.classList.remove("is-visible");
      setTimeout(() => {
        obs = initStagger(list);
      }, 80);
    });
  }
});

/* ── 10d. Counter ──────────────────────────────────── */

const COUNTER_DURATION = 1800;

const animateCounter = (el) => {
  const target = parseInt(el.dataset.target ?? "0", 10);
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / COUNTER_DURATION, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 },
);

document
  .querySelectorAll("[data-counter]")
  .forEach((el) => counterObserver.observe(el));

/* ── 10e. Magnetic Cursor ──────────────────────────── */

const MAGNETIC_STRENGTH = 0.4;

document.querySelectorAll("[data-magnetic]").forEach((el) => {
  el.addEventListener(
    "mousemove",
    (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      el.style.transform = `translate(${(e.clientX - cx) * MAGNETIC_STRENGTH}px, ${(e.clientY - cy) * MAGNETIC_STRENGTH}px)`;
    },
    { passive: true },
  );

  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
});

/* ── 10f. Parallax Scroll ──────────────────────────── */
/* Switched to mousemove within the scene — works regardless
   of whether the page is scrolling. data-depth drives offset. */

document.querySelectorAll("[data-parallax-scene]").forEach((scene) => {
  scene.addEventListener(
    "mousemove",
    (e) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      scene.querySelectorAll("[data-depth]").forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth ?? 0);
        const mx = x * depth * 30;
        const my = y * depth * 30;
        layer.style.transform = `translate(${mx}px, ${my}px)`;
      });
    },
    { passive: true },
  );

  scene.addEventListener("mouseleave", () => {
    scene.querySelectorAll("[data-depth]").forEach((layer) => {
      layer.style.transform = ""; // CSS transition resets
    });
  });
});

/* ── 10g. Flip Number ──────────────────────────────── */

const DIGITS = "0123456789";

const buildFlipNumber = (root, valueStr) => {
  root.innerHTML = "";
  [...valueStr].forEach((char) => {
    const digit = document.createElement("div");
    digit.className = "flip-digit";
    const track = document.createElement("div");
    track.className = "flip-digit__track";
    DIGITS.split("").forEach((d) => {
      const face = document.createElement("div");
      face.className = "flip-digit__face";
      face.textContent = d;
      track.appendChild(face);
    });
    digit.appendChild(track);
    root.appendChild(digit);
    setDigit(track, parseInt(char, 10) || 0);
  });
};

const setDigit = (track, n) => {
  track.style.transform = `translateY(${-n * 52}px)`;
};

const setFlipValue = (root, newValue) => {
  const tracks = root.querySelectorAll(".flip-digit__track");
  [...String(newValue).padStart(tracks.length, "0")].forEach((char, i) => {
    if (tracks[i]) setDigit(tracks[i], parseInt(char, 10));
  });
};

document.querySelectorAll("[data-flip-number]").forEach((root) => {
  buildFlipNumber(root, root.dataset.value ?? "00000");
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-flip-trigger]");
  if (!btn) return;
  const root = btn
    .closest(".flip-number-demo")
    ?.querySelector("[data-flip-number]");
  if (!root) return;
  const tracks = root.querySelectorAll(".flip-digit__track");
  setFlipValue(root, Math.floor(Math.random() * Math.pow(10, tracks.length)));
});

/* ── 10h. Page Flip ────────────────────────────────── */
/* Only the right page element flips. Left page stays fixed.
   Clicking anywhere on the book toggles the flip state. */

document.querySelectorAll("[data-page-flip]").forEach((root) => {
  const rightPage = root.querySelector(".page-flip__right");
  if (!rightPage) return;

  root.addEventListener("click", () => {
    rightPage.classList.toggle("is-flipped");
  });
});

/* ── 10i. Portal Transition ────────────────────────── */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-portal]");
  if (!btn) return;
  const overlay = document.getElementById("portal-overlay");
  if (!overlay) return;
  const rect = btn.getBoundingClientRect();
  overlay.style.setProperty("--cx", `${rect.left + rect.width / 2}px`);
  overlay.style.setProperty("--cy", `${rect.top + rect.height / 2}px`);
  overlay.classList.add("is-open");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-portal-close]")) return;
  const overlay = document.getElementById("portal-overlay");
  if (overlay) overlay.classList.remove("is-open");
});

/* ── 10j. Glitch Transition ────────────────────────── */
/* Button triggers: glitch animation plays, then page A/B
   swaps halfway through. Button label toggles. */

const GLITCH_DURATION = 420; // ms — matches CSS animation duration

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-glitch-trigger]");
  if (!btn) return;

  const scene = btn
    .closest(".glitch-demo")
    ?.querySelector("[data-glitch-scene]");
  if (!scene || scene.classList.contains("is-glitching")) return;

  const pageA = scene.querySelector(".glitch-scene__page--a");
  const pageB = scene.querySelector(".glitch-scene__page--b");
  const isOnA = parseFloat(getComputedStyle(pageB).opacity) < 0.5;

  /* Start glitch */
  scene.classList.add("is-glitching");

  /* Swap pages halfway through the glitch */
  setTimeout(() => {
    if (isOnA) {
      pageA.style.opacity = "0";
      pageB.style.opacity = "1";
      btn.textContent = "← Glitch Back";
    } else {
      pageA.style.opacity = "1";
      pageB.style.opacity = "0";
      btn.textContent = "Glitch →";
    }
  }, GLITCH_DURATION / 2);

  /* Remove glitch class after animation */
  setTimeout(() => {
    scene.classList.remove("is-glitching");
  }, GLITCH_DURATION + 50);
});
