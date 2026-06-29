/**
 * PawSpa — login.js (rewritten)
 *
 * Sections:
 * 01. Theme toggle
 * 02. RTL toggle
 * 03. Panel switch (login ↔ register) — toggling .is-register on auth-wrap
 * 04. Paw SVG animation
 * 05. Floating background paws
 * 06. Password eye toggle
 * 07. Password strength meter
 * 08. Real-time field validation
 * 09. Form submit with loading state
 * 10. Entry point
 */

'use strict';

/* ────────────────────────────────────────────
   01. THEME TOGGLE
   ──────────────────────────────────────────── */
function initTheme () {
  const btn   = document.getElementById('theme-toggle');
  const light = btn?.querySelector('[data-icon-light]');
  const dark  = btn?.querySelector('[data-icon-dark]');
  let   theme = localStorage.getItem('pawspa-theme') || 'light';

  const apply = t => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('pawspa-theme', t);
    theme = t;
    if (light) light.style.display = t === 'dark'  ? 'block' : 'none';
    if (dark)  dark.style.display  = t === 'light' ? 'block' : 'none';
  };

  apply(theme);
  btn?.addEventListener('click', () => apply(theme === 'dark' ? 'light' : 'dark'));
}

/* ────────────────────────────────────────────
   02. RTL TOGGLE
   ──────────────────────────────────────────── */
function initRTL () {
  const btn  = document.getElementById('rtl-toggle');
  const text = document.getElementById('rtl-text');
  let dir    = localStorage.getItem('pawspa-dir') || 'ltr';

  const apply = d => {
    document.documentElement.setAttribute('dir', d);
    localStorage.setItem('pawspa-dir', d);
    dir = d;

    // 🔥 Update text + accessibility
    if (text) text.textContent = d === 'rtl' ? 'LTR' : 'RTL';
    btn?.setAttribute(
      'aria-label',
      d === 'rtl' ? 'Switch to LTR' : 'Switch to RTL'
    );

    btn?.classList.toggle('active', d === 'rtl');
  };

  apply(dir);
  btn?.addEventListener('click', () => apply(dir === 'rtl' ? 'ltr' : 'rtl'));
}

/* ────────────────────────────────────────────
   03. PANEL SWITCH
   
   Toggle .is-register on #auth-wrap.
   CSS handles everything else:
     - overlay slides left / right
     - each form panel is revealed / hidden
   ──────────────────────────────────────────── */
function initPanelSwitch () {
  const wrap = document.getElementById('auth-wrap');
  if (!wrap) return;

  // All buttons that should activate REGISTER view
  const toReg = [
    document.getElementById('goto-register'),          // switch-line in login form
    document.getElementById('overlay-to-register'),    // button inside overlay panel A
  ].filter(Boolean);

  // All buttons that should activate LOGIN view
  const toLgn = [
    document.getElementById('goto-login'),             // switch-line in register form
    document.getElementById('overlay-to-login'),       // button inside overlay panel B
  ].filter(Boolean);

  const goRegister = () => {
    wrap.classList.add('is-register');
    // Focus first field in register form after transition
    setTimeout(() => document.getElementById('reg-fname')?.focus(), 700);
  };

  const goLogin = () => {
    wrap.classList.remove('is-register');
    // Focus email field in login form after transition
    setTimeout(() => document.getElementById('login-email')?.focus(), 700);
  };

  toReg.forEach(btn => btn.addEventListener('click', goRegister));
  toLgn.forEach(btn => btn.addEventListener('click', goLogin));
}

/* ────────────────────────────────────────────
   04. PAW SVG ANIMATION
   Builds an animated paw print SVG:
   - 1 large palm ellipse
   - 4 toe ellipses with staggered animation delays
   ──────────────────────────────────────────── */
function buildPawSVG () {
  const NS  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 72 72');
  svg.setAttribute('width',  '72');
  svg.setAttribute('height', '72');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('paw-svg');
  svg.style.overflow = 'visible';

  const g = document.createElementNS(NS, 'g');
  g.classList.add('paw-group');

  // [cx, cy, rx, ry, animDelay]
  const pads = [
    { cx:36, cy:46, rx:13, ry:11, delay:0    },  // palm (largest)
    { cx:19, cy:30, rx: 7, ry: 6, delay:.10  },  // toe TL
    { cx:30, cy:24, rx: 7, ry: 6, delay:.20  },  // toe TC-L
    { cx:42, cy:24, rx: 7, ry: 6, delay:.30  },  // toe TC-R
    { cx:53, cy:30, rx: 7, ry: 6, delay:.40  },  // toe TR
  ];

  pads.forEach(p => {
    const el = document.createElementNS(NS, 'ellipse');
    el.setAttribute('cx', p.cx);
    el.setAttribute('cy', p.cy);
    el.setAttribute('rx', p.rx);
    el.setAttribute('ry', p.ry);
    el.setAttribute('fill', 'rgba(255,255,255,0.9)');
    el.classList.add('paw-pad');
    // pawIn has no repeat; pawPls repeats. Both need the correct delay.
    el.style.animationDelay = `${p.delay}s, ${p.delay + .55}s`;
    g.appendChild(el);
  });

  svg.appendChild(g);
  return svg;
}

