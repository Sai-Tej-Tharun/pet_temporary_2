/**
 * ============================================================
 * PawSpa — global.js
 * Core site functionality: component loader, theme toggle,
 * RTL, mobile menu, dropdowns, AOS animations, modals,
 * toasts, forms, accordion, tabs, booking modal.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   1. CONSTANTS & STATE
   ───────────────────────────────────────────── */

/** Current page path used to highlight active nav link */
const CURRENT_PATH = window.location.pathname;

/** App-wide state */
const AppState = {
  theme: localStorage.getItem('pawspa-theme') || 'light',
  dir:   localStorage.getItem('pawspa-dir')   || 'ltr',
  mobileMenuOpen: false,
};

/* ─────────────────────────────────────────────
   2. COMPONENT LOADER (Navbar + Footer)
   ───────────────────────────────────────────── */

/**
 * Loads an HTML component into a target element.
 * @param {string} url        - Path to the component HTML file
 * @param {string} selector   - CSS selector for the mount point
 * @param {Function} [callback] - Called after injection
 */
async function loadComponent(url, selector, callback) {
  const mount = document.querySelector(selector);
  if (!mount) return;

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load: ${url}`);
    const html = await res.text();
    mount.innerHTML = html;
    if (typeof callback === 'function') callback();
  } catch (err) {
    console.warn('[PawSpa] Component load error:', err.message);
  }
}

/**
 * Initialises all shared components.
 * Call order matters — navbar init runs after injection.
 */
async function initComponents() {
  // Resolve component paths relative to any nested page folder
  const depth   = (CURRENT_PATH.match(/\//g) || []).length - 1;
  const prefix  = depth > 1 ? '../'.repeat(depth - 1) : '../';
  const navPath  = `${prefix}components/navbar.html`;
  const footPath = `${prefix}components/footer.html`;

  await loadComponent(navPath, '#navbar-mount', () => {
  initNavbar();
  initGlobalFeatures(); // ✅ CRITICAL
});
  await loadComponent(footPath, '#footer-mount',  initFooter);
}

/* ─────────────────────────────────────────────
   3. THEME + RTL (GLOBAL FEATURES)
   ───────────────────────────────────────────── */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('pawspa-theme', theme);
  AppState.theme = theme;

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    const iconLight = btn.querySelector('[data-icon-light]');
    const iconDark  = btn.querySelector('[data-icon-dark]');
    if (iconLight) iconLight.style.display = theme === 'dark' ? 'block' : 'none';
    if (iconDark)  iconDark.style.display  = theme === 'light' ? 'block' : 'none';

    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title',      theme === 'dark' ? 'Light mode' : 'Dark mode');
  });
}

function toggleTheme() {
  applyTheme(AppState.theme === 'dark' ? 'light' : 'dark');
}

function applyDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('pawspa-dir', dir);
  AppState.dir = dir;

  document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
    btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
    btn.setAttribute('title',      dir === 'rtl' ? 'LTR mode' : 'RTL mode');
    btn.classList.toggle('active', dir === 'rtl');
  });
}

function toggleDirection() {
  applyDirection(AppState.dir === 'rtl' ? 'ltr' : 'rtl');
}

/* ✅ MAIN INIT FUNCTION */
function initGlobalFeatures() {
  // Attach events AFTER navbar exists
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleDirection);
  });

  // Apply saved settings
  applyTheme(AppState.theme);
  applyDirection(AppState.dir);
}

// expose globally
window.initGlobalFeatures = initGlobalFeatures;
/* ─────────────────────────────────────────────
   5. NAVBAR INITIALISATION
   ───────────────────────────────────────────── */

function initNavbar() {
  // ── 5a. Highlight active link ──────────────
  highlightActiveLink();

  // ── 5b. Scroll behaviour ───────────────────
  initNavbarScroll();



  // ── 5d. Dropdown hover intent ──────────────
  initDropdowns();

  // ── 5e. Wire theme / RTL toggles ──────────
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleDirection);
  });

  // Re-apply stored settings after navbar renders
  applyTheme(AppState.theme);
  applyDirection(AppState.dir);
}

/* ── 5a. Highlight Active Link ────────────── */
function highlightActiveLink() {
  const links = document.querySelectorAll('.nav-link, .dropdown-item');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // Match both exact path and filename
    const linkPath = new URL(href, window.location.href).pathname;
    if (
      linkPath === CURRENT_PATH ||
      (CURRENT_PATH.endsWith('/') && linkPath === CURRENT_PATH + 'index.html')
    ) {
      link.classList.add('active');
      // Also mark parent nav-item
      const parentItem = link.closest('.nav-item');
      if (parentItem) {
        const parentLink = parentItem.querySelector(':scope > .nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    }
  });
}

/* ── 5b. Navbar Scroll Behaviour ─────────── */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ── 5d. Dropdown Hover Intent ─────────── */
function initDropdowns() {
  const items = document.querySelectorAll('.nav-item');

  items.forEach(item => {
    let closeTimer;

    const open  = () => { clearTimeout(closeTimer); item.classList.add('hovered'); };
    const close = () => { closeTimer = setTimeout(() => item.classList.remove('hovered'), 200); };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    item.addEventListener('focusin',    open);
    item.addEventListener('focusout',   close);
  });
}

/* ─────────────────────────────────────────────
   6. FOOTER INITIALISATION
   ───────────────────────────────────────────── */

function initFooter() {
  // Newsletter form in footer
  const form = document.querySelector('#footer-newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input || !input.value.trim()) return;
    showToast('You\'re subscribed! 🐾 Welcome to the PawSpa family.', 'success');
    input.value = '';
  });
}

/* ─────────────────────────────────────────────
   7. SCROLL-TRIGGERED ANIMATIONS (AOS-like)
   ───────────────────────────────────────────── */

function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  // Respect prefers-reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    elements.forEach(el => el.classList.add('aos-animate'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold:  0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   8. TOAST NOTIFICATIONS
   ───────────────────────────────────────────── */

/** Toast auto-dismiss delay in ms */
const TOAST_DURATION = 4000;

/**
 * Shows a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} [type='info']
 * @param {number} [duration] - ms before auto-dismiss
 */
function showToast(message, type = 'info', duration = TOAST_DURATION) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const icons = {
    success: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  const colors = {
    success: 'var(--paw-green)',
    error:   '#e05252',
    info:    'var(--aqua-fresh)',
    warning: 'var(--paw-gold)',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span style="color:${colors[type]};flex-shrink:0">${icons[type] || ''}</span>
    <span style="flex:1;font-size:0.875rem">${message}</span>
    <button onclick="this.closest('.toast').remove()"
      style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;
             border:none;background:none;cursor:pointer;color:var(--text-muted);flex-shrink:0"
      aria-label="Dismiss">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // Auto dismiss
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ─────────────────────────────────────────────
   9. MODAL SYSTEM
   ───────────────────────────────────────────── */

/**
 * Opens a modal by ID.
 * @param {string} modalId
 */
function openModal(modalId) {
  const modal   = document.getElementById(modalId);
  const overlay = document.getElementById('modal-overlay') || createModalOverlay();
  if (!modal) return;

  overlay.classList.add('open');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus first focusable element
  const focusable = modal.querySelector('input, button, select, textarea, a[href]');
  if (focusable) setTimeout(() => focusable.focus(), 100);
}

/**
 * Closes a modal by ID (or the first open modal).
 * @param {string} [modalId]
 */
function closeModal(modalId) {
  const selector = modalId ? `#${modalId}` : '.modal.open';
  const modal    = document.querySelector(selector);
  const overlay  = document.getElementById('modal-overlay');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function createModalOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'overlay';
  overlay.addEventListener('click', () => closeModal());
  document.body.appendChild(overlay);
  return overlay;
}

