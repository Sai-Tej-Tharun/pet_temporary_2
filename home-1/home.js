/**
 * ============================================================
 * PawSpa — home.js
 * Page-specific JS for Home Page 1.
 * All core functionality lives in global.js.
 * This file handles page-specific enhancements only.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   PAGE-SPECIFIC INIT
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Initialise Lucide icons (after DOM is ready) ────
  if (window.lucide) {
    lucide.createIcons();
  }

  // ── 2. Hero headline stagger ───────────────────────────
  initHeroEntrance();

  // ── 3. Bubble parallax on mouse move ──────────────────
  initBubbleParallax();

  // ── 4. Dog blinking animation (CSS fallback) ──────────
  initDogBlink();

  // ── 5. Product "Add to Cart" micro-interaction ─────────
  initCartButtons();

  // ── 6. Pricing toggle on packages ─────────────────────
  initPackageHover();

});

/* ─────────────────────────────────────────────
   1. HERO ENTRANCE ANIMATION
   Adds a sequential entrance stagger to the
   hero copy elements.
   ───────────────────────────────────────────── */
function initHeroEntrance() {
  const els = document.querySelectorAll(
    '.hero-badge, .hero-headline, .hero-sub, .hero-ctas, .hero-trust, .hero-proof'
  );

  els.forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${0.2 + i * 0.12}s, transform 0.6s ease ${0.2 + i * 0.12}s`;

    // Trigger on next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ─────────────────────────────────────────────
   2. BUBBLE PARALLAX ON MOUSE MOVE
   The soap bubbles in the hero subtly shift
   as the user moves their cursor.
   ───────────────────────────────────────────── */
function initBubbleParallax() {
  const scene = document.querySelector('.pet-scene');
  if (!scene) return;

  const bubbles = scene.querySelectorAll('.bubble');
  const floaties = scene.querySelectorAll('.floaty');

  document.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth  - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 20;

    bubbles.forEach((b, i) => {
      const factor = (i % 3 + 1) * 0.3;
      b.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });

    floaties.forEach((f, i) => {
      const factor = (i % 4 + 1) * 0.2;
      f.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  });
}

/* ─────────────────────────────────────────────
   3. DOG BLINK
   Programmatically creates a blinking effect
   by temporarily scaling the dog's eye pupils.
   ───────────────────────────────────────────── */
function initDogBlink() {
  const dogSvg = document.querySelector('.dog-svg');
  if (!dogSvg) return;

  // Target the pupil ellipses (5th and 10th ellipse in the SVG)
  // We find them via their specific positions in the SVG
  const pupils = dogSvg.querySelectorAll('ellipse[rx="7.5"]');

  function blink() {
    pupils.forEach(p => {
      p.style.transition = 'transform 0.05s ease';
      p.style.transformBox = 'fill-box';
      p.style.transformOrigin = 'center';
      p.style.transform = 'scaleY(0.1)';
    });

    setTimeout(() => {
      pupils.forEach(p => {
        p.style.transform = 'scaleY(1)';
      });
    }, 120);

    // Schedule next blink (random interval 2–5s)
    const nextBlink = 2000 + Math.random() * 3000;
    setTimeout(blink, nextBlink);
  }

  // Start blinking after 1s
  setTimeout(blink, 1000);
}

/* ─────────────────────────────────────────────
   4. CART BUTTON MICRO-INTERACTION
   Shows a playful "Added!" confirmation on
   product card Add to Cart buttons.
   ───────────────────────────────────────────── */
function initCartButtons() {
  document.querySelectorAll('.prod-card .btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const original = this.textContent;
      this.textContent = '✓ Added!';
      this.style.background = 'var(--paw-green-dark)';
      this.disabled = true;

      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
        this.disabled = false;
      }, 1800);

      // Show a toast
      if (window.PawSpa) {
        window.PawSpa.showToast('Added to cart! 🛒', 'success');
      }
    });
  });
}

/* ─────────────────────────────────────────────
   5. PACKAGE CARD HOVER PRICE HIGHLIGHT
   ───────────────────────────────────────────── */
function initPackageHover() {
  document.querySelectorAll('.pkg-card').forEach(card => {
    const price = card.querySelector('.pkg-price');
    if (!price) return;

    card.addEventListener('mouseenter', () => {
      price.style.transform  = 'scale(1.12)';
      price.style.transition = 'transform 0.3s var(--ease-bounce, cubic-bezier(0.34,1.56,0.64,1))';
    });

    card.addEventListener('mouseleave', () => {
      price.style.transform = 'scale(1)';
    });
  });
}
