/**
 * ============================================================
 * PawSpa — services.js
 * Page-specific JS for services.html.
 * Global features (theme, AOS, modals, etc.) live in global.js.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   1. FILTER BAR
   Handles category filtering of service cards
   with a smooth show/hide and ARIA pressed state.
   ───────────────────────────────────────────── */
function initServiceFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const grid       = document.getElementById('svc-grid');
  if (!filterBtns.length || !grid) return;

  const cards = grid.querySelectorAll('.svc-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button + ARIA
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const value = btn.dataset.filter;

      // Filter cards with a subtle fade transition
      cards.forEach((card, i) => {
        const match = value === '*' || card.dataset.category === value;

        if (match) {
          card.style.display = '';
          // Stagger the reveal
          card.style.opacity  = '0';
          card.style.transform = 'translateY(16px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
          }, i * 60);
        } else {
          card.style.transition = 'opacity 0.2s ease';
          card.style.opacity    = '0';
          setTimeout(() => { card.style.display = 'none'; }, 220);
        }
      });
    });
  });
}

/* ─────────────────────────────────────────────
   2. SERVICE CARD KEYBOARD NAVIGATION
   The invisible .svc-card__link covers the card
   for mouse clicks. This ensures keyboard users
   can also activate the card via Enter/Space.
   ───────────────────────────────────────────── */
function initCardKeyboard() {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = card.querySelector('.svc-card__link');
        if (link && link.href) window.location.href = link.href;
      }
    });
  });
}

/* ─────────────────────────────────────────────
   3. QUICK BOOK BUTTONS
   Prevent the invisible full-card link from
   firing when the Quick Book button is clicked,
   and open the booking modal instead.
   ───────────────────────────────────────────── */
function initQuickBookBtns() {
  document.querySelectorAll('.svc-card__quick-book .btn-book-now').forEach(btn => {
    btn.addEventListener('click', e => {
      // Stop the click from bubbling to the card's invisible link overlay
      e.stopPropagation();
      // Pre-select the service in the booking modal if possible
      const card        = btn.closest('.svc-card');
      const serviceTitle = card?.querySelector('.svc-card__title')?.textContent?.trim();
      if (serviceTitle && window.PawSpa) {
        window.PawSpa.openModal('booking-modal');
        // Pre-fill the service select
        setTimeout(() => {
          const sel = document.querySelector('#b-service');
          if (!sel) return;
          // Match option text to service title (case-insensitive partial match)
          Array.from(sel.options).forEach(opt => {
            if (serviceTitle.toLowerCase().includes(opt.text.toLowerCase().split(' ')[0])) {
              sel.value = opt.value;
            }
          });
        }, 120);
      }
    });
  });
}

/* ─────────────────────────────────────────────
   4. BEFORE / AFTER IMAGE SLIDER
   Overrides the global initBeforeAfterSliders
   with a more refined implementation for this
   specific page's .ba-slider elements.
   ───────────────────────────────────────────── */
