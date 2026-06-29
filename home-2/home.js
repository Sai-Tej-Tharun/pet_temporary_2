/**
 * ============================================================
 * PawSpa — home-2/home.js
 * Page-specific JavaScript for the Membership Landing Page.
 * Handles: plan builder, billing toggle, chip selection,
 * animated plan price transitions, section enhancements.
 *
 * NOTE: Core site features (navbar, footer, modals, AOS,
 * accordions, sliders, counters, toasts) are handled by
 * ../global-js/global.js — which must be loaded first.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   PLAN BUILDER CONFIG
   Maps [pet + size + frequency] → plan recommendation
   ───────────────────────────────────────────── */

const PLAN_MAP = {
  /* [freq][size] → { name, price } */
  1: {
    small:  { name: 'Silver Care — 1× Monthly',    price: '₹599/mo'  },
    medium: { name: 'Silver Care — 1× Monthly',    price: '₹799/mo'  },
    large:  { name: 'Silver Care — 1× Monthly',    price: '₹999/mo'  },
  },
  2: {
    small:  { name: 'Gold Care — 2× Monthly',      price: '₹1,099/mo' },
    medium: { name: 'Gold Care — 2× Monthly',      price: '₹1,299/mo' },
    large:  { name: 'Gold Care — 2× Monthly',      price: '₹1,599/mo' },
  },
  4: {
    small:  { name: 'Diamond Routine — Weekly',    price: '₹1,999/mo' },
    medium: { name: 'Diamond Routine — Weekly',    price: '₹2,499/mo' },
    large:  { name: 'Diamond Routine — Weekly',    price: '₹2,999/mo' },
  },
};

/* ─────────────────────────────────────────────
   STATE
   ───────────────────────────────────────────── */

const planState = {
  pet:  'dog',
  size: 'medium',
  freq: 2,
};

/* ─────────────────────────────────────────────
   1. PLAN BUILDER — CHIP SELECTION
   ───────────────────────────────────────────── */

/**
 * Wire chip buttons inside each planner-step.
 * Each chip group updates planState and refreshes the result.
 */
function initPlanBuilder() {
  const planner = document.querySelector('.hero-planner');
  if (!planner) return;

  /* Pet type chips */
  planner.querySelectorAll('[data-pet]').forEach(btn => {
    btn.addEventListener('click', () => {
      planner.querySelectorAll('[data-pet]').forEach(b => b.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      planState.pet = btn.dataset.pet;
      updatePlanResult();
    });
  });

  /* Breed size chips */
  planner.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      planner.querySelectorAll('[data-size]').forEach(b => b.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      planState.size = btn.dataset.size;
      updatePlanResult();
    });
  });

  /* Frequency chips */
  planner.querySelectorAll('[data-freq]').forEach(btn => {
    btn.addEventListener('click', () => {
      planner.querySelectorAll('[data-freq]').forEach(b => b.classList.remove('chip--active'));
      btn.classList.add('chip--active');
      planState.freq = parseInt(btn.dataset.freq, 10);
      updatePlanResult();
    });
  });

  // Initial render
  updatePlanResult();
}

/**
 * Updates the recommended plan name and price in the result box.
 * Applies a brief flash animation to indicate update.
 */
function updatePlanResult() {
  const nameEl  = document.getElementById('pr-plan-name');
  const priceEl = document.getElementById('pr-plan-price');
  if (!nameEl || !priceEl) return;

  const entry = PLAN_MAP[planState.freq]?.[planState.size];
  if (!entry) return;

  /* Flash animation */
  [nameEl, priceEl].forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(4px)';
  });

  requestAnimationFrame(() => {
    nameEl.textContent  = entry.name;
    priceEl.textContent = `From ${entry.price}`;

    setTimeout(() => {
      [nameEl, priceEl].forEach(el => {
        el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      });
    }, 50);
  });
}

/* ─────────────────────────────────────────────
   2. BILLING TOGGLE (Monthly / Annual)
   ───────────────────────────────────────────── */

/**
 * Toggles plan prices between monthly and annual rates.
 * Prices are stored as data-monthly / data-annual attributes
 * on each .plan-amount element.
 */
function initBillingToggle() {
  const toggleBtns = document.querySelectorAll('.btog-btn');
  if (!toggleBtns.length) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      /* Update active state */
      toggleBtns.forEach(b => {
        b.classList.remove('btog-btn--active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('btog-btn--active');
      btn.setAttribute('aria-pressed', 'true');

      const period = btn.dataset.period; // 'monthly' | 'annual'
      updatePlanPrices(period);
    });
  });
}

/**
 * Updates all plan price amounts and billing note text.
 * @param {'monthly'|'annual'} period
 */
