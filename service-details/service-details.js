/**
 * ============================================================
 * PawSpa — service-details.js
 * Shared JavaScript for ALL six service detail pages.
 * Global features (theme, modals, AOS, etc.) live in global.js.
 *
 * Table of Contents:
 * 01. Gallery Viewer (primary + thumbnails + lightbox)
 * 02. Sticky Sidebar Booking Form (mini quick-book)
 * 03. Rating Bars Animate-In
 * 04. Scroll Progress Bar
 * 05. Back to Top Button
 * 06. FAQ Accordion (page-level wire-up)
 * 07. Related Services Hover Tilt
 * 08. Sidebar Sticky Behaviour (mobile collapse)
 * 09. Image Fade-In on Load
 * 10. Quick-Book Pre-fill (service name → modal)
 * 11. Cookie Banner
 * 12. Entry Point
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   01. GALLERY VIEWER
   Controls the primary image display area and
   thumbnail switching. Also wires the primary
   image to open in the global lightbox.
   ───────────────────────────────────────────── */
function initGallery() {
  const primary     = document.querySelector('.sd-gallery__primary img');
  const primaryWrap = document.querySelector('.sd-gallery__primary');
  const thumbs      = document.querySelectorAll('.sd-gallery__thumb');

  if (!primary || !thumbs.length) return;

  /**
   * Switch the primary image to the clicked thumbnail.
   * @param {HTMLElement} thumb
   */
  const activateThumb = (thumb) => {
    const src = thumb.dataset.src || thumb.querySelector('img')?.src;
    const alt = thumb.dataset.alt || thumb.querySelector('img')?.alt || '';
    if (!src) return;

    // Crossfade primary image
    primary.style.opacity = '0';
    primary.style.transform = 'scale(0.98)';

    setTimeout(() => {
      primary.src = src;
      primary.alt = alt;
      primary.style.opacity   = '1';
      primary.style.transform = 'scale(1)';
    }, 200);

    // Update active thumb
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  };

  // Thumb click
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => activateThumb(thumb));
    thumb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateThumb(thumb);
      }
    });
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('aria-label', `View image: ${thumb.dataset.alt || 'Gallery image'}`);
  });

  // Activate first thumb by default
  if (thumbs[0]) thumbs[0].classList.add('active');

  // Primary image transition styles
  primary.style.transition = 'opacity 0.2s ease, transform 0.3s ease';

  // Primary image → open lightbox
  if (primaryWrap) {
    primaryWrap.style.cursor = 'zoom-in';
    primaryWrap.addEventListener('click', () => {
      openLightbox(primary.src, primary.alt);
    });

    primaryWrap.addEventListener('keydown', e => {
      if (e.key === 'Enter') openLightbox(primary.src, primary.alt);
    });
    primaryWrap.setAttribute('tabindex', '0');
    primaryWrap.setAttribute('role', 'button');
    primaryWrap.setAttribute('aria-label', 'Click to view full image');
  }
}

/**
 * Opens the page-level lightbox with a given image.
 * Falls back gracefully if global lightbox isn't available.
 * @param {string} src
 * @param {string} alt
 */
