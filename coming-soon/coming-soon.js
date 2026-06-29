/**
 * ============================================================
 * PawSpa — coming-soon/coming-soon.js
 * Self-contained. No global.js dependency.
 *
 * Modules:
 *  1. Entry animations (staggered reveal)
 *  2. Theme toggle (light / dark)
 *  3. Countdown timer (live, with flip effect)
 *  4. Progress bar animated fill
 *  5. Email subscribe form + validation
 *  6. Canvas particle / paw-print background
 *  7. Current year footer
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   CONFIG
   ───────────────────────────────────────────── */

/** Launch target date — set to 60 days from page load as a demo.
 *  In production replace with a fixed ISO date string, e.g.:
 *  const LAUNCH_DATE = new Date('2025-06-01T00:00:00+05:30');
 */
const LAUNCH_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d;
})();

/** Progress bar target percentage */
const PROGRESS_PCT = 68;

/* ─────────────────────────────────────────────
   1. ENTRY ANIMATIONS
   Stagger-reveal all [data-anim] elements.
   ───────────────────────────────────────────── */

function initEntryAnimations() {
  const elements = document.querySelectorAll('[data-anim]');

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  elements.forEach(el => {
    const delay = parseInt(el.dataset.animDelay || '0', 10);
    setTimeout(() => {
      el.classList.add('is-visible');
    }, delay);
  });
}

/* ─────────────────────────────────────────────
   2. THEME TOGGLE
   Standalone toggle — no global.js needed.
   Persists to localStorage under 'pawspa-theme'.
   ───────────────────────────────────────────── */

function initThemeToggle() {
  const btn  = document.getElementById('cs-theme-toggle');
  const html = document.documentElement;

  // Load persisted preference or default to dark
  const stored = localStorage.getItem('pawspa-theme');
  const initial = stored || 'dark';
  html.setAttribute('data-theme', initial);

  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pawspa-theme', next);
    btn.setAttribute('aria-label',
      next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    // Repaint canvas with correct color
    updateCanvasColour();
  });
}

/* ─────────────────────────────────────────────
   3. COUNTDOWN TIMER
   Updates every second with a digit-flip effect.
   ───────────────────────────────────────────── */

function pad(n) { return String(n).padStart(2, '0'); }

function getTimeLeft() {
  const diff = LAUNCH_DATE - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(secs  / 60);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  return {
    days,
    hours: hours % 24,
    mins:  mins  % 60,
    secs:  secs  % 60,
  };
}

/** Flip a single digit element to a new value with CSS animation. */
function flipTo(el, newVal) {
  if (!el || el.textContent === newVal) return;
  el.classList.add('flip');
  setTimeout(() => {
    el.textContent = newVal;
    el.classList.remove('flip');
  }, 150);
}

function initCountdown() {
  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-mins');
  const sEl = document.getElementById('cd-secs');
  if (!dEl) return;

  function tick() {
    const { days, hours, mins, secs } = getTimeLeft();
    flipTo(dEl, pad(days));
    flipTo(hEl, pad(hours));
    flipTo(mEl, pad(mins));
    flipTo(sEl, pad(secs));

    // Update aria-label on the timer container for screen readers
    const container = document.getElementById('countdown');
    if (container) {
      container.setAttribute('aria-label',
        `${days} days, ${hours} hours, ${mins} minutes, ${secs} seconds until launch`);
    }
  }

  tick(); // immediate first render
  setInterval(tick, 1000);
}

/* ─────────────────────────────────────────────
   4. PROGRESS BAR
   Animates from 0 → PROGRESS_PCT with a short delay.
   ───────────────────────────────────────────── */

function initProgressBar() {
  const fill    = document.getElementById('progress-fill');
  const pctText = document.getElementById('progress-pct');
  if (!fill) return;

  // Animate after a short delay so the page entry is not too busy
  setTimeout(() => {
    fill.style.width = PROGRESS_PCT + '%';

    // Count up the percentage text
    let current = 0;
    const duration = 1800;
    const start    = performance.now();

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.floor(eased * PROGRESS_PCT);
      if (pctText) pctText.textContent = value + '%';
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }, 900);
}

/* ─────────────────────────────────────────────
   5. EMAIL SUBSCRIBE FORM
   Client-side validation + success state swap.
   ───────────────────────────────────────────── */

