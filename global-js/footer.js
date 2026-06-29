/**
 * ============================================================
 * PawSpa — footer.js
 * Footer-specific JavaScript.
 * Handles: newsletter form, cookie banner, back-to-top,
 * footer year auto-update, and footer Book Now buttons.
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   1. CURRENT YEAR (Copyright)
   ───────────────────────────────────────────── */

function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ─────────────────────────────────────────────
   2. NEWSLETTER FORM
   Handles subscribe with validation & toast.
   ───────────────────────────────────────────── */

function initFooterNewsletter() {
  const form = document.getElementById('footer-newsletter-form');
  if (!form) return;

  const input  = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!input || !input.value.trim()) {
      showFooterToast('Please enter your email address.', 'error');
      input && input.focus();
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value.trim())) {
      showFooterToast('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }

    // Show loading state
    if (button) {
      button.disabled = true;
      button.textContent = 'Subscribing...';
    }

    // Simulate async request (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Success
    showFooterToast('You\'re subscribed! 🐾 Welcome to the PawSpa family.', 'success');
    input.value = '';

    // Reset button
    if (button) {
      button.disabled = false;
      button.textContent = 'Subscribe';
    }
  });

  // Inline validation on blur
  if (input) {
    input.addEventListener('blur', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (input.value && !emailRegex.test(input.value)) {
        input.style.borderColor = '#e05252';
      } else {
        input.style.borderColor = '';
      }
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '';
    });
  }
}

/* ─────────────────────────────────────────────
   3. COOKIE BANNER
   Shown once per session; dismissed via
   localStorage.
   ───────────────────────────────────────────── */

function initCookieBanner() {
  const banner     = document.getElementById('cookie-banner');
  const acceptBtn  = banner?.querySelector('[data-cookie-accept]');
  const declineBtn = banner?.querySelector('[data-cookie-decline]');

  if (!banner) return;

  // Don't show if already accepted
  if (localStorage.getItem('pawspa-cookies-accepted')) {
    banner.style.display = 'none';
    return;
  }

  // Show after short delay for better UX
  setTimeout(() => {
    banner.style.display = 'flex';
  }, 2000);

  const dismiss = (accepted) => {
    if (accepted) {
      localStorage.setItem('pawspa-cookies-accepted', 'true');
    }
    // Fade out
    banner.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    banner.style.opacity    = '0';
    banner.style.transform  = 'translateX(-50%) translateY(16px)';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 380);
  };

  if (acceptBtn)  acceptBtn.addEventListener('click',  () => dismiss(true));
  if (declineBtn) declineBtn.addEventListener('click', () => dismiss(false));
}

/* ─────────────────────────────────────────────
   4. BACK TO TOP BUTTON
   Shows after 400px scroll; smooth scrolls up.
   ───────────────────────────────────────────── */

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  // Throttled scroll handler
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Keyboard support
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ─────────────────────────────────────────────
   5. FOOTER BOOK NOW BUTTONS
   Wire footer booking CTAs to the global modal.
   ───────────────────────────────────────────── */

function initFooterBookNow() {
  const footerBookBtns = document.querySelectorAll('.footer [data-book-now], .footer-cta-btn[data-book-now]');

  footerBookBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.PawSpa && window.PawSpa.openModal) {
        window.PawSpa.openModal('booking-modal');
      }
    });
  });
}

/* ─────────────────────────────────────────────
   6. FOOTER LINK ACTIVE STATE
   Highlight footer links matching current page.
   ───────────────────────────────────────────── */

function highlightFooterLinks() {
  const currentPath = window.location.pathname;

  document.querySelectorAll('.footer-link, .footer-bottom-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) return;

    try {
      const linkPath = new URL(href, window.location.href).pathname;
      if (linkPath === currentPath) {
        link.style.color = 'var(--aqua-fresh)';
        link.style.fontWeight = 'var(--fw-semibold)';
      }
    } catch {
      // Invalid URL — skip
    }
  });
}

/* ─────────────────────────────────────────────
   7. TOAST HELPER (footer-specific fallback)
   Uses global PawSpa.showToast if available,
   otherwise creates a minimal local toast.
   ───────────────────────────────────────────── */

function showFooterToast(message, type = 'info') {
  if (window.PawSpa && window.PawSpa.showToast) {
    window.PawSpa.showToast(message, type);
    return;
  }

  // Minimal fallback toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 1.5rem;
    z-index: 9999;
    background: ${type === 'success' ? '#3E7C59' : '#e05252'};
    color: #fff;
    padding: 0.875rem 1.25rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-family: sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    max-width: 320px;
    animation: fadeIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

/* ─────────────────────────────────────────────
   8. SMOOTH SCROLL FOR FOOTER ANCHOR LINKS
   Handles links like href="#contact-form"
   ───────────────────────────────────────────── */

function initFooterAnchorLinks() {
  document.querySelectorAll('.footer a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--navbar-height') || '72',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────
   9. ENTRY POINT
   Called by global.js initFooter() after the
   footer HTML is injected.
   ───────────────────────────────────────────── */

function initFooterComponent() {
  initFooterYear();
  initFooterNewsletter();
  initCookieBanner();
  initBackToTop();
  initFooterBookNow();
  highlightFooterLinks();
  initFooterAnchorLinks();
}

/* ─────────────────────────────────────────────
   10. EXPORT / ATTACH
   ───────────────────────────────────────────── */

window.initFooterComponent = initFooterComponent;

// Auto-run if footer already exists
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.footer')) {
      initFooterComponent();
    }
  });
} else {
  if (document.querySelector('.footer')) {
    initFooterComponent();
  }
}
