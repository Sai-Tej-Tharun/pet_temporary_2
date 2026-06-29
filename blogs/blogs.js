/**
 * ============================================================
 * PawSpa — blogs.js
 * Blog listing page interactions:
 *   - Category filtering (pills + sidebar)
 *   - Sidebar search with live filtering
 *   - Sort selector
 *   - Pagination (simulated)
 *   - Sidebar newsletter form
 *   - CTA newsletter form
 *   - Sticky sidebar tracking
 *   - Scroll-triggered card animations
 *   - Tag cloud filtering
 *   - Results count update
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────────
   1. CONSTANTS
   ───────────────────────────────────────────── */

/** All blog card items (NodeList → Array for easy manipulation) */
let allCards = [];

/** Currently active filter */
let activeFilter = '*';

/** Current search term */
let searchTerm = '';

/* ─────────────────────────────────────────────
   2. FILTER ENGINE
   Combines category filter + search term.
   ───────────────────────────────────────────── */

/**
 * Applies the current filter + search to all cards.
 * Animates cards in/out with CSS classes.
 */
function applyFilters() {
  const grid     = document.getElementById('blog-grid');
  const noResult = document.getElementById('no-results');
  let visibleCount = 0;

  allCards.forEach((card, i) => {
    const category = card.dataset.category || '';
    const titleEl  = card.querySelector('.blog-card-title');
    const excerptEl = card.querySelector('.blog-card-excerpt');
    const title    = (titleEl?.textContent || '').toLowerCase();
    const excerpt  = (excerptEl?.textContent || '').toLowerCase();
    const term     = searchTerm.toLowerCase().trim();

    /* Category match */
    const catMatch = activeFilter === '*' || category === activeFilter;

    /* Search match — title or excerpt */
    const searchMatch = !term || title.includes(term) || excerpt.includes(term);

    const shouldShow = catMatch && searchMatch;

    if (shouldShow) {
      card.removeAttribute('hidden');
      card.classList.remove('hiding');
      card.classList.add('showing');
      card.style.animationDelay = `${(i % 3) * 0.07}s`;
      visibleCount++;
    } else {
      card.classList.add('hiding');
      card.classList.remove('showing');
      /* Use animationend to hide so the CSS animation plays */
      const onEnd = () => {
        card.setAttribute('hidden', '');
        card.classList.remove('hiding');
        card.removeEventListener('animationend', onEnd);
      };
      card.addEventListener('animationend', onEnd);
    }
  });

  /* Update count label */
  const countEl = document.getElementById('visible-count');
  if (countEl) countEl.textContent = visibleCount;

  /* Toggle no-results message */
  if (noResult) {
    noResult.hidden = visibleCount > 0;
  }
}

/* ─────────────────────────────────────────────
   3. HERO FILTER PILLS
   ───────────────────────────────────────────── */

function initHeroPills() {
  const pills = document.querySelectorAll('.filter-pill[data-filter]');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      activeFilter = pill.dataset.filter;

      /* Update active state on hero pills */
      pills.forEach(p => p.classList.remove('filter-pill--active'));
      pill.classList.add('filter-pill--active');

      /* Sync sidebar category buttons */
      syncSidebarCats(activeFilter);

      applyFilters();

      /* Smooth scroll to grid */
      const grid = document.getElementById('blog-grid');
      if (grid) {
        const offset = 100;
        const top = grid.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   4. SIDEBAR CATEGORY BUTTONS
   ───────────────────────────────────────────── */

function initSidebarCats() {
  const catBtns = document.querySelectorAll('.sidebar-cat-btn[data-filter]');

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;

      /* Update sidebar active state */
      syncSidebarCats(activeFilter);

      /* Sync hero pills */
      syncHeroPills(activeFilter);

      applyFilters();

      /* Scroll to grid */
      const grid = document.getElementById('blog-grid');
      if (grid) {
        const offset = 100;
        const top = grid.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/**
 * Syncs sidebar category button active states.
 * @param {string} filter
 */
function syncSidebarCats(filter) {
  document.querySelectorAll('.sidebar-cat-btn').forEach(btn => {
    btn.classList.toggle('sidebar-cat-btn--active', btn.dataset.filter === filter);
  });
}

/**
 * Syncs hero pill active states.
 * @param {string} filter
 */
function syncHeroPills(filter) {
  document.querySelectorAll('.filter-pill[data-filter]').forEach(pill => {
    pill.classList.toggle('filter-pill--active', pill.dataset.filter === filter);
  });
}

/* ─────────────────────────────────────────────
   5. TAG CLOUD FILTERING
   ───────────────────────────────────────────── */

function initTagCloud() {
  const tags = document.querySelectorAll('.sidebar-tag[data-filter]');

  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      activeFilter = tag.dataset.filter;
      syncSidebarCats(activeFilter);
      syncHeroPills(activeFilter);
      applyFilters();

      /* Scroll to grid */
      const grid = document.getElementById('blog-grid');
      if (grid) {
        const top = grid.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────────
   6. SIDEBAR LIVE SEARCH
   ───────────────────────────────────────────── */

function initSearch() {
  const input = document.getElementById('sidebar-search');
  if (!input) return;

  /* Debounced input handler */
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchTerm = input.value.trim();
      applyFilters();
    }, 280);
  });

  /* Clear on Escape */
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      searchTerm = '';
      applyFilters();
    }
    /* Apply immediately on Enter */
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceTimer);
      searchTerm = input.value.trim();
      applyFilters();
    }
  });

  /* Search button */
  const searchBtn = document.querySelector('.sidebar-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchTerm = input.value.trim();
      applyFilters();
    });
  }
}