/** Wire data-modal-open / data-modal-close attributes in DOM */
function initModals() {
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) openModal(opener.dataset.modalOpen);

    const closer = e.target.closest('[data-modal-close], .modal-close');
    if (closer) {
      const id = closer.dataset.modalClose;
      closeModal(id);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ─────────────────────────────────────────────
   10. BOOKING MODAL
   ───────────────────────────────────────────── */

/**
 * Injects the global booking modal into the DOM (only once).
 */
function initBookingModal() {
  if (document.getElementById('booking-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'booking-modal';
  modal.className = 'modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'booking-modal-title');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="modal-header">
      <h4 id="booking-modal-title" style="font-family:var(--font-heading);font-weight:600;color:var(--text-heading)">
        🐾 Book an Appointment
      </h4>
      <button class="modal-close" aria-label="Close booking modal" data-modal-close="booking-modal">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <form id="booking-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="b-name">Your Name <span class="required">*</span></label>
          <input class="form-control" type="text" id="b-name" name="name"
            placeholder="Enter your full name" autocomplete="name" required>
          <span class="form-error">Please enter your name.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="b-phone">Phone Number <span class="required">*</span></label>
          <input class="form-control" type="tel" id="b-phone" name="phone"
            placeholder="+91 98765 43210" autocomplete="tel" required>
          <span class="form-error">Please enter a valid phone number.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="b-email">Email Address</label>
          <input class="form-control" type="email" id="b-email" name="email"
            placeholder="your@email.com" autocomplete="email">
          <span class="form-error">Please enter a valid email.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="b-pet">Pet Type <span class="required">*</span></label>
          <select class="form-control form-select" id="b-pet" name="pet" required>
            <option value="" disabled selected>Select your pet</option>
            <option value="dog">Dog 🐶</option>
            <option value="cat">Cat 🐱</option>
            <option value="rabbit">Rabbit 🐰</option>
            <option value="other">Other</option>
          </select>
          <span class="form-error">Please select your pet type.</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="b-service">Service <span class="required">*</span></label>
          <select class="form-control form-select" id="b-service" name="service" required>
            <option value="" disabled selected>Select a service</option>
            <option value="full-grooming">Full Grooming</option>
            <option value="bath-blow">Bath & Blow Dry</option>
            <option value="hair-styling">Hair Styling</option>
            <option value="nail-clipping">Nail Clipping</option>
            <option value="spa">Spa Treatment</option>
            <option value="medicated-bath">Medicated Bath</option>
          </select>
          <span class="form-error">Please select a service.</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-2)">
          <div class="form-group">
            <label class="form-label" for="b-date">Date <span class="required">*</span></label>
            <input class="form-control" type="date" id="b-date" name="date" required>
            <span class="form-error">Please select a date.</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="b-time">Time <span class="required">*</span></label>
            <select class="form-control form-select" id="b-time" name="time" required>
              <option value="" disabled selected>Select time</option>
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>02:00 PM</option>
              <option>03:00 PM</option>
              <option>04:00 PM</option>
              <option>05:00 PM</option>
            </select>
            <span class="form-error">Please select a time.</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="b-notes">Additional Notes</label>
          <textarea class="form-control" id="b-notes" name="notes"
            placeholder="Any special requests or pet health info..." rows="3"></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-ghost btn-sm" data-modal-close="booking-modal">Cancel</button>
      <button type="button" class="btn btn-primary btn-sm" id="booking-submit">
        Confirm Booking 🐾
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Set minimum date to today
  const dateInput = modal.querySelector('#b-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // Submit handler
  const submitBtn = modal.querySelector('#booking-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const form = modal.querySelector('#booking-form');
      if (validateForm(form)) {
        closeModal('booking-modal');
        showToast('Your appointment has been booked! We\'ll confirm shortly. 🐾', 'success', 5000);
        form.reset();
      }
    });
  }
}

/* ─────────────────────────────────────────────
   11. FORM VALIDATION
   ───────────────────────────────────────────── */

/**
 * Validates all required fields in a form.
 * Shows inline error messages.
 * @param {HTMLFormElement} form
 * @returns {boolean} - true if valid
 */
function validateForm(form) {
  if (!form) return false;
  let valid = true;

  // Clear previous errors
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error', 'has-success'));

  form.querySelectorAll('[required]').forEach(field => {
    const group = field.closest('.form-group');
    if (!group) return;

    const isEmpty  = !field.value.trim();
    const isEmail  = field.type === 'email';
    const emailOk  = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) : true;
    const isInvalid = isEmpty || !emailOk;

    if (isInvalid) {
      group.classList.add('has-error');
      valid = false;
    } else {
      group.classList.add('has-success');
    }
  });

  // Focus first error
  const firstError = form.querySelector('.has-error .form-control, .has-error select');
  if (firstError) firstError.focus();

  return valid;
}

