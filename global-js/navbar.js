/**
 * PawSpa — navbar.js
 * Auto-runs on DOMContentLoaded (no global.js needed).
 */
'use strict';

/* ── 1. SCROLL ────────────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const tick = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  let pending = false;
  window.addEventListener('scroll', () => {
    if (!pending) {
      requestAnimationFrame(() => { tick(); pending = false; });
      pending = true;
    }
  }, { passive: true });
  tick();
}

/* ── 2. DESKTOP DROPDOWNS ─────────────────────────────────── */
function initDropdownHover() {
  const items = document.querySelectorAll('.nav-item');
  const DELAY = 280;

  items.forEach(item => {
    let timer = null;

    const open = () => {
      clearTimeout(timer);
      items.forEach(o => {
        if (o !== item) {
          o.classList.remove('hovered');
          const l = o.querySelector(':scope > .nav-link');
          if (l) l.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.add('hovered');
      const link = item.querySelector(':scope > .nav-link');
      if (link) link.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      timer = setTimeout(() => {
        item.classList.remove('hovered');
        const link = item.querySelector(':scope > .nav-link');
        if (link) link.setAttribute('aria-expanded', 'false');
      }, DELAY);
    };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);

    /* keyboard */
    const parentLink = item.querySelector(':scope > .nav-link');
    const dropdown   = item.querySelector('.dropdown-menu');
    if (!parentLink || !dropdown) return;

    parentLink.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.classList.contains('hovered') ? (item.classList.remove('hovered'), parentLink.setAttribute('aria-expanded','false')) : (open(), setTimeout(() => dropdown.querySelector('.dropdown-item')?.focus(), 50));
      }
      if (e.key === 'Escape') { item.classList.remove('hovered'); parentLink.setAttribute('aria-expanded','false'); parentLink.focus(); }
    });

    dropdown.addEventListener('keydown', e => {
      const ds = [...dropdown.querySelectorAll('.dropdown-item')];
      const i  = ds.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (ds[i+1] || ds[0]).focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); (ds[i-1] || ds[ds.length-1]).focus(); }
      if (e.key === 'Escape')    { e.preventDefault(); item.classList.remove('hovered'); parentLink.setAttribute('aria-expanded','false'); parentLink.focus(); }
      if (e.key === 'Tab') { setTimeout(() => { if (!item.contains(document.activeElement)) { item.classList.remove('hovered'); parentLink.setAttribute('aria-expanded','false'); } }, 0); }
    });
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) {
      items.forEach(item => {
        item.classList.remove('hovered');
        const l = item.querySelector(':scope > .nav-link');
        if (l) l.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

/* ── 3. MOBILE MENU ───────────────────────────────────────── */
function initMobileMenu() {
  const menu       = document.getElementById('mobile-menu');
  const toggleBtns = document.querySelectorAll('[data-mobile-toggle]');
  const hamOpen    = document.querySelector('.ham-open');
  const hamClose   = document.querySelector('.ham-close');

  /*
    Overlay: find by id first, then by class.
    Your mount HTML uses id="mobile-overlay" which is fine.
  */
  const overlay = document.getElementById('mobile-overlay')
               || document.querySelector('.mobile-overlay');

  if (!menu) {
    console.warn('navbar.js: #mobile-menu not found');
    return;
  }

  let isOpen = false;
  const SLIDE_MS = 350; // must match CSS transition duration
  let closeTimer = null;

  function openMenu() {
    clearTimeout(closeTimer);
    isOpen = true;

    /* Step 1 — make element participates in layout (display:flex) */
    menu.style.display = 'flex';
    if (overlay) overlay.style.display = 'block';

    /*
      Step 2 — force the browser to compute layout so it registers
      the display change BEFORE we add .open.
      Without this reflow, the transition doesn't fire because the
      browser batches style changes together.
    */
    menu.getBoundingClientRect();

    /* Step 3 — add .open → triggers CSS transform transition */
    menu.classList.add('open');
    if (overlay) overlay.classList.add('open');

    document.body.style.overflow = 'hidden';
    toggleBtns.forEach(b => b.setAttribute('aria-expanded', 'true'));
    if (hamOpen)  hamOpen.style.display  = 'none';
    if (hamClose) hamClose.style.display = 'block';

    const firstLink = menu.querySelector('.mobile-nav-link, a');
    if (firstLink) setTimeout(() => firstLink.focus(), 320);
  }

  function closeMenu() {
    isOpen = false;

    /* Step 1 — remove .open → triggers slide-out transition */
    menu.classList.remove('open');
    if (overlay) overlay.classList.remove('open');

    document.body.style.overflow = '';
    toggleBtns.forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (hamOpen)  hamOpen.style.display  = 'block';
    if (hamClose) hamClose.style.display = 'none';

    /* Step 2 — after animation finishes, truly hide it */
    closeTimer = setTimeout(() => {
      menu.style.display = '';
      if (overlay) overlay.style.display = '';
    }, SLIDE_MS);
  }

  toggleBtns.forEach(b => b.addEventListener('click', () => isOpen ? closeMenu() : openMenu()));

  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      document.querySelector('[data-mobile-toggle]')?.focus();
    }
  });

  /* focus trap */
  menu.addEventListener('keydown', e => {
    if (!isOpen || e.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')];
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
  });

  /* accordion */
  menu.querySelectorAll('[data-mobile-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub     = btn.nextElementSibling;
      const chevron = btn.querySelector('.mobile-chevron');
      if (!sub) return;

      const expanded = btn.classList.contains('active');

      /* collapse all others */
      menu.querySelectorAll('[data-mobile-accordion].active').forEach(other => {
        if (other === btn) return;
        other.classList.remove('active');
        other.setAttribute('aria-expanded', 'false');
        const os = other.nextElementSibling;
        const oc = other.querySelector('.mobile-chevron');
        if (os) os.style.maxHeight = '0px';
        if (oc) oc.style.transform = 'rotate(0deg)';
      });

      if (expanded) {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        sub.style.maxHeight = '0px';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        sub.style.maxHeight = sub.scrollHeight + 'px';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
    });
  });

  /* close on link click */
  menu.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', () => setTimeout(closeMenu, 80));
  });
}

