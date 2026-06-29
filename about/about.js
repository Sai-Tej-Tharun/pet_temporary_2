/**
 * ============================================================
 * PawSpa — about/about.js
 * Page-specific JS for the About Us page.
 * Handles: timeline reveal, team card tilt, parallax blobs,
 * story image reveal, value card stagger.
 *
 * Core features (navbar, footer, AOS, modals, counters,
 * smooth scroll, back-to-top, cookie banner) are handled
 * by ../global-js/global.js — loaded first.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   1. HERO BLOB PARALLAX (desktop only)
   ───────────────────────────────────────────── */

function initHeroParallax() {
  if (window.matchMedia('(hover: none)').matches) return;

  const hero  = document.querySelector('.about-hero');
  const blob1 = document.querySelector('.ah-blob--1');
  const blob2 = document.querySelector('.ah-blob--2');
  if (!hero || !blob1) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width  - 0.5;
    const yPct = (e.clientY - rect.top)  / rect.height - 0.5;

    blob1.style.transform  = `translate(${xPct * 40}px, ${yPct * 25}px)`;
    blob1.style.transition = 'transform 0.7s ease';
    if (blob2) {
      blob2.style.transform  = `translate(${xPct * -25}px, ${yPct * 35}px)`;
      blob2.style.transition = 'transform 0.7s ease';
    }
  });
}

/* ─────────────────────────────────────────────
   2. TIMELINE — ALTERNATING REVEAL ON SCROLL
   Adds a .tl-visible class when each item enters
   the viewport, triggering CSS transitions.
   ───────────────────────────────────────────── */

function initTimelineReveal() {
  const items = document.querySelectorAll('.tl-item');
  if (!items.length) return;

  /* Respect prefers-reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('tl-visible'));
    return;
  }

  /* Set initial hidden state via inline style
     (CSS handles the transition via .tl-visible) */
  items.forEach((item, i) => {
    const isLeft = item.classList.contains('tl-item--left');
    item.style.opacity   = '0';
    item.style.transform = `translateX(${isLeft ? '-40px' : '40px'})`;
    item.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   3. TEAM CARD — SUBTLE 3D TILT (desktop only)
   ───────────────────────────────────────────── */

function initTeamCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.team-card:not(.team-card--featured)').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const tiltX  = ((y - cy) / cy) * 6;   // max ±6deg
      const tiltY  = ((x - cx) / cx) * -6;

      card.style.transform    = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
      card.style.transition   = 'transform 0.1s ease';
      card.style.willChange   = 'transform';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s ease';
      card.style.willChange = '';
    });
  });
}

/* ─────────────────────────────────────────────
   4. VALUE CARDS — STAGGERED ENTRY ANIMATION
   Builds on top of global.js AOS for a tighter
   staggered reveal specific to this grid.
   ───────────────────────────────────────────── */

function initValueCardsStagger() {
  const cards = document.querySelectorAll('.value-card');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Initially invisible (will be revealed by IntersectionObserver) */
  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => observer.observe(card));
}

/* ─────────────────────────────────────────────
   5. STORY SECTION — IMAGE ENTRANCE
   Adds a clip-path reveal when story image
   scrolls into view.
   ───────────────────────────────────────────── */

function initStoryImageReveal() {
  const img = document.querySelector('.sv-img');
  if (!img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  img.style.clipPath  = 'inset(0 100% 0 0)';
  img.style.transition = 'clip-path 0.9s cubic-bezier(0.77, 0, 0.175, 1)';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.style.clipPath = 'inset(0 0% 0 0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(img);
}

/* ─────────────────────────────────────────────
   6. CERT ITEMS — SEQUENTIAL REVEAL
   ───────────────────────────────────────────── */

function initCertReveal() {
  const items = document.querySelectorAll('.cert-item');
  if (!items.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  items.forEach((item, i) => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `opacity 0.45s ease ${i * 0.1}s, transform 0.45s ease ${i * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => observer.observe(item));
}

/* ─────────────────────────────────────────────
   7. PULL QUOTE — TYPING CURSOR EFFECT
   Adds a blinking cursor after the quote text
   for a subtle editorial touch.
   ───────────────────────────────────────────── */

function initQuoteCursor() {
  const quote = document.querySelector('.story-quote p');
  if (!quote) return;

  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.cssText = `
    color: var(--paw-green);
    font-weight: 300;
    margin-left: 2px;
    animation: cursorBlink 1.1s step-end infinite;
    display: inline-block;
  `;
  cursor.setAttribute('aria-hidden', 'true');

  /* Inject keyframes once */
  if (!document.getElementById('cursor-kf')) {
    const style = document.createElement('style');
    style.id = 'cursor-kf';
    style.textContent = `
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  quote.appendChild(cursor);

  /* Remove cursor after 6 seconds (it's a decoration, not a real input) */
  setTimeout(() => {
    cursor.style.transition = 'opacity 0.5s ease';
    cursor.style.opacity    = '0';
    setTimeout(() => cursor.remove(), 500);
  }, 6000);
}

/* ─────────────────────────────────────────────
   8. SMOOTH SCROLL — "#our-story" anchor
   Supplements global.js smooth scroll for
   the hero CTA "Our Story" button.
   ───────────────────────────────────────────── */

function initAnchorScroll() {
  document.querySelectorAll('a[href="#our-story"], a[href="#team"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 88;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    });
  });
}

/* ─────────────────────────────────────────────
   9. ENTRY POINT
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initHeroParallax();
  initTimelineReveal();
  initTeamCardTilt();
  initValueCardsStagger();
  initStoryImageReveal();
  initCertReveal();
  initQuoteCursor();
  initAnchorScroll();
});