/**
 * Initialise real-time validation on all forms with [data-validate].
 */
function initFormValidation() {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.querySelectorAll('.form-control, select').forEach(field => {
      field.addEventListener('blur', () => {
        const group = field.closest('.form-group');
        if (!group) return;
        const required = field.hasAttribute('required');
        const isEmpty  = !field.value.trim();
        const isEmail  = field.type === 'email';
        const emailOk  = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) : true;

        if (required && isEmpty) {
          group.classList.add('has-error');
          group.classList.remove('has-success');
        } else if (isEmail && !emailOk) {
          group.classList.add('has-error');
          group.classList.remove('has-success');
        } else if (!isEmpty) {
          group.classList.remove('has-error');
          group.classList.add('has-success');
        }
      });
    });
  });
}

/* ─────────────────────────────────────────────
   12. ACCORDION / FAQ
   ───────────────────────────────────────────── */

function initAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      if (!item) return;

      // Optionally close siblings (comment out for multi-open)
      const siblings = item.parentElement?.querySelectorAll('.accordion-item.open');
      siblings?.forEach(sib => {
        if (sib !== item) sib.classList.remove('open');
      });

      item.classList.toggle('open');
    });
  });
}

/* ─────────────────────────────────────────────
   13. TABS
   ───────────────────────────────────────────── */