function initSubscribeForm() {
  const form       = document.getElementById('subscribe-form');
  const input      = document.getElementById('sub-email');
  const errorEl    = document.getElementById('sub-error');
  const fieldWrap  = document.getElementById('css-field-wrap');
  const successEl  = document.getElementById('css-success');
  if (!form) return;

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const showError = (msg) => {
    if (errorEl) errorEl.textContent = msg;
    if (fieldWrap) {
      fieldWrap.style.borderColor = 'rgba(224,82,82,0.6)';
      fieldWrap.style.boxShadow   = '0 0 0 3px rgba(224,82,82,0.12)';
    }
    if (input) input.setAttribute('aria-invalid', 'true');
  };

  const clearError = () => {
    if (errorEl) errorEl.textContent = '';
    if (fieldWrap) {
      fieldWrap.style.borderColor = '';
      fieldWrap.style.boxShadow   = '';
    }
    if (input) input.removeAttribute('aria-invalid');
  };

  // Live clear on input
  if (input) {
    input.addEventListener('input', clearError);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearError();

    const email = input ? input.value.trim() : '';

    if (!email) {
      showError('Please enter your email address.');
      input && input.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showError('Hmm, that doesn\'t look like a valid email. Try again?');
      input && input.focus();
      return;
    }

    // Simulate async submission (replace with real API call in production)
    const btn = form.querySelector('.css-btn');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.querySelector('.css-btn__text') &&
        (btn.querySelector('.css-btn__text').textContent = 'Sending…');
    }

    setTimeout(() => {
      // Show success state
      if (form) form.style.display = 'none';
      if (successEl) successEl.removeAttribute('hidden');

      // Store in localStorage so form stays hidden on refresh
      try { localStorage.setItem('pawspa-cs-subscribed', '1'); } catch(_) { /* silent */ }
    }, 900);
  });

  // If already subscribed, show success immediately
  try {
    if (localStorage.getItem('pawspa-cs-subscribed') === '1') {
      if (form)      form.style.display = 'none';
      if (successEl) successEl.removeAttribute('hidden');
    }
  } catch(_) { /* silent */ }
}

/* ─────────────────────────────────────────────
   6. CANVAS — FLOATING PAW-PRINT PARTICLES
   Draws soft, drifting paw-print shapes on a
   full-screen canvas for an immersive backdrop.
   ───────────────────────────────────────────── */

let canvasColour = 'rgba(62, 124, 89, 0.18)';

function updateCanvasColour() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  canvasColour = isDark ? 'rgba(62, 124, 89, 0.18)' : 'rgba(62, 124, 89, 0.12)';
}

function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  updateCanvasColour();

  // Resize canvas to fill viewport
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Particle definition
  const PARTICLE_COUNT = Math.min(40, Math.floor(window.innerWidth / 32));

  /** Draw a single paw print at (x, y) with given size and rotation */
  function drawPaw(x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = canvasColour;

    // Palm pad (large ellipse)
    ctx.beginPath();
    ctx.ellipse(0, size * 0.3, size * 0.5, size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Four toe pads
    const toeAngles   = [-0.55, -0.18, 0.18, 0.55];
    const toeDistance = size * 0.62;
    const toeSize     = size * 0.22;

    toeAngles.forEach(angle => {
      const tx = Math.sin(angle) * toeDistance;
      const ty = -Math.cos(angle) * toeDistance + size * 0.3;
      ctx.beginPath();
      ctx.ellipse(tx, ty, toeSize, toeSize * 0.85, angle * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Build particle array
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x:        Math.random() * window.innerWidth,
    y:        Math.random() * window.innerHeight,
    size:     Math.random() * 18 + 8,          // 8–26px
    rotation: Math.random() * Math.PI * 2,
    alpha:    Math.random() * 0.55 + 0.08,     // 0.08–0.63
    speed:    Math.random() * 0.25 + 0.08,     // drift speed
    drift:    (Math.random() - 0.5) * 0.18,    // horizontal drift
    spin:     (Math.random() - 0.5) * 0.005,   // slow rotation
    wobble:   Math.random() * Math.PI * 2,     // phase for wobble
  }));

  let raf;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // Update position
      p.y       -= p.speed;
      p.x       += p.drift + Math.sin(p.wobble) * 0.3;
      p.rotation += p.spin;
      p.wobble  += 0.015;

      // Wrap around edges
      if (p.y + p.size < 0)            p.y = canvas.height + p.size;
      if (p.x - p.size > canvas.width) p.x = -p.size;
      if (p.x + p.size < 0)            p.x = canvas.width + p.size;

      drawPaw(p.x, p.y, p.size, p.rotation, p.alpha);
    });

    raf = requestAnimationFrame(render);
  }

  render();

  // Pause when page is hidden (battery-friendly)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      render();
    }
  });
}

/* ─────────────────────────────────────────────
   7. CURRENT YEAR
   ───────────────────────────────────────────── */

function initYear() {
  const el = document.getElementById('cs-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────
   8. ENTRY POINT
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initEntryAnimations();
  initCountdown();
  initProgressBar();
  initSubscribeForm();
  initCanvas();
  initYear();
});
