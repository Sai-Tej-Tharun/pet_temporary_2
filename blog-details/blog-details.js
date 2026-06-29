/**
 * ============================================================
 * PawSpa — blog-details.js
 * Shared JavaScript for all 6 blog detail pages.
 *
 * Features:
 *  1.  Reading progress bar
 *  2.  Active TOC link highlighting (IntersectionObserver)
 *  3.  Floating share bar visibility
 *  4.  Share buttons (Twitter, Facebook, WhatsApp, copy link)
 *  5.  Inline share buttons (same logic)
 *  6.  Sidebar newsletter form
 *  7.  Smooth scroll for TOC anchor links
 *  8.  Estimated read time injector
 *  9.  Image lightbox for article images
 * 10.  Book Now button wiring
 * 11.  Scroll-reveal animations (AOS-lite)
 * 12.  Navbar + footer component loader
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   1. READING PROGRESS BAR
   Updates the width of .reading-progress
   as the user scrolls through the article.
   ───────────────────────────────────────────── */

function initReadingProgress() {
  const bar     = document.querySelector('.reading-progress');
  const article = document.querySelector('.article-prose');
  if (!bar || !article) return;

  function update() {
    const articleTop    = article.getBoundingClientRect().top + window.scrollY;
    const articleHeight = article.offsetHeight;
    const windowHeight  = window.innerHeight;
    const scrolled      = window.scrollY;

    const start    = articleTop - windowHeight * 0.2;
    const end      = articleTop + articleHeight - windowHeight;
    const progress = Math.min(Math.max((scrolled - start) / (end - start), 0), 1);

    bar.style.width = (progress * 100) + '%';
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* ─────────────────────────────────────────────
   2. TABLE OF CONTENTS — ACTIVE LINK
   Watches section headings; as each enters the
   viewport the matching TOC link gets .toc-active
   ───────────────────────────────────────────── */

function initTocHighlight() {
  // Collect all TOC links from both inline & sidebar TOCs
  const tocLinks = document.querySelectorAll('.article-toc-link, .sidebar-toc-link');
  if (!tocLinks.length) return;

  // Collect all headings they point to
  const headings = [];
  tocLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) headings.push({ id, el });
    }
  });

  if (!headings.length) return;

  const setActive = (id) => {
    tocLinks.forEach(link => {
      const matches = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('toc-active', matches);
    });
  };

  // IntersectionObserver approach — fires when heading enters top 25% of viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  }, {
    rootMargin: '-10% 0px -70% 0px',
    threshold: 0,
  });

  headings.forEach(({ el }) => observer.observe(el));
}

/* ─────────────────────────────────────────────
   3. FLOATING SHARE BAR VISIBILITY
   Shows after user scrolls past the hero.
   ───────────────────────────────────────────── */

function initFloatingShare() {
  const floatingShare = document.querySelector('.floating-share');
  if (!floatingShare) return;

  const hero = document.querySelector('.article-hero');
  const threshold = hero ? hero.offsetHeight : 400;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        floatingShare.classList.toggle('visible', window.scrollY > threshold);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   4 & 5. SHARE BUTTONS
   Handles all share buttons: floating + inline.
   ───────────────────────────────────────────── */

function initShareButtons() {
  const currentUrl   = encodeURIComponent(window.location.href);
  const currentTitle = encodeURIComponent(document.title);

  /**
   * Copies the page URL to clipboard and shows feedback.
   * @param {HTMLElement} btn
   */
  const copyLink = async (btn) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      btn.classList.add('copied');
      const original = btn.innerHTML;
      btn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      if (window.PawSpa?.showToast) {
        window.PawSpa.showToast('Link copied to clipboard!', 'success', 2500);
      }
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
      }, 2500);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      if (window.PawSpa?.showToast) {
        window.PawSpa.showToast('Link copied!', 'success', 2500);
      }
    }
  };

  // Wire all share buttons
  document.querySelectorAll('[data-share]').forEach(btn => {
    const type = btn.dataset.share;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      switch (type) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${currentUrl}&text=${currentTitle}`,
            '_blank', 'noopener,noreferrer,width=600,height=400'
          );
          break;

        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
            '_blank', 'noopener,noreferrer,width=600,height=500'
          );
          break;

        case 'whatsapp':
          window.open(
            `https://api.whatsapp.com/send?text=${currentTitle}%20${currentUrl}`,
            '_blank', 'noopener,noreferrer'
          );
          break;

        case 'copy':
          await copyLink(btn);
          break;

        default:
          break;
      }
    });
  });

  // Also handle native Web Share API for mobile
  const nativeShareBtn = document.querySelector('[data-share-native]');
  if (nativeShareBtn && navigator.share) {
    nativeShareBtn.style.display = 'inline-flex';
    nativeShareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: document.title,
          url:   window.location.href,
        });
      } catch {
        // User cancelled — do nothing
      }
    });
  }
}

/* ─────────────────────────────────────────────
   6. SIDEBAR NEWSLETTER FORM
   ───────────────────────────────────────────── */

