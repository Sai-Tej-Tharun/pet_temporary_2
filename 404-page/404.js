/**
 * ============================================================
 * PawSpa — 404.js
 * Handles: paw print canvas trail, dog eye blink,
 * search bar redirect, go-back button, cursor paw trail.
 * ============================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Canvas paw print background trail ────────────
  initPawCanvas();

  // ── 2. Dog eye blink ────────────────────────────────
  initDogBlink();

  // ── 3. Search redirect ──────────────────────────────
  initSearch();

  // ── 4. Go back button ───────────────────────────────
  initGoBack();

  // ── 5. Cursor paw trail ─────────────────────────────
  initCursorTrail();

  // ── 6. Quick link hover sparkle ─────────────────────
  initQuickLinkSparkles();

});

/* ─────────────────────────────────────────────
   1. PAW PRINT CANVAS BACKGROUND
   Draws scattered, randomly rotated paw prints
   across the full viewport.
   ───────────────────────────────────────────── */
function initPawCanvas() {
  const canvas = document.getElementById('paw-trail-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = document.body.scrollHeight;
    drawPaws();
  }

  function drawPaws() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Number of paw prints scales with viewport area
    const count = Math.floor((canvas.width * canvas.height) / 22000);

    for (let i = 0; i < count; i++) {
      const x     = Math.random() * canvas.width;
      const y     = Math.random() * canvas.height;
      const size  = 12 + Math.random() * 22;
      const angle = Math.random() * Math.PI * 2;
      const alpha = 0.3 + Math.random() * 0.5;

      drawSinglePaw(ctx, x, y, size, angle, alpha);
    }
  }

  /**
   * Draws one stylised paw print at (x, y).
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} size   - main pad radius
   * @param {number} angle  - rotation in radians
   * @param {number} alpha  - 0–1 opacity
   */
  function drawSinglePaw(ctx, x, y, size, angle, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#3E7C59';

    // Main pad (large oval)
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.52, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Four toe pads arranged around the main pad
    const toePads = [
      { x: -size * 0.62, y: -size * 0.62, rx: size * 0.24, ry: size * 0.28 },
      { x: -size * 0.22, y: -size * 0.82, rx: size * 0.26, ry: size * 0.3  },
      { x:  size * 0.22, y: -size * 0.82, rx: size * 0.26, ry: size * 0.3  },
      { x:  size * 0.62, y: -size * 0.62, rx: size * 0.24, ry: size * 0.28 },
    ];

    toePads.forEach(pad => {
      ctx.beginPath();
      ctx.ellipse(pad.x, pad.y, pad.rx, pad.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Initial draw
  resize();

  // Redraw on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 250);
  });
}

/* ─────────────────────────────────────────────
   2. DOG EYE BLINK (in the zero ring)
   ───────────────────────────────────────────── */
function initDogBlink() {
  const dogSvg = document.querySelector('.dog-in-zero');
  if (!dogSvg) return;

  // The big white sclera ellipses: rx="12"
  // The dark pupils: rx="8"
  const pupils = dogSvg.querySelectorAll('ellipse[rx="8"]');

  function blink() {
    pupils.forEach(p => {
      p.style.transition      = 'transform 0.06s ease';
      p.style.transformBox    = 'fill-box';
      p.style.transformOrigin = 'center';
      p.style.transform       = 'scaleY(0.07)';
    });

    setTimeout(() => {
      pupils.forEach(p => {
        p.style.transform = 'scaleY(1)';
      });
    }, 130);

    // Random interval 1.5s–5s
    setTimeout(blink, 1500 + Math.random() * 3500);
  }

  setTimeout(blink, 1000);
}

/* ─────────────────────────────────────────────
   3. SEARCH REDIRECT
   Redirects to home page with a query param
   so results can be shown (demo behaviour).
   ───────────────────────────────────────────── */
function initSearch() {
  const input     = document.getElementById('error-search-input');
  const searchBtn = document.getElementById('error-search-btn');
  if (!input || !searchBtn) return;

  function doSearch() {
    const query = input.value.trim();
    if (!query) {
      input.focus();
      input.style.borderColor = '#e05252';
      input.style.boxShadow   = '0 0 0 3px rgba(224,82,82,0.12)';
      setTimeout(() => {
        input.style.borderColor = '';
        input.style.boxShadow   = '';
      }, 1500);
      return;
    }
    // Redirect to home with search query
    window.location.href = `../home-1/home.html?search=${encodeURIComponent(query)}`;
  }

  searchBtn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}

/* ─────────────────────────────────────────────
   4. GO BACK BUTTON
   ───────────────────────────────────────────── */
function initGoBack() {
  const btn = document.getElementById('go-back-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../home-1/home.html';
    }
  });
}