function openLightbox(src, alt) {
  let lb = document.getElementById('sd-lightbox');

  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'sd-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image lightbox');
    lb.style.cssText = `
      position:fixed;inset:0;z-index:1000;
      background:rgba(0,0,0,0.92);
      display:flex;align-items:center;justify-content:center;
      cursor:zoom-out;
      animation:lbIn 0.25s ease both;
    `;

    // Inject keyframe
    if (!document.getElementById('lb-keyframes')) {
      const style = document.createElement('style');
      style.id = 'lb-keyframes';
      style.textContent = `
        @keyframes lbIn  { from{opacity:0}  to{opacity:1} }
        @keyframes lbOut { from{opacity:1}  to{opacity:0} }
      `;
      document.head.appendChild(style);
    }

    lb.innerHTML = `
      <img id="sd-lb-img" src="" alt=""
        style="max-width:90vw;max-height:88vh;border-radius:12px;
               box-shadow:0 32px 80px rgba(0,0,0,0.6);
               animation:lbIn 0.3s cubic-bezier(0.34,1.06,0.64,1) both;
               cursor:default;"
        onclick="event.stopPropagation()" />
      <button id="sd-lb-close"
        aria-label="Close lightbox"
        style="position:absolute;top:1.5rem;right:1.5rem;
               background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);
               border-radius:8px;width:44px;height:44px;
               display:flex;align-items:center;justify-content:center;
               cursor:pointer;color:#fff;font-size:1.25rem;line-height:1;">✕</button>
    `;
    document.body.appendChild(lb);

    const closeLb = () => {
      lb.style.animation = 'lbOut 0.2s ease forwards';
      setTimeout(() => lb.remove(), 200);
      document.body.style.overflow = '';
    };

    lb.addEventListener('click', closeLb);
    lb.querySelector('#sd-lb-close').addEventListener('click', closeLb);
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { closeLb(); document.removeEventListener('keydown', handler); }
    });
  }

  const img = lb.querySelector('#sd-lb-img');
  if (img) { img.src = src; img.alt = alt; }
  document.body.style.overflow = 'hidden';
}

/* ─────────────────────────────────────────────
   02. STICKY SIDEBAR BOOKING FORM
   Mini quick-book form inside the sidebar card.
   On submit → opens the full booking modal.
   ───────────────────────────────────────────── */
