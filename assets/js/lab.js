/* ============================================================================================
   This handles the featured component randomizer, anchor scroll, and shared lab interactions.
   REQUIRES lab-registry.js loaded first!
   ============================================================================================ */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* Fisher-Yates Shuffle */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* GET FEATURED COMPONENT */
const getFeatured = (registry, count = 6) => {
  // Group components by category
  const byCategory = registry.reduce((acc, component) => {
    acc[component.category] = acc[component.category] || [];
    acc[component.category].push(component);
    return acc;
  }, {});

  const categories = shuffle(Object.keys(byCategory));
  const featured = [];

  // First pass - one random pick per category
  for (const cat of categories) {
    if (featured.length >= count) break;
    const shuffled = shuffle(byCategory[cat]);
    featured.push(shuffled[0]);
  }

  // Second pass - fill remaining slots if count > category count
  if (featured.length < count) {
    const usedIds = new Set(featured.map((c) => c.id));
    const remaining = shuffle(registry.filter((c) => !usedIds.has(c.id)));
    for (const component of remaining) {
      if (featured.length >= count) break;
      featured.push(component);
    }
  }

  return featured;
};

/* BUILD FEATURED CARD */
const buildFeaturedCard = (component) => {
  const card = document.createElement("a");
  card.className = "featured-card";
  card.href = `${component.page}#${component.id}`;
  card.setAttribute("aria-label", `${component.title} - ${component.category}`);

  card.innerHTML = `
    <div class="featured-card__preview" aria-hidden="true">
      <div class="featured-card__preview-inner">
        ${component.previewHTML}
      </div>
    </div>
    <div class="featured-card__footer">
      <div class="featured-card__meta">
        <span class="featured-card__category">${component.category}</span>
        <h3 class="featured-card__title">${component.title}</h3>
      </div>
      <svg class="featured-card__arrow" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
    `;

  return card;
};

/* INIT FEATURED GRID */
const initFeatured = () => {
  const grid = qs(".featured-grid");
  if (!grid) return;
  if (typeof LAB_REGISTRY === "undefined") {
    console.warn("LAB_REGISTRY not found - ensure lab-registry.js loads first");
    return;
  }

  const featured = getFeatured(LAB_REGISTRY, 6);
  const fragment = document.createDocumentFragment();

  featured.forEach((component) => {
    fragment.appendChild(buildFeaturedCard(component));
  });

  grid.appendChild(fragment);
};

/* ANCHOR SCROLL */
const initAnchorScroll = () => {
  const hash = window.location.hash;
  if (!hash) return;

  requestAnimationFrame(() => {
    const target = qs(hash);
    if (!target) return;

    const navHeight = 72;
    const top =
      target.getBoundingClientRect().top + window.scrollY - navHeight - 24;

    window.scrollTo({ top, behavior: "smooth" });

    target.classList.add("is-highlighted");
    setTimeout(() => target.classList.remove("is-highlighted"), 2000);
  });
};

/* HIGHLIGHT STYLE */
const injectHighlightStyle = () => {
  const style = document.createElement("style");
  style.textContent = `
        .demo-card.is-highlighted {
      border-color: var(--color-gold) !important;
      box-shadow:   var(--shadow-gold-strong) !important;
      animation:    card-highlight 2s var(--ease-out) forwards;
    }
    @keyframes card-highlight {
      0%   { box-shadow: var(--shadow-gold-strong); }
      100% { box-shadow: var(--shadow-gold);        }
    }
    `;
  document.head.appendChild(style);
};

/* SHUFFLE BUTTON */
const initShuffleButton = () => {
  const btn = qs(".featured-shuffle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const grid = qs(".featured-grid");
    if (!grid) return;

    grid.style.opacity = "0";
    grid.style.transition = `opacity var(--duration-base) var(--ease-out)`;

    setTimeout(() => {
      grid.innerHTML = "";
      const featured = getFeatured(LAB_REGISTRY, 6);
      const fragment = document.createDocumentFragment();
      featured.forEach((c) => fragment.appendChild(buildFeaturedCard(c)));
      grid.appendChild(fragment);

      grid.style.opacity = "1";
    }, 250);
  });
};

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  injectHighlightStyle();
  initFeatured();
  initShuffleButton();
  initAnchorScroll();
});