/* ─────────────────────────────────────────────
   5. CURSOR PAW TRAIL
   Spawns tiny emoji paw prints that fade out
   as the user moves their mouse across the page.
   ───────────────────────────────────────────── */
function initCursorTrail() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  let lastX = -999, lastY = -999;
  const MIN_DIST = 60; // px between paw prints

  document.addEventListener('mousemove', (e) => {
    const dx   = e.clientX - lastX;
    const dy   = e.clientY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MIN_DIST) return;

    lastX = e.clientX;
    lastY = e.clientY;

    spawnPawPrint(e.clientX, e.clientY);
  });
}

/**
 * Creates a single fleeting paw print at the cursor position.
 * @param {number} x
 * @param {number} y
 */
function spawnPawPrint(x, y) {
  const el = document.createElement('span');
  el.textContent = '🐾';
  el.setAttribute('aria-hidden', 'true');

  // Random slight rotation for naturalistic feel
  const rotation = -30 + Math.random() * 60;
  const size     = 14 + Math.random() * 10;

  Object.assign(el.style, {
    position:       'fixed',
    left:           `${x - size / 2}px`,
    top:            `${y - size / 2}px`,
    fontSize:       `${size}px`,
    pointerEvents:  'none',
    zIndex:         '9999',
    transform:      `rotate(${rotation}deg) scale(1)`,
    opacity:        '0.7',
    transition:     'opacity 0.8s ease, transform 0.8s ease',
    userSelect:     'none',
  });

  document.body.appendChild(el);

  // Trigger fade-out on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity   = '0';
      el.style.transform = `rotate(${rotation}deg) scale(0.4) translateY(-12px)`;
    });
  });

  // Remove from DOM after animation
  setTimeout(() => el.remove(), 900);
}

/* ─────────────────────────────────────────────
   6. QUICK LINK HOVER SPARKLE
   Adds a tiny burst of sparkle emoji on hover.
   ───────────────────────────────────────────── */
function initQuickLinkSparkles() {
  document.querySelectorAll('.quick-link-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      // Spawn 3 sparkle particles
      for (let i = 0; i < 3; i++) {
        const rect  = this.getBoundingClientRect();
        const cx    = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.6;
        const cy    = rect.top  + rect.height / 2 + (Math.random() - 0.5) * rect.height * 0.6;
        spawnSparkle(cx, cy);
      }
    });
  });
}

function spawnSparkle(x, y) {
  const sparkles = ['✨', '⭐', '💫', '🌟'];
  const el = document.createElement('span');
  el.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
  el.setAttribute('aria-hidden', 'true');

  const dx = (Math.random() - 0.5) * 50;
  const dy = -(20 + Math.random() * 30);

  Object.assign(el.style, {
    position:      'fixed',
    left:          `${x}px`,
    top:           `${y}px`,
    fontSize:      '1rem',
    pointerEvents: 'none',
    zIndex:        '9998',
    opacity:       '1',
    transition:    'opacity 0.6s ease, transform 0.6s ease',
    userSelect:    'none',
  });

  document.body.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity   = '0';
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.4)`;
    });
  });

  setTimeout(() => el.remove(), 700);
}