function initSidebarForm() {
  const form      = document.getElementById('sd-sidebar-form');
  const submitBtn = document.getElementById('sd-sidebar-submit');

  if (!form || !submitBtn) return;

  submitBtn.addEventListener('click', () => {
    // Gather sidebar selections and pass to global booking modal
    const petVal  = form.querySelector('#sd-pet-type')?.value;
    const dateVal = form.querySelector('#sd-date')?.value;
    const timeVal = form.querySelector('#sd-time')?.value;

    // Open global modal
    if (window.PawSpa) {
      window.PawSpa.openModal('booking-modal');

      // Pre-fill modal fields after it opens
      setTimeout(() => {
        const modalPet  = document.getElementById('b-pet');
        const modalDate = document.getElementById('b-date');
        const modalTime = document.getElementById('b-time');
        const modalSvc  = document.getElementById('b-service');

        if (modalPet  && petVal)  modalPet.value  = petVal;
        if (modalDate && dateVal) modalDate.value = dateVal;
        if (modalTime && timeVal) {
          Array.from(modalTime.options).forEach(opt => {
            if (opt.value === timeVal || opt.textContent.includes(timeVal)) {
              modalTime.value = opt.value;
            }
          });
        }

        // Pre-fill service from page data attribute
        const serviceName = document.body.dataset.service;
        if (modalSvc && serviceName) {
          Array.from(modalSvc.options).forEach(opt => {
            if (opt.value === serviceName) modalSvc.value = serviceName;
          });
        }
      }, 150);
    }
  });

  // Set minimum date to today
  const dateInput = form.querySelector('#sd-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }
}

/* ─────────────────────────────────────────────
   03. RATING BARS ANIMATE-IN
   Triggers the CSS width transition on rating
   bars when the reviews section enters viewport.
   ───────────────────────────────────────────── */
function initRatingBars() {
  const bars = document.querySelectorAll('.sd-rating-bar__fill');
  if (!bars.length) return;

  const section = document.querySelector('.sd-section--reviews');
  if (!section) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      bars.forEach(bar => {
        // Read target width from inline style --fill-width custom property
        const target = bar.dataset.fill || bar.style.getPropertyValue('--fill-width') || '80%';
        bar.style.setProperty('--fill-width', target);
        bar.classList.add('animated');
        bar.style.width = target;
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

/* ─────────────────────────────────────────────
   04. SCROLL PROGRESS BAR
   Thin gradient bar fixed at the top tracking
   how far down the page the user has scrolled.
   ───────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'sd-scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = `
    position:fixed;top:0;left:0;height:3px;width:0%;
    background:linear-gradient(135deg,#3E7C59,#7ED1C6);
    z-index:9999;transition:width 0.08s linear;pointer-events:none;
  `;
  document.body.appendChild(bar);

  const update = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width  = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────────────
   05. BACK TO TOP BUTTON
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
   06. FAQ ACCORDION
   The global accordion init handles open/close.
   This function sets the first item open on load.
   ───────────────────────────────────────────── */
function initFAQ() {
  const firstItem = document.querySelector('.sd-faq .accordion-item');
  if (firstItem) {
    firstItem.classList.add('open');
  }
}

/* ─────────────────────────────────────────────
   07. RELATED SERVICES HOVER TILT
   Subtle 3D perspective tilt on desktop only.
   ───────────────────────────────────────────── */
function initRelatedTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.sd-related-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const rotX = ((y - rect.height / 2) / rect.height) * -4;
      const rotY = ((x - rect.width  / 2) / rect.width)  *  4;
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─────────────────────────────────────────────
   08. SIDEBAR — MOBILE COLLAPSE TOGGLE
   On mobile the sidebar moves below the main
   content. We add a collapse toggle for the
   booking card so it doesn't take up too much
   vertical space on small screens.
   ───────────────────────────────────────────── */
function initSidebarCollapse() {
  if (window.innerWidth > 1023) return; // only on mobile/tablet

  const bookingCard = document.querySelector('.sd-booking-card');
  const head        = document.querySelector('.sd-booking-card__head');
  if (!bookingCard || !head) return;

  // Add toggle indicator
  const indicator = document.createElement('span');
  indicator.style.cssText = `
    font-size:1rem;opacity:0.7;transition:transform 0.25s;display:inline-block;margin-left:auto;
  `;
  indicator.textContent = '▲';
  head.style.cursor = 'pointer';
  head.style.display = 'flex';
  head.style.alignItems = 'center';
  head.appendChild(indicator);

  let open = true;

  const toggleable = bookingCard.querySelectorAll(
    '.sd-booking-card__price, .sd-booking-card__form, .sd-booking-card__perks'
  );

  head.addEventListener('click', () => {
    open = !open;
    toggleable.forEach(el => {
      el.style.display = open ? '' : 'none';
    });
    indicator.style.transform = open ? '' : 'rotate(180deg)';
  });
}

/* ─────────────────────────────────────────────
   09. IMAGE FADE-IN ON LOAD
   Prevents FOUC on slow connections by fading
   images in after they decode.
   ───────────────────────────────────────────── */
function initImageFadeIn() {
  const images = document.querySelectorAll(
    '.sd-gallery__primary img, .sd-gallery__thumb img, .sd-hero__img, .sd-related-card__img, .sd-review-card__avatar'
  );

  images.forEach(img => {
    img.style.opacity    = '0';
    img.style.transition = 'opacity 0.4s ease';

    const reveal = () => { img.style.opacity = '1'; };

    if (img.complete && img.naturalWidth) {
      reveal();
    } else {
      img.addEventListener('load',  reveal);
      img.addEventListener('error', () => { img.style.opacity = '0.35'; });
    }
  });
}

/* ─────────────────────────────────────────────
   10. QUICK-BOOK CTA → PRE-FILL MODAL
   All "Book Now" / .btn-book-now buttons on the
   page open the global modal and pre-fill the
   service field using data-service on <body>.
   ───────────────────────────────────────────── */
function initQuickBookButtons() {
  document.querySelectorAll('[data-book-now], .btn-book-now').forEach(btn => {
    // Remove any pre-existing listeners attached by global.js to avoid double-fire
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.PawSpa) return;
      window.PawSpa.openModal('booking-modal');

      // Pre-fill service
      setTimeout(() => {
        const serviceKey  = document.body.dataset.service;
        const modalSelect = document.getElementById('b-service');
        if (modalSelect && serviceKey) {
          modalSelect.value = serviceKey;
        }
      }, 120);
    });
  });
}

/* ─────────────────────────────────────────────
   11. COOKIE BANNER
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
   12. ENTRY POINT
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initSidebarForm();
  initRatingBars();
  initScrollProgress();
  initBackToTop();
  initFAQ();
  initRelatedTilt();
  initSidebarCollapse();
  initImageFadeIn();
  initQuickBookButtons();
  initCookieBanner();

  // Initialise Lucide icons after dynamic content loads
  if (window.lucide) window.lucide.createIcons();
});