function initSidebarNewsletter() {
  const form = document.getElementById('sidebar-newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input  = form.querySelector('input[type="email"]');
    const btn    = form.querySelector('button[type="submit"]');
    const email  = input?.value.trim();

    // Validate
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (input) input.style.borderColor = '#e05252';
      input?.focus();
      if (window.PawSpa?.showToast) {
        window.PawSpa.showToast('Please enter a valid email.', 'error');
      }
      return;
    }

    input.style.borderColor = '';
    const origText = btn?.textContent || 'Subscribe';
    if (btn) { btn.disabled = true; btn.textContent = 'Subscribing…'; }

    await new Promise(r => setTimeout(r, 700));

    if (window.PawSpa?.showToast) {
      window.PawSpa.showToast('🐾 Subscribed! Weekly tips incoming.', 'success', 5000);
    }
    form.reset();
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  });
}

/* ─────────────────────────────────────────────
   7. SMOOTH SCROLL FOR TOC ANCHOR LINKS
   ───────────────────────────────────────────── */

function initTocSmoothScroll() {
  document.querySelectorAll('.article-toc-link, .sidebar-toc-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();

      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '72'
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────
   8. ESTIMATED READ TIME INJECTOR
   Counts words in .article-prose and injects
   the read time into [data-read-time] elements.
   ───────────────────────────────────────────── */

function initReadTime() {
  const prose = document.querySelector('.article-prose');
  const targets = document.querySelectorAll('[data-read-time]');
  if (!prose || !targets.length) return;

  const text  = prose.innerText || prose.textContent || '';
  const words = text.trim().split(/\s+/).length;
  const mins  = Math.max(1, Math.round(words / 220)); // avg 220 wpm

  targets.forEach(el => {
    el.textContent = `${mins} min read`;
  });
}

/* ─────────────────────────────────────────────
   9. IMAGE LIGHTBOX FOR ARTICLE IMAGES
   Clicking any .article-img opens a lightbox.
   ───────────────────────────────────────────── */

function initArticleLightbox() {
  const images = document.querySelectorAll('.article-img[data-lightbox], .article-prose img');
  if (!images.length) return;

  // Create lightbox element
  let lb = document.getElementById('article-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'article-lightbox';
    lb.style.cssText = `
      position:fixed; inset:0; z-index:999;
      background:rgba(0,0,0,0.94); display:none;
      align-items:center; justify-content:center;
      cursor:zoom-out; padding:1.5rem;
    `;
    lb.innerHTML = `
      <img id="lb-article-img" src="" alt="" style="
        max-width:90vw; max-height:88vh;
        border-radius:12px;
        box-shadow:0 32px 80px rgba(0,0,0,0.8);
        object-fit:contain;
      ">
      <button id="lb-article-close" aria-label="Close image"
        style="position:absolute;top:1.5rem;right:1.5rem;
               background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);
               border-radius:8px;width:44px;height:44px;
               display:flex;align-items:center;justify-content:center;
               cursor:pointer;color:#fff;font-size:1.25rem;">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    document.body.appendChild(lb);
  }

  const lbImg   = lb.querySelector('#lb-article-img');
  const lbClose = lb.querySelector('#lb-article-close');

  const open = (src, alt) => {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lb.style.display = 'none';
    document.body.style.overflow = '';
  };

  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(img.src || img.dataset.src, img.alt));
  });

  lb.addEventListener('click', e => { if (e.target === lb || e.target === lbClose) close(); });
  lbClose?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ─────────────────────────────────────────────
   10. BOOK NOW BUTTON WIRING
   ───────────────────────────────────────────── */

function initBookNow() {
  document.querySelectorAll('[data-book-now]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.PawSpa?.openModal) {
        window.PawSpa.openModal('booking-modal');
      }
    });
  });
}

/* ─────────────────────────────────────────────
   11. SCROLL-REVEAL ANIMATIONS
   Simple IntersectionObserver-based reveal.
   ───────────────────────────────────────────── */

function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = document.querySelectorAll(
    '.article-callout, .article-stats-strip, .article-author-card, ' +
    '.related-card, .article-nav-link, .sidebar-widget'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.04}s, transform 0.5s ease ${i * 0.04}s`;
    observer.observe(el);
  });
}

/* ─────────────────────────────────────────────
   12. COMPONENT LOADER
   Loads navbar and footer from ../components/
   Calls global.js init hooks after injection.
   ───────────────────────────────────────────── */

async function loadComponent(url, selector, callback) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Failed: ${url}`);
    mount.innerHTML = await res.text();
    if (typeof callback === 'function') callback();
  } catch (err) {
    console.warn('[BlogDetails] Component load error:', err.message);
  }
}

async function loadComponents() {
  // blog-details pages are one level deep: blog-details/
  const base = '../components/';

  await loadComponent(`${base}navbar.html`,  '#navbar-mount',  () => {
    // Wire theme/RTL toggles, dropdowns, mobile menu from global.js if available
    if (typeof window.initNavbarComponent === 'function') {
      window.initNavbarComponent();
    }
  });

  await loadComponent(`${base}footer.html`, '#footer-mount', () => {
    if (typeof window.initFooterComponent === 'function') {
      window.initFooterComponent();
    }
    // Update copyright year
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
}

/* ─────────────────────────────────────────────
   13. ENTRY POINT
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  // Load shared components first (navbar/footer)
  // global.js handles this if it's loaded; otherwise we load manually
  if (!document.querySelector('.navbar')) {
    await loadComponents();
  }

  // Run all features
  initReadingProgress();
  initReadTime();
  initTocHighlight();
  initTocSmoothScroll();
  initFloatingShare();
  initShareButtons();
  initSidebarNewsletter();
  initArticleLightbox();
  initBookNow();

  // Small RAF delay so layout is stable before scroll animations
  requestAnimationFrame(() => {
    initScrollReveal();
  });
});