function initTabs() {
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const buttons = group.querySelectorAll('.tab-btn');
    const panels  = document.querySelectorAll(`[data-tab-panel="${group.dataset.tabGroup}"]`);

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });
  });
}

/* ─────────────────────────────────────────────
   14. LAZY LOADING IMAGES
   ───────────────────────────────────────────── */

function initLazyLoad() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('loading' in HTMLImageElement.prototype) return; // native support

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
}

/* ─────────────────────────────────────────────
   15. SMOOTH SCROLL FOR ANCHOR LINKS
   ───────────────────────────────────────────── */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 88; // navbar height + gap
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────
   16. COUNTER ANIMATION (Stats)
   ───────────────────────────────────────────── */

/**
 * Animates number counters when they scroll into view.
 * Mark elements with data-counter="1234".
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.counter, 10);
      const suffix  = el.dataset.suffix || '';
      const prefix  = el.dataset.prefix || '';
      const duration= 2000; // ms
      const start   = performance.now();

      const update = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased   = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.floor(eased * target).toLocaleString('en-IN') + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   17. IMAGE ZOOM HOVER (Gallery)
   ───────────────────────────────────────────── */

function initImageZoom() {
  document.querySelectorAll('[data-zoom-img]').forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (!img) return;
    img.style.transition = 'transform 0.5s ease';
    wrapper.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.06)'; });
    wrapper.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; });
  });
}

/* ─────────────────────────────────────────────
   18. BEFORE / AFTER SLIDER
   ───────────────────────────────────────────── */

/**
 * Simple before/after image slider.
 * HTML structure:
 *   <div class="ba-slider" data-ba-slider>
 *     <img class="ba-after"  src="after.jpg"  alt="">
 *     <div class="ba-before-wrap">
 *       <img class="ba-before" src="before.jpg" alt="">
 *     </div>
 *     <div class="ba-handle"></div>
 *   </div>
 */
function initBeforeAfterSliders() {
  document.querySelectorAll('[data-ba-slider]').forEach(slider => {
    const handle = slider.querySelector('.ba-handle');
    const beforeWrap = slider.querySelector('.ba-before-wrap');
    if (!handle || !beforeWrap) return;

    let dragging = false;

    const move = (x) => {
      const rect = slider.getBoundingClientRect();
      const pct  = Math.min(Math.max((x - rect.left) / rect.width, 0.05), 0.95);
      beforeWrap.style.width = (pct * 100) + '%';
      handle.style.left      = (pct * 100) + '%';
    };

    handle.addEventListener('mousedown',  e => { dragging = true; e.preventDefault(); });
    handle.addEventListener('touchstart', e => { dragging = true; }, { passive: true });

    document.addEventListener('mousemove', e => { if (dragging) move(e.clientX); });
    document.addEventListener('touchmove', e => { if (dragging) move(e.touches[0].clientX); }, { passive: true });
    document.addEventListener('mouseup',   () => { dragging = false; });
    document.addEventListener('touchend',  () => { dragging = false; });

    // Default position at 50%
    move(slider.getBoundingClientRect().left + slider.offsetWidth * 0.5);
  });
}

/* ─────────────────────────────────────────────
   19. SIMPLE SLIDER / CAROUSEL
   ───────────────────────────────────────────── */

/**
 * Minimal auto-advancing testimonial slider.
 * HTML:
 *   <div data-slider>
 *     <div class="slides-track">
 *       <div class="slide">…</div>
 *       …
 *     </div>
 *     <button data-slider-prev>‹</button>
 *     <button data-slider-next>›</button>
 *     <div data-slider-dots></div>
 *   </div>
 */