/* ─────────────────────────────────────────────
   7. RESET FILTER BUTTON
   ───────────────────────────────────────────── */

function initResetButton() {
  const resetBtn = document.getElementById('reset-filters-btn');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    activeFilter = '*';
    searchTerm   = '';

    /* Reset search input */
    const searchInput = document.getElementById('sidebar-search');
    if (searchInput) searchInput.value = '';

    /* Reset all UI states */
    syncSidebarCats('*');
    syncHeroPills('*');
    applyFilters();
  });
}

/* ─────────────────────────────────────────────
   8. SORT SELECTOR
   (Simulated — in production would re-fetch/re-order data)
   ───────────────────────────────────────────── */

function initSort() {
  const select = document.getElementById('sort-select');
  if (!select) return;

  select.addEventListener('change', () => {
    const value = select.value;
    const grid  = document.getElementById('blog-grid');
    if (!grid) return;

    /* Get all visible cards */
    const cards = [...grid.querySelectorAll('.blog-card-item:not([hidden])')];

    /* Sort in-place (by date text — simulated) */
    const sorted = cards.sort((a, b) => {
      const dateA = a.querySelector('time')?.getAttribute('datetime') || '';
      const dateB = b.querySelector('time')?.getAttribute('datetime') || '';

      if (value === 'newest') return dateB.localeCompare(dateA);
      if (value === 'oldest') return dateA.localeCompare(dateB);
      /* 'popular' — random for demo */
      return Math.random() - 0.5;
    });

    /* Re-append sorted cards with animation */
    sorted.forEach((card, i) => {
      card.style.animationDelay = `${i * 0.06}s`;
      card.classList.add('showing');
      grid.appendChild(card);
    });

    /* Show toast */
    if (window.PawSpa?.showToast) {
      const labels = { newest: 'Newest first', oldest: 'Oldest first', popular: 'Most popular' };
      window.PawSpa.showToast(`Sorted: ${labels[value] || 'Updated'}`, 'info', 2500);
    }
  });
}

/* ─────────────────────────────────────────────
   9. PAGINATION
   (Simulated — shows a toast and scrolls to top of grid)
   ───────────────────────────────────────────── */

function initPagination() {
  const pageBtns = document.querySelectorAll('.blog-pagination .page-btn:not(.page-ellipsis):not(.page-btn--prev):not(.page-btn--next)');
  const prevBtn  = document.querySelector('.page-btn--prev');
  const nextBtn  = document.querySelector('.page-btn--next');

  let currentPage = 1;
  const totalPages = 8;

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;

    /* Update active button UI */
    pageBtns.forEach((btn, i) => {
      const isActive = parseInt(btn.textContent) === currentPage ||
                       (i === 0 && currentPage === 1);
      btn.classList.toggle('page-btn--active', isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : false);
    });

    /* Enable/disable prev/next */
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

    /* Scroll to grid */
    const grid = document.getElementById('blog-grid');
    if (grid) {
      const top = grid.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    /* Toast */
    if (window.PawSpa?.showToast) {
      window.PawSpa.showToast(`Page ${currentPage} of ${totalPages}`, 'info', 2000);
    }
  }

  pageBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.textContent);
      if (!isNaN(page)) goToPage(page);
    });
  });

  if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
}

/* ─────────────────────────────────────────────
   10. NEWSLETTER FORMS
   ───────────────────────────────────────────── */

/**
 * Handles a newsletter form with validation + toast.
 * @param {string} formId
 */
function initNewsletterForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn  = form.querySelector('button[type="submit"]');
    const email      = emailInput?.value.trim();

    /* Validate */
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.style.borderColor = '#e05252';
      emailInput.focus();

      if (window.PawSpa?.showToast) {
        window.PawSpa.showToast('Please enter a valid email address.', 'error');
      }
      return;
    }

    emailInput.style.borderColor = '';

    /* Loading state */
    const originalText = submitBtn?.textContent || 'Subscribe';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing…';
    }

    /* Simulate async */
    await new Promise(resolve => setTimeout(resolve, 800));

    /* Success */
    if (window.PawSpa?.showToast) {
      window.PawSpa.showToast('Welcome to the PawSpa Journal! 🐾 Check your inbox.', 'success', 5000);
    }

    form.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  /* Inline validation on blur */
  const emailInput = form.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        emailInput.style.borderColor = '#e05252';
      } else {
        emailInput.style.borderColor = '';
      }
    });
  }
}