/* ── 4. ACTIVE LINK ───────────────────────────────────────── */
function highlightActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link,.dropdown-item,.mobile-nav-link--plain,.mobile-submenu-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) return;
    try {
      const lp = new URL(href, location.href).pathname;
      const active =
        lp === path ||
        (path.endsWith('/') && lp === path + 'index.html') ||
        (lp.endsWith('/index.html') && lp.replace('/index.html', '/') === path);
      if (active) {
        link.classList.add('active');
        link.closest('.nav-item')?.querySelector(':scope > .nav-link')?.classList.add('active');
        const sub = link.closest('.mobile-submenu');
        if (sub) sub.previousElementSibling?.classList.add('active');
      }
    } catch { /* skip bad urls */ }
  });
}

/* ── 5. PAGE OFFSET ───────────────────────────────────────── */
function initPageOffset() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const update = () => {
    const h = navbar.offsetHeight;
    document.documentElement.style.setProperty('--navbar-height', h + 'px');
    const main = document.querySelector('main.page-offset');
    if (main) main.style.paddingTop = h + 'px';
  };
  update();
  window.addEventListener('resize', update, { passive: true });
}

/* ── 6. BOOK NOW ──────────────────────────────────────────── */
function initBookNowButtons() {
  document.querySelectorAll('[data-book-now]').forEach(btn => {
    if (!btn.parentNode) return;
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', e => {
      e.preventDefault();
      if (window.PawSpa?.openModal) {
        window.PawSpa.openModal('booking-modal');
      } else {
        (document.getElementById('contact-form') || document.querySelector('.contact-section'))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── 7. ENTRY POINT ───────────────────────────────────────── */
function initNavbarComponent() {
  initNavbarScroll();
  initDropdownHover();
  initMobileMenu();
  highlightActiveNavLink();
  initPageOffset();
  setTimeout(initBookNowButtons, 50);
}

/* ── 8. EXPORT + AUTO-RUN ─────────────────────────────────── */
window.initNavbarComponent = initNavbarComponent;

/* Auto-run whether DOM is ready or not */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbarComponent);
} else {
  initNavbarComponent();
}


'use strict';

/* ── SCROLL ── */
(function() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const tick = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  let pending = false;
  window.addEventListener('scroll', () => { if (!pending) { requestAnimationFrame(() => { tick(); pending = false; }); pending = true; } }, { passive: true });
  tick();
})();

/* ── DROPDOWN HOVER ── */
(function() {
  const items = document.querySelectorAll('.nav-item');
  const DELAY = 280;
  items.forEach(item => {
    let timer = null;
    const open = () => {
      clearTimeout(timer);
      items.forEach(o => { if (o !== item) { o.classList.remove('hovered'); const l = o.querySelector(':scope > .nav-link'); if (l) l.setAttribute('aria-expanded','false'); } });
      item.classList.add('hovered');
      const l = item.querySelector(':scope > .nav-link'); if (l) l.setAttribute('aria-expanded','true');
    };
    const close = () => { timer = setTimeout(() => { item.classList.remove('hovered'); const l = item.querySelector(':scope > .nav-link'); if (l) l.setAttribute('aria-expanded','false'); }, DELAY); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-item')) { items.forEach(item => { item.classList.remove('hovered'); const l = item.querySelector(':scope > .nav-link'); if (l) l.setAttribute('aria-expanded','false'); }); } });
})();

/* ── MOBILE MENU ── */
(function() {
  const menu = document.getElementById('mobile-menu');
  const toggleBtns = document.querySelectorAll('[data-mobile-toggle]');
  const hamOpen  = document.querySelector('.ham-open');
  const hamClose = document.querySelector('.ham-close');
  const overlay  = document.getElementById('mobile-overlay') || document.querySelector('.mobile-overlay');
  if (!menu) return;

  let isOpen = false;
  let closeTimer = null;
  const SLIDE_MS = 350;

  function openMenu() {
    clearTimeout(closeTimer);
    isOpen = true;
    menu.style.display = 'flex';
    if (overlay) overlay.style.display = 'block';
    menu.getBoundingClientRect(); // force reflow so transition fires
    menu.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggleBtns.forEach(b => b.setAttribute('aria-expanded','true'));
    if (hamOpen)  hamOpen.style.display  = 'none';
    if (hamClose) hamClose.style.display = 'block';
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    toggleBtns.forEach(b => b.setAttribute('aria-expanded','false'));
    if (hamOpen)  hamOpen.style.display  = 'block';
    if (hamClose) hamClose.style.display = 'none';
    closeTimer = setTimeout(() => {
      menu.style.display = '';
      if (overlay) overlay.style.display = '';
    }, SLIDE_MS);
  }

  toggleBtns.forEach(b => b.addEventListener('click', () => isOpen ? closeMenu() : openMenu()));
  if (overlay) overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeMenu(); });

  /* accordion */
  menu.querySelectorAll('[data-mobile-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      const chevron = btn.querySelector('.mobile-chevron');
      if (!sub) return;
      const expanded = btn.classList.contains('active');
      menu.querySelectorAll('[data-mobile-accordion].active').forEach(other => {
        if (other === btn) return;
        other.classList.remove('active'); other.setAttribute('aria-expanded','false');
        const os = other.nextElementSibling; const oc = other.querySelector('.mobile-chevron');
        if (os) os.style.maxHeight = '0px'; if (oc) oc.style.transform = 'rotate(0deg)';
      });
      if (expanded) {
        btn.classList.remove('active'); btn.setAttribute('aria-expanded','false');
        sub.style.maxHeight = '0px'; if (chevron) chevron.style.transform = 'rotate(0deg)';
      } else {
        btn.classList.add('active'); btn.setAttribute('aria-expanded','true');
        sub.style.maxHeight = sub.scrollHeight + 'px'; if (chevron) chevron.style.transform = 'rotate(180deg)';
      }
    });
  });
})();

/* ── THEME TOGGLE ── */
(function() {
  const html = document.documentElement;
  const stored = localStorage.getItem('pawspa-theme');
  if (stored === 'dark') html.setAttribute('data-theme','dark');

  function updateIcons() {
    const dark = html.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('[data-icon-light]').forEach(el => el.style.display = dark ? '' : 'none');
    document.querySelectorAll('[data-icon-dark]').forEach(el  => el.style.display = dark ? 'none' : '');
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'));
  }
  updateIcons();

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = html.getAttribute('data-theme') === 'dark';
      if (isDark) { html.removeAttribute('data-theme'); localStorage.setItem('pawspa-theme','light'); }
      else        { html.setAttribute('data-theme','dark'); localStorage.setItem('pawspa-theme','dark'); }
      updateIcons();
    });
  });
})();

/* ── RTL TOGGLE ── */
(function() {
  document.querySelectorAll('[data-rtl-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
      document.documentElement.setAttribute('dir', isRtl ? 'ltr' : 'rtl');
      document.querySelectorAll('[data-rtl-toggle]').forEach(b => b.classList.toggle('active', !isRtl));
    });
  });
})();