function initSliders() {
  document.querySelectorAll('[data-slider]').forEach(root => {
    const track    = root.querySelector('.slides-track');
    const slides   = root.querySelectorAll('.slide');
    const prevBtn  = root.querySelector('[data-slider-prev]');
    const nextBtn  = root.querySelector('[data-slider-next]');
    const dotsWrap = root.querySelector('[data-slider-dots]');
    if (!track || !slides.length) return;

    let current   = 0;
    let interval;
    const total   = slides.length;

    // Build dots
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    const goTo = (index) => {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsWrap?.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    // Auto-play
    const autoPlay  = () => { interval = setInterval(next, 4500); };
    const resetAuto = () => { clearInterval(interval); autoPlay(); };

    autoPlay();

    // Pause on hover
    root.addEventListener('mouseenter', () => clearInterval(interval));
    root.addEventListener('mouseleave', autoPlay);

    // Touch swipe
    let startX = 0;
    root.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend',   e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetAuto(); }
    });
  });
}

/* ─────────────────────────────────────────────
   20. FILTER TABS (Services / Blog)
   ───────────────────────────────────────────── */

/**
 * Simple isotope-like filter.
 * Buttons: [data-filter="value"] or [data-filter="*"]
 * Items:   [data-category="value"]
 */
function initFilters() {
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const filterBtns = group.querySelectorAll('[data-filter]');
    const container  = document.querySelector(group.dataset.filterTarget);
    if (!container) return;

    const items = container.querySelectorAll('[data-category]');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const value = btn.dataset.filter;
        items.forEach(item => {
          const show = value === '*' || item.dataset.category === value;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });
}

/* ─────────────────────────────────────────────
   21. BACK TO TOP BUTTON
   ───────────────────────────────────────────── */

function initBackToTop() {
  const btn = document.querySelector('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   22. COOKIE / POPUP BANNER
   ───────────────────────────────────────────── */

function initCookieBanner() {
  if (localStorage.getItem('pawspa-cookies-accepted')) return;

  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  banner.style.display = 'flex';

  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('pawspa-cookies-accepted', 'true');
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 400);
    });
  }
}

/* ─────────────────────────────────────────────
   23. IMAGE LIGHTBOX (Gallery)
   ───────────────────────────────────────────── */

function initLightbox() {
  const images = document.querySelectorAll('[data-lightbox]');
  if (!images.length) return;

  // Create lightbox container
  let lb = document.getElementById('paw-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'paw-lightbox';
    lb.style.cssText = `
      position:fixed;inset:0;z-index:${getComputedStyle(document.documentElement).getPropertyValue('--z-modal') || 400};
      background:rgba(0,0,0,0.92);display:none;align-items:center;justify-content:center;cursor:zoom-out;
    `;
    lb.innerHTML = `
      <img id="lb-img" src="" alt="" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 32px 80px rgba(0,0,0,0.6)">
      <button id="lb-close" aria-label="Close lightbox"
        style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);
               border-radius:8px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    document.body.appendChild(lb);
  }

  const lbImg   = lb.querySelector('#lb-img');
  const lbClose = lb.querySelector('#lb-close');

  const open  = (src, alt) => {
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
    img.addEventListener('click', () => open(img.src || img.dataset.lightbox, img.alt));
  });

  lb.addEventListener('click',  e => { if (e.target === lb || e.target === lbClose) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ─────────────────────────────────────────────
   24. UTILS — PUBLICLY ACCESSIBLE
   ───────────────────────────────────────────── */

/**
 * Debounce utility.
 * @param {Function} fn
 * @param {number} delay
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle utility.
 * @param {Function} fn
 * @param {number} limit
 */
function throttle(fn, limit = 100) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn(...args); }
  };
}

/**
 * Format a number as Indian Rupee string.
 * @param {number} amount
 * @returns {string}
 */
function formatRupee(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/* ─────────────────────────────────────────────
   25. EXPOSE PUBLIC API
   ───────────────────────────────────────────── */

window.PawSpa = {
  openModal,
  closeModal,
  showToast,
  validateForm,
  toggleTheme,
  toggleDirection,
  formatRupee,
  debounce,
  throttle,
};

/* ─────────────────────────────────────────────
   26. ENTRY POINT — DOM READY
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  // Apply persisted theme & direction ASAP (before component load)
  applyTheme(AppState.theme);
  applyDirection(AppState.dir);

  // Load shared components (navbar + footer) then boot everything
  await initComponents();

  // Core UI modules
  initModals();
  initBookingModal();
  initFormValidation();
  initAccordion();
  initTabs();
  initFilters();

  // Visual enhancements
  initAOS();
  initCounters();
  initSliders();
  initBeforeAfterSliders();
  initImageZoom();
  initLightbox();
  initLazyLoad();
  initSmoothScroll();
  initBackToTop();
  initCookieBanner();

  // Wire all "Book Now" / "Book Appointment" buttons globally
  document.querySelectorAll('[data-book-now], .btn-book-now').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal('booking-modal');
    });
  });
});
