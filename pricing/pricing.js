/**
 * ============================================================
 * PawSpa — pricing.js
 * Page-specific JS for pricing.html
 *
 * Table of Contents:
 * 01. Pet Type Toggle (dog / cat / all)
 * 02. Billing Toggle (single vs 5-visit bundle)
 * 03. Package Price Animated Switch
 * 04. Scroll Progress Bar
 * 05. Back to Top Button
 * 06. Counter Animations
 * 07. Points Card Progress Bar Animation
 * 08. Comparison Table Sticky Header
 * 09. Smooth Anchor Scrolling
 * 10. Cookie Banner
 * 11. Entry Point
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   01. PET TYPE TOGGLE
   Filters the breed table rows and adjusts
   price notes based on selected pet type.
   ───────────────────────────────────────────── */
function initPetToggle() {
  const btns = document.querySelectorAll('.pet-toggle-btn');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // For now the toggle is cosmetic — a future backend
      // could swap price tables per pet type. We show a toast.
      const pet = btn.dataset.pet;
      const labels = { dog: 'Dog', cat: 'Cat', both: 'All Pet' };
      if (window.PawSpa) {
        window.PawSpa.showToast(
          `Showing ${labels[pet]} pricing. Prices may vary by breed and coat type.`,
          'info'
        );
      }
    });
  });
}

/* ─────────────────────────────────────────────
   02. BILLING TOGGLE (Single vs Bundle)
   Switches package card prices between per-visit
   and 5-visit bundle rates with a smooth count-up.
   ───────────────────────────────────────────── */
function initBillingToggle() {
  const btns        = document.querySelectorAll('.billing-btn');
  const priceEls    = document.querySelectorAll('.pkg-price[data-single]');
  const bundleNotes = document.querySelectorAll('.pkg-price__bundle-note');
  const regularNotes= document.querySelectorAll('.pkg-price__note');

  if (!btns.length) return;

  /**
   * Format a number with Indian comma grouping.
   * @param {number} n
   * @returns {string}
   */
  const fmt = (n) => n.toLocaleString('en-IN');

  /**
   * Animate a price element from its current displayed value
   * to a new target value.
   * @param {HTMLElement} el - the .pkg-price__amount element
   * @param {number}      target
   */
  const animatePrice = (el, target) => {
    const current  = parseInt(el.textContent.replace(/,/g, ''), 10) || 0;
    const duration = 400; // ms
    const start    = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(current + (target - current) * eased);
      el.textContent = fmt(value);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const isBundle = btn.dataset.billing === 'bundle';

      // Update each price card
      priceEls.forEach(priceWrap => {
        const amountEl = priceWrap.querySelector('.pkg-price__amount');
        if (!amountEl) return;

        const singleVal = parseInt(priceWrap.dataset.single, 10);
        const bundleVal = parseInt(priceWrap.dataset.bundle, 10);
        const target    = isBundle ? bundleVal : singleVal;

        animatePrice(amountEl, target);
      });

      // Show / hide bundle notes
      bundleNotes.forEach(n => {
        n.style.display = isBundle ? 'block' : 'none';
      });
      regularNotes.forEach(n => {
        n.style.display = isBundle ? 'none' : 'block';
      });

      // Toast confirmation
      if (window.PawSpa) {
        window.PawSpa.showToast(
          isBundle
            ? '5-visit bundle prices shown — save 15% on every package! 🎉'
            : 'Single-visit prices shown.',
          isBundle ? 'success' : 'info'
        );
      }
    });
  });
}

/* ─────────────────────────────────────────────
   03. SCROLL PROGRESS BAR
   ───────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'pricing-scroll-prog';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:3px;width:0%;
    background:linear-gradient(135deg,#3E7C59,#7ED1C6);
    z-index:9999;transition:width 0.08s linear;pointer-events:none;
  `;
  document.body.appendChild(bar);

  const update = () => {
    const scrollTop = window.scrollY;
    const docH      = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docH > 0 ? `${(scrollTop / docH) * 100}%` : '0%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────
   04. BACK TO TOP BUTTON
   ───────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   05. COUNTER ANIMATIONS
   Triggers animated number count-up when stat
   elements scroll into view.
   ───────────────────────────────────────────── */
function initCounters() {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.counter, 10);
      const suffix  = el.dataset.suffix || '';
      const duration= 2000;
      const start   = performance.now();

      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-IN') + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   06. POINTS CARD PROGRESS BAR
   Animates the loyalty progress bar fill
   when the loyalty section enters viewport.
   ───────────────────────────────────────────── */
function initProgressBar() {
  const fill = document.querySelector('.points-card__progress-fill');
  if (!fill) return;

  const targetWidth = fill.style.width || '74%';
  fill.style.width = '0%';

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => { fill.style.width = targetWidth; }, 200);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  observer.observe(fill.closest('.points-card') || fill);
}

/* ─────────────────────────────────────────────
   07. COMPARISON TABLE — STICKY COLUMN HEADERS
   On scroll, adds a shadow to the comparison
   table header row so it reads cleanly over
   the scrolling body rows on mobile.
   ───────────────────────────────────────────── */
function initCompTableShadow() {
  const wrapper = document.querySelector('.comp-table-wrap');
  if (!wrapper) return;

  wrapper.addEventListener('scroll', () => {
    const thead = wrapper.querySelector('thead');
    if (thead) {
      thead.style.boxShadow = wrapper.scrollTop > 0
        ? '0 4px 12px rgba(0,0,0,0.08)'
        : 'none';
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   08. SMOOTH ANCHOR SCROLLING
   Handles in-page anchor links with proper
   offset for the fixed navbar.
   ───────────────────────────────────────────── */
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────
   09. COOKIE BANNER
   ───────────────────────────────────────────── */
function initCookieBanner() {
  if (localStorage.getItem('pawspa-cookies-accepted')) return;
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  banner.style.display = 'flex';
  const btn = banner.querySelector('[data-cookie-accept]');
  if (btn) {
    btn.addEventListener('click', () => {
      localStorage.setItem('pawspa-cookies-accepted', 'true');
      banner.style.opacity    = '0';
      banner.style.transition = 'opacity 0.3s ease';
      setTimeout(() => banner.remove(), 320);
    });
  }
}

/* ─────────────────────────────────────────────
   10. PACKAGE CARD HOVER TILT (desktop only)
   ───────────────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.pkg-card:not(.pkg-card--popular), .mem-card:not(.mem-card--popular), .addon-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const rotX = ((y - rect.height / 2) / rect.height) * -4;
      const rotY = ((x - rect.width  / 2) / rect.width)  *  4;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────────
   11. QUICK REF BAR — HORIZONTAL SCROLL HINT
   On mobile, shows a subtle gradient to hint
   that the quick-ref bar scrolls horizontally.
   ───────────────────────────────────────────── */
function initQuickRefScroll() {
  const inner = document.querySelector('.quick-ref__inner');
  if (!inner) return;

  // Only relevant on mobile where flex-wrap kicks in
  // The bar itself is already responsive so this is cosmetic
}

/* ─────────────────────────────────────────────
   12. ENTRY POINT
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPetToggle();
  initBillingToggle();
  initScrollProgress();
  initBackToTop();
  initCounters();
  initProgressBar();
  initCompTableShadow();
  initAnchorScroll();
  initCookieBanner();
  initCardTilt();

  // Re-init Lucide icons after component load
  if (window.lucide) window.lucide.createIcons();
});