/* ─────────────────────────────────────────────
   11. SCROLL-TRIGGERED CARD ANIMATIONS
   Uses IntersectionObserver for performant reveals.
   ───────────────────────────────────────────── */

function initCardScrollAnimations() {
  /* Respect prefers-reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Reset animations so we can re-trigger on scroll */
  allCards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(28px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card  = entry.target;
        const index = allCards.indexOf(card);
        const delay = (index % 3) * 70; /* stagger within row */

        setTimeout(() => {
          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
        }, delay);

        observer.unobserve(card);
      }
    });
  }, {
    threshold:  0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  allCards.forEach(card => observer.observe(card));
}

/* ─────────────────────────────────────────────
   12. FEATURED CARD PARALLAX EFFECT
   Subtle parallax on the featured image on scroll.
   ───────────────────────────────────────────── */

function initFeaturedParallax() {
  const featured = document.querySelector('.featured-card-img');
  if (!featured) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const wrap = document.querySelector('.featured-card-img-wrap');
  if (!wrap) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        /* Only apply when in viewport */
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const scrolled = (rect.top / window.innerHeight) * 20;
          featured.style.transform = `scale(1.04) translateY(${scrolled}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   13. HERO CATEGORY PILL — SMOOTH SCROLL HINT
   ───────────────────────────────────────────── */

function initScrollIndicator() {
  const scrollLine = document.querySelector('.scroll-indicator');
  if (!scrollLine) return;

  /* Hide after user starts scrolling */
  const onScroll = () => {
    if (window.scrollY > 80) {
      scrollLine.style.opacity = '0';
      scrollLine.style.transition = 'opacity 0.5s ease';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ─────────────────────────────────────────────
   14. BOOK NOW WIRING
   Re-wire any Book Now buttons that appear
   after global.js has already run.
   ───────────────────────────────────────────── */

function initBookNowBtns() {
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
   15. SIDEBAR TOGGLE ON MOBILE
   Adds a toggle button for sidebar on small screens.
   ───────────────────────────────────────────── */

function initMobileSidebarToggle() {
  if (window.innerWidth >= 1024) return; /* Only on mobile/tablet */

  const sidebar = document.querySelector('.blog-sidebar');
  if (!sidebar) return;

  /* Create toggle button */
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-sidebar-toggle';
  toggle.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="15" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
    Filters & Sidebar
  `;
  toggle.style.cssText = `
    display: flex; align-items: center; gap: 0.5rem;
    margin: 0 0 1rem; padding: 0.625rem 1.25rem;
    font-family: var(--font-heading); font-size: 0.875rem;
    font-weight: 600; color: var(--paw-green);
    background: rgba(62,124,89,0.08); border: 1.5px solid var(--paw-green);
    border-radius: 999px; cursor: pointer;
    transition: all 0.2s ease;
  `;

  /* Insert before sidebar */
  sidebar.parentElement.insertBefore(toggle, sidebar);

  /* Initially collapsed on mobile */
  sidebar.style.display = 'none';
  let open = false;

  toggle.addEventListener('click', () => {
    open = !open;
    sidebar.style.display = open ? 'flex' : 'none';
    toggle.style.background = open ? 'rgba(62,124,89,0.15)' : 'rgba(62,124,89,0.08)';
    toggle.innerHTML = open
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Close Sidebar`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> Filters & Sidebar`;
  });
}

/* ─────────────────────────────────────────────
   16. COMPONENT LOADER (Navbar + Footer)
   Uses global.js if available, else minimal local
   ───────────────────────────────────────────── */

async function loadComponents() {
  const navMount  = document.getElementById('navbar-mount');
  const footMount = document.getElementById('footer-mount');

  /**
   * Resolve component path dynamically.
   * blogs/blogs.html → ../components/
   */
  const base = '../components/';

  if (navMount) {
    try {
      const res  = await fetch(`${base}navbar.html`);
      const html = await res.text();
      navMount.innerHTML = html;
    } catch (e) { console.warn('Navbar load failed:', e.message); }
  }

  if (footMount) {
    try {
      const res  = await fetch(`${base}footer.html`);
      const html = await res.text();
      footMount.innerHTML = html;
    } catch (e) { console.warn('Footer load failed:', e.message); }
  }
}

/* ─────────────────────────────────────────────
   17. ENTRY POINT
   ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  /* Load navbar + footer if global.js hasn't done it */
  if (!document.querySelector('.navbar')) {
    await loadComponents();
  }

  /* Cache all blog card items */
  allCards = [...document.querySelectorAll('.blog-card-item')];

  /* Initialise all modules */
  initHeroPills();
  initSidebarCats();
  initTagCloud();
  initSearch();
  initResetButton();
  initSort();
  initPagination();
  initNewsletterForm('sidebar-newsletter-form');
  initNewsletterForm('cta-newsletter-form');
  initScrollIndicator();
  initBookNowBtns();
  initMobileSidebarToggle();

  /* Kick off scroll animations (after a small delay for paint) */
  requestAnimationFrame(() => {
    initCardScrollAnimations();
    initFeaturedParallax();
  });
});