function initPawAnimations () {
  ['paw-a', 'paw-b'].forEach(id => {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.innerHTML = '';
    wrap.appendChild(buildPawSVG());
  });
}

/**
 * Re-triggers paw animation inside a container by
 * briefly removing and reapplying the animation.
 */
function retriggerPaw (id) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  wrap.querySelectorAll('.paw-pad').forEach(pad => {
    pad.style.animation = 'none';
    void pad.getBoundingClientRect(); // force reflow
    pad.style.animation = '';
  });
}

/* ────────────────────────────────────────────
   05. FLOATING BACKGROUND PAW PRINTS
   ──────────────────────────────────────────── */
function initFloatingPaws () {
  let alive = 0;
  const MAX = 7;

  const spawn = () => {
    if (alive >= MAX) return;
    alive++;

    const el = document.createElement('span');
    el.className   = 'bg-paw';
    el.textContent = '🐾';
    el.setAttribute('aria-hidden', 'true');

    const left = (Math.random() * 86 + 5).toFixed(1);
    const size = (Math.random() * 0.8 + 0.7).toFixed(2);
    const dur  = (Math.random() * 10 + 14).toFixed(1);
    const del  = (Math.random() * 4).toFixed(2);

    el.style.cssText = `
      left:${left}%;
      font-size:${size}rem;
      animation-duration:${dur}s;
      animation-delay:${del}s;
    `;

    document.body.appendChild(el);
    setTimeout(() => { el.remove(); alive--; }, (+dur + +del) * 1000 + 600);
  };

  // Seed a few immediately
  spawn(); spawn(); spawn();
  setInterval(spawn, 3200);
}

/* ────────────────────────────────────────────
   06. PASSWORD VISIBILITY TOGGLE
   ──────────────────────────────────────────── */
function initEyeToggles () {
  document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const show  = input.type === 'password';
      input.type  = show ? 'text' : 'password';
      btn.querySelector('.eye-show').style.display = show ? 'none'  : 'block';
      btn.querySelector('.eye-hide').style.display = show ? 'block' : 'none';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });
}

/* ────────────────────────────────────────────
   07. PASSWORD STRENGTH METER
   ──────────────────────────────────────────── */
function initPwStrength () {
  const input = document.getElementById('reg-password');
  const fill  = document.getElementById('pw-fill');
  const lbl   = document.getElementById('pw-label');
  if (!input || !fill || !lbl) return;

  const score = pw => {
    let s = 0;
    if (pw.length >= 8)  s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw))   s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
  };

  const levels = ['', 'weak', 'fair', 'good', 'strong'];
  const names  = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  input.addEventListener('input', () => {
    const pw = input.value;
    if (!pw) {
      fill.className = 'pw-meter__fill';
      lbl.className  = 'pw-meter__lbl';
      lbl.textContent= 'Strength';
      return;
    }
    const s = score(pw);
    fill.className  = `pw-meter__fill ${levels[s]}`;
    lbl.className   = `pw-meter__lbl ${levels[s]}`;
    lbl.textContent = names[s];
  });
}

/* ────────────────────────────────────────────
   08. REAL-TIME FIELD VALIDATION
   ──────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldState (inputEl, isError) {
  const g = inputEl?.closest?.('.field-group');
  if (!g) return;
  g.classList.toggle('has-error',   isError);
  g.classList.toggle('has-success', !isError);
}

function initRealTime () {
  const rules = [
    { id:'login-email',    test: v => EMAIL_RE.test(v.trim()) },
    { id:'login-password', test: v => v.length > 0 },
    { id:'reg-fname',      test: v => v.trim().length >= 1 },
    { id:'reg-lname',      test: v => v.trim().length >= 1 },
    { id:'reg-email',      test: v => EMAIL_RE.test(v.trim()) },
    { id:'reg-password',   test: v => v.length >= 8 },
  ];

  rules.forEach(({ id, test }) => {
    document.getElementById(id)?.addEventListener('blur', function () {
      if (this.value) setFieldState(this, !test(this.value));
    });
    document.getElementById(id)?.addEventListener('input', function () {
      // Clear error as soon as user starts correcting
      if (this.closest('.field-group')?.classList.contains('has-error') && test(this.value)) {
        setFieldState(this, false);
      }
    });
  });
}

/* ────────────────────────────────────────────
   09. FORM SUBMIT
   ──────────────────────────────────────────── */