function initBASliders() {
  document.querySelectorAll('[data-ba-slider]').forEach(slider => {
    const handle     = slider.querySelector('.ba-handle');
    const beforeWrap = slider.querySelector('.ba-before-wrap');
    if (!handle || !beforeWrap) return;

    let dragging = false;

    /**
     * Update slider position based on pointer X.
     * @param {number} x - clientX of pointer
     */
    const update = (x) => {
      const rect = slider.getBoundingClientRect();
      const pct  = Math.min(Math.max((x - rect.left) / rect.width, 0.04), 0.96);
      beforeWrap.style.width = `${pct * 100}%`;
      handle.style.left      = `${pct * 100}%`;
    };

    // Mouse events
    handle.addEventListener('mousedown', e => {
      dragging = true;
      e.preventDefault(); // prevent text selection
    });

    document.addEventListener('mousemove', e => {
      if (dragging) update(e.clientX);
    });

    document.addEventListener('mouseup', () => { dragging = false; });

    // Touch events
    handle.addEventListener('touchstart', () => { dragging = true; }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (dragging) update(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchend', () => { dragging = false; });

    // Set initial handle at 50%
    const setInitial = () => {
      const rect = slider.getBoundingClientRect();
      if (rect.width === 0) return; // not yet visible
      update(rect.left + rect.width * 0.5);
    };

    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(setInitial);

    // Re-set on resize
    window.addEventListener('resize', setInitial, { passive: true });

    // Keyboard accessibility on the handle
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Before and after slider');
    handle.setAttribute('aria-valuemin', '4');
    handle.setAttribute('aria-valuemax', '96');
    handle.setAttribute('aria-valuenow', '50');

    handle.addEventListener('keydown', e => {
      const current = parseFloat(beforeWrap.style.width) || 50;
      const step    = 5;
      let next      = current;
      if (e.key === 'ArrowLeft')  next = Math.max(4,  current - step);
      if (e.key === 'ArrowRight') next = Math.min(96, current + step);
      if (next !== current) {
        e.preventDefault();
        beforeWrap.style.width = `${next}%`;
        handle.style.left      = `${next}%`;
        handle.setAttribute('aria-valuenow', String(Math.round(next)));
      }
    });
  });
}

/* ─────────────────────────────────────────────
   5. SCROLL PROGRESS INDICATOR
   Thin green line at the top of the viewport
   showing page scroll progress.
   ───────────────────────────────────────────── */
function initScrollProgress() {
  // Create element
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: var(--gradient-green);
    z-index: 9999;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  const update = () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = `${progress}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────
   6. SERVICE CARD TILT EFFECT (Desktop only)
   Subtle 3D tilt on mouse move over each card.
   Disabled on touch devices for performance.
   ───────────────────────────────────────────── */
function initCardTilt() {
  // Only enable on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const cx      = rect.width  / 2;
      const cy      = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -5;   // max ±5deg
      const rotateY = ((x - cx) / cx) *  5;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────────
   7. LAZY-LOADED IMAGES — intersection polish
   Adds a fade-in class once images have loaded
   to avoid a jarring FOUC on slow connections.
   ───────────────────────────────────────────── */
function initImageFadeIn() {
  const images = document.querySelectorAll('.svc-card__img, .why-img-main, .why-img-thumb, .ba-after, .ba-before, .strip-img img');

  images.forEach(img => {
    img.style.opacity    = '0';
    img.style.transition = 'opacity 0.45s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => { img.style.opacity = '1'; });
      img.addEventListener('error', () => { img.style.opacity = '0.4'; }); // graceful degradation
    }
  });
}

/* ─────────────────────────────────────────────
   8. STATS BAR — Re-trigger counter when visible
   global.js already sets up counters, but this
   ensures the stats bar figures trigger properly
   since they may be below the fold on first load.
   ───────────────────────────────────────────── */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-pill__num[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el      = entry.target;
      const target  = parseInt(el.dataset.counter, 10);
      const suffix  = el.dataset.suffix || '';
      const duration = 2000;
      const start   = performance.now();

      const update = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target).toLocaleString('en-IN') + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   9. HERO CTA "Explore Services" — smooth scroll
   Ensures the "Explore Services" button scrolls
   smoothly to #services-grid accounting for the
   fixed navbar height.
   ───────────────────────────────────────────── */
function initHeroScroll() {
  const exploreBtn = document.querySelector('a[href="#services-grid"]');
  if (!exploreBtn) return;

  exploreBtn.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById('services-grid');
    if (!target) return;
    const navbarHeight = 88;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   10. ENTRY POINT
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initServiceFilter();
  initCardKeyboard();
  initQuickBookBtns();
  initBASliders();
  initScrollProgress();
  initCardTilt();
  initImageFadeIn();
  initStatCounters();
  initHeroScroll();

  // Re-initialise Lucide icons in case global.js didn't catch them
  if (window.lucide) window.lucide.createIcons();
});