function updatePlanPrices(period) {
  const amounts = document.querySelectorAll('.plan-amount');
  amounts.forEach(el => {
    const targetVal = period === 'annual'
      ? el.dataset.annual
      : el.dataset.monthly;

    if (!targetVal) return;

    /* Animate price change */
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity    = '0';
    el.style.transform  = 'scale(0.9)';

    setTimeout(() => {
      /* Format number with Indian locale commas */
      const num      = parseInt(targetVal, 10);
      el.textContent = num.toLocaleString('en-IN');
      el.style.opacity   = '1';
      el.style.transform = 'scale(1)';
    }, 180);
  });

  /* Update billed notes */
  const noteText = period === 'annual'
    ? 'Billed annually (20% off)'
    : 'Billed monthly';

  document.querySelectorAll('.plan-billed-note').forEach(el => {
    el.textContent = noteText;
  });
}

/* ─────────────────────────────────────────────
   3. SECTION — SCROLL INDICATOR AUTO-HIDE
   ───────────────────────────────────────────── */

/**
 * Hides the scroll indicator once the user scrolls past 100px.
 */
function initScrollIndicatorHide() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  const onScroll = () => {
    const hide = window.scrollY > 100;
    indicator.style.opacity   = hide ? '0' : '1';
    indicator.style.transform = hide
      ? 'translateX(-50%) translateY(8px)'
      : 'translateX(-50%) translateY(0)';
  };

  indicator.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─────────────────────────────────────────────
   4. LIFESTYLE GALLERY — LIGHT-BOX HINT
   ───────────────────────────────────────────── */

/**
 * Adds a subtle cursor-zoom visual cue to gallery images.
 * Full lightbox is handled by global.js initLightbox().
 */
function initGalleryHints() {
  document.querySelectorAll('.lg-main img, .lg-side img').forEach(img => {
    img.setAttribute('data-lightbox', img.src);
    img.style.cursor = 'zoom-in';
  });
}

/* ─────────────────────────────────────────────
   5. HERO BLOB — MOUSE PARALLAX (desktop only)
   ───────────────────────────────────────────── */

/**
 * Subtle parallax on hero blobs based on mouse position.
 * Only active on non-touch devices.
 */
function initHeroParallax() {
  if (window.matchMedia('(hover: none)').matches) return;

  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  const blob3 = document.querySelector('.blob-3');
  if (!blob1) return;

  const hero = document.querySelector('.hero-membership');
  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const rect  = hero.getBoundingClientRect();
    const xPct  = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 → 0.5
    const yPct  = (e.clientY - rect.top)  / rect.height - 0.5;

    const move = (el, factorX, factorY) => {
      el.style.transform = `translate(${xPct * factorX}px, ${yPct * factorY}px)`;
      el.style.transition = 'transform 0.6s ease';
    };

    if (blob1) move(blob1,  30, 20);
    if (blob2) move(blob2, -20, 30);
    if (blob3) move(blob3,  15, -15);
  });
}

/* ─────────────────────────────────────────────
   6. PLAN CARD — HOVER GLOW
   ───────────────────────────────────────────── */

/**
 * Adds a subtle spotlight-follow glow effect on plan cards.
 * Uses CSS custom properties to track cursor position.
 */
function initPlanCardGlow() {
  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--glow-x');
      card.style.removeProperty('--glow-y');
    });
  });
}

/* ─────────────────────────────────────────────
   7. STICKY PLANS ANCHOR NAV
   ───────────────────────────────────────────── */

/**
 * Scrolls smoothly to #plans section when "View All Plans" is clicked.
 * Supplements global.js smooth-scroll for anchor links.
 */
function initPlanScroll() {
  document.querySelectorAll('a[href="#plans"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById('plans');
      if (!target) return;
      const offset = 88;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  });
}

/* ─────────────────────────────────────────────
   8. PROMO CODE COPY ON CLICK
   ───────────────────────────────────────────── */

/**
 * Copies the promo code to clipboard when user clicks it.
 * The promo code is inside a <strong> inside .cta-sub.
 */
function initPromoCode() {
  const ctaSub  = document.querySelector('.cta-sub');
  if (!ctaSub) return;
  const codeEl = ctaSub.querySelector('strong');
  if (!codeEl) return;

  codeEl.style.cursor = 'pointer';
  codeEl.title        = 'Click to copy';
  codeEl.setAttribute('role', 'button');
  codeEl.setAttribute('tabindex', '0');

  const copy = () => {
    navigator.clipboard?.writeText(codeEl.textContent.trim()).then(() => {
      if (window.PawSpa?.showToast) {
        window.PawSpa.showToast(`Promo code "${codeEl.textContent.trim()}" copied! 🎉`, 'success');
      }
    }).catch(() => {/* Silently fail on older browsers */});
  };

  codeEl.addEventListener('click', copy);
  codeEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
  });
}

/* ─────────────────────────────────────────────
   9. ENTRY POINT
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  /* Plan builder must run after DOM is ready */
  initPlanBuilder();
  initBillingToggle();

  /* Visual enhancements */
  initScrollIndicatorHide();
  initGalleryHints();
  initHeroParallax();
  initPlanCardGlow();
  initPlanScroll();
  initPromoCode();
});