function validateLoginForm () {
  let ok = true;
  const email = document.getElementById('login-email');
  const pw    = document.getElementById('login-password');
  const eOk   = EMAIL_RE.test((email?.value || '').trim());
  const pOk   = (pw?.value || '').length > 0;
  setFieldState(email, !eOk); if (!eOk) ok = false;
  setFieldState(pw,    !pOk); if (!pOk) ok = false;
  if (!ok) document.querySelector('#login-form .has-error input')?.focus();
  return ok;
}

function validateRegForm () {
  let ok = true;
  const checks = [
    { id:'reg-fname',   test: v => v.trim().length >= 1 },
    { id:'reg-lname',   test: v => v.trim().length >= 1 },
    { id:'reg-email',   test: v => EMAIL_RE.test(v.trim()) },
    { id:'reg-password',test: v => v.length >= 8 },
  ];
  checks.forEach(({ id, test }) => {
    const el = document.getElementById(id);
    const valid = test(el?.value || '');
    setFieldState(el, !valid);
    if (!valid) ok = false;
  });
  // Terms
  const terms = document.getElementById('agree-terms');
  const tGrp  = terms?.closest('.field-group');
  if (!terms?.checked) {
    tGrp?.classList.add('has-error');
    ok = false;
  } else {
    tGrp?.classList.remove('has-error');
  }
  if (!ok) document.querySelector('#register-form .has-error input')?.focus();
  return ok;
}

function showSuccessOverlay (msg, url) {
  const ov = document.createElement('div');
  ov.setAttribute('role', 'status');
  ov.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(12,24,16,.88);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:1rem;animation:fadeIn .3s ease;
    font-family:'Poppins',sans-serif;
  `;
  ov.innerHTML = `
    <div style="
      width:68px;height:68px;border-radius:50%;
      background:linear-gradient(135deg,#3E7C59,#7ED1C6);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 8px 32px rgba(62,124,89,.5);
      animation:scaleIn .55s cubic-bezier(.34,1.56,.64,1) forwards;
    ">
      <svg width="28" height="28" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <p style="color:#fff;font-size:.95rem;font-weight:600;letter-spacing:.2px">${msg}</p>
  `;
  document.body.appendChild(ov);
  setTimeout(() => { window.location.href = url; }, 1300);
}

function initForms () {
  // Login
  const loginForm = document.getElementById('login-form');
  const loginBtn  = loginForm?.querySelector('.btn-sub');
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    loginBtn?.classList.add('loading');
    loginBtn && (loginBtn.disabled = true);
    await new Promise(r => setTimeout(r, 1500));
    loginBtn?.classList.remove('loading');
    loginBtn && (loginBtn.disabled = false);
    showSuccessOverlay('Welcome back! Redirecting…', '../admin-dashboard/dashboard.html');
  });

  // Register
  const regForm = document.getElementById('register-form');
  const regBtn  = regForm?.querySelector('.btn-sub');
  regForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateRegForm()) return;
    regBtn?.classList.add('loading');
    regBtn && (regBtn.disabled = true);
    await new Promise(r => setTimeout(r, 1700));
    regBtn?.classList.remove('loading');
    regBtn && (regBtn.disabled = false);
    showSuccessOverlay('Account created! Redirecting…', '../admin-dashboard/dashboard.html');
  });
}

/* ────────────────────────────────────────────
   PANEL SWITCH — retrigger paw anim
   ──────────────────────────────────────────── */
function hookPawRetrigger () {
  document.getElementById('goto-register')?.addEventListener('click',         () => setTimeout(() => retriggerPaw('paw-b'), 400));
  document.getElementById('overlay-to-register')?.addEventListener('click',   () => setTimeout(() => retriggerPaw('paw-b'), 400));
  document.getElementById('goto-login')?.addEventListener('click',            () => setTimeout(() => retriggerPaw('paw-a'), 400));
  document.getElementById('overlay-to-login')?.addEventListener('click',      () => setTimeout(() => retriggerPaw('paw-a'), 400));
}

/* ────────────────────────────────────────────
   10. ENTRY POINT
   ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initPanelSwitch();
  initPawAnimations();
  hookPawRetrigger();
  initFloatingPaws();
  initEyeToggles();
  initPwStrength();
  initRealTime();
  initForms();
});