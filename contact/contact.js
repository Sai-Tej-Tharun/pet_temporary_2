/**
 * ============================================================
 * PawSpa — contact.js
 * Page-specific JS for the Contact page.
 * Handles: tab switching, form submissions, file upload,
 * live open/closed status, drag-and-drop, dog blink.
 * ============================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Contact form tab switching ─────────────────────
  initContactTabs();

  // ── 2. General enquiry form ────────────────────────────
  initGeneralForm();

  // ── 3. Booking form ────────────────────────────────────
  initBookingForm();

  // ── 4. File upload areas (drag & drop) ────────────────
  initFileUpload('file-drop-zone',   'c-upload',   'file-preview');
  initFileUpload('file-drop-zone-b', 'b-upload',   'file-preview-b');

  // ── 5. Live open/closed indicator ─────────────────────
  initLiveStatus();

  // ── 6. Dog blinking in art scene ──────────────────────
  initArtDogBlink();

  // ── 7. Set minimum date for booking ───────────────────
  const dateInput = document.getElementById('b-date');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

});

/* ─────────────────────────────────────────────
   1. CONTACT TABS
   ───────────────────────────────────────────── */
function initContactTabs() {
  const tabBtns  = document.querySelectorAll('.ctab-btn');
  const panels   = document.querySelectorAll('.ctab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.ctab;

      // Update button states
      tabBtns.forEach(b => b.classList.remove('ctab-active'));
      btn.classList.add('ctab-active');

      // Show matching panel
      panels.forEach(p => {
        p.classList.remove('ctab-panel-active');
        // Match panel by form id: contact-form-{target}
        if (p.id === `contact-form-${target}`) {
          p.classList.add('ctab-panel-active');
        }
      });
    });
  });
}

/* ─────────────────────────────────────────────
   2. GENERAL ENQUIRY FORM SUBMIT
   ───────────────────────────────────────────── */
function initGeneralForm() {
  const submitBtn = document.getElementById('contact-submit-general');
  const form      = document.getElementById('contact-form-general');
  if (!submitBtn || !form) return;

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Use global validate if available, otherwise inline
    const valid = window.PawSpa
      ? window.PawSpa.validateForm(form)
      : localValidate(form);

    if (!valid) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 11-9-9"/>
      </svg>
      Sending…
    `;

    // Simulate async send (replace with real API call)
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Message Sent!
      `;
      submitBtn.style.background = 'var(--paw-green-dark)';

      if (window.PawSpa) {
        window.PawSpa.showToast(
          "Message received! We'll get back to you within 24 hours. 🐾",
          'success',
          6000
        );
      }

      form.reset();
      clearFilePreviews();

      // Reset button after 3s
      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send Message
        `;
        submitBtn.style.background = '';
      }, 3000);

    }, 1600);
  });
}

/* ─────────────────────────────────────────────
   3. BOOKING FORM SUBMIT
   ───────────────────────────────────────────── */
function initBookingForm() {
  const submitBtn = document.getElementById('contact-submit-booking');
  const form      = document.getElementById('contact-form-booking');
  if (!submitBtn || !form) return;

  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const valid = window.PawSpa
      ? window.PawSpa.validateForm(form)
      : localValidate(form);

    if (!valid) return;

    // Gather selected values for the confirmation toast
    const service   = form.querySelector('#b-service');
    const date      = form.querySelector('#b-date');
    const time      = form.querySelector('#b-time');
    const petName   = form.querySelector('#b-breed');

    const svcText  = service?.options[service.selectedIndex]?.text || 'your service';
    const dateText = date?.value ? new Date(date.value).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long'}) : '';
    const timeText = time?.options[time.selectedIndex]?.text || '';
    const petText  = petName?.value ? ` for ${petName.value}` : '';

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 11-9-9"/>
      </svg>
      Confirming…
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Appointment Confirmed!
      `;
      submitBtn.style.background = 'var(--paw-green-dark)';

      const msg = `Appointment booked${petText}! ${svcText} on ${dateText} at ${timeText}. We'll send a confirmation SMS. 🐾`;
      if (window.PawSpa) {
        window.PawSpa.showToast(msg, 'success', 8000);
      }

      form.reset();
      clearFilePreviews();

      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Confirm Appointment
        `;
        submitBtn.style.background = '';
      }, 3500);

    }, 1800);
  });
}

/* ─────────────────────────────────────────────
   4. FILE UPLOAD — DRAG AND DROP
   @param {string} zoneId    - drop zone element id
   @param {string} inputId   - file input element id
   @param {string} previewId - preview container id
   ───────────────────────────────────────────── */
function initFileUpload(zoneId, inputId, previewId) {
  const zone    = document.getElementById(zoneId);
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!zone || !input || !preview) return;

  // Drag events
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) showFilePreview(file, preview);
  });

  // Keyboard accessibility
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  // Normal file input change
  input.addEventListener('change', () => {
    if (input.files[0]) showFilePreview(input.files[0], preview);
  });
}

/**
 * Renders a file preview row.
 * @param {File} file
 * @param {HTMLElement} container
 */
function showFilePreview(file, container) {
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    if (window.PawSpa) {
      window.PawSpa.showToast('File is too large. Maximum size is 5MB.', 'error');
    }
    return;
  }

  const sizeKb = (file.size / 1024).toFixed(1);
  const icons  = { pdf: '📄', jpg: '🖼️', jpeg: '🖼️', png: '🖼️' };
  const ext    = file.name.split('.').pop().toLowerCase();
  const icon   = icons[ext] || '📎';

  container.style.display = 'flex';
  container.innerHTML = `
    <span>${icon}</span>
    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${file.name}</span>
    <span style="color:var(--text-muted);font-size:var(--text-xs);white-space:nowrap">${sizeKb} KB</span>
    <button type="button" onclick="clearThisPreview(this)"
      style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0;margin-left:0.25rem"
      aria-label="Remove file">✕</button>
  `;
}

/** Clears a single file preview when user clicks ✕ */
window.clearThisPreview = function(btn) {
  const container = btn.closest('.file-preview');
  if (container) container.style.display = 'none';
};

/** Clears all file previews (called on form reset) */
function clearFilePreviews() {
  document.querySelectorAll('.file-preview').forEach(p => { p.style.display = 'none'; });
}

/* ─────────────────────────────────────────────
   5. LIVE OPEN / CLOSED STATUS
   Checks current time against opening hours
   and updates the status pill in the map panel.
   ───────────────────────────────────────────── */
function initLiveStatus() {
  const statusText = document.getElementById('status-text');
  const statusDot  = document.getElementById('status-dot');
  if (!statusText || !statusDot) return;

  function check() {
    const now  = new Date();
    const day  = now.getDay();   // 0=Sun, 6=Sat
    const hour = now.getHours();
    const min  = now.getMinutes();
    const time = hour * 60 + min; // minutes since midnight

    // Hours: Mon–Fri 9:00–19:00, Sat 9:00–18:00, Sun closed
    let open = false;
    let closeTime = '';

    if (day >= 1 && day <= 5) {
      open = time >= 540 && time < 1140; // 9AM–7PM
      closeTime = '7:00 PM';
    } else if (day === 6) {
      open = time >= 540 && time < 1080; // 9AM–6PM
      closeTime = '6:00 PM';
    }

    if (open) {
      statusDot.className  = 'status-dot open';
      statusText.textContent = `Open now · Closes at ${closeTime}`;
    } else if (day === 0) {
      statusDot.className  = 'status-dot closed';
      statusText.textContent = 'Closed today · Call to arrange';
    } else {
      statusDot.className  = 'status-dot closed';
      statusText.textContent = 'Currently closed · Opens at 9:00 AM';
    }
  }

  check();
  // Refresh every minute
  setInterval(check, 60000);
}

/* ─────────────────────────────────────────────
   6. ART DOG BLINK
   ───────────────────────────────────────────── */
function initArtDogBlink() {
  const dogSvg = document.querySelector('.art-dog-svg');
  if (!dogSvg) return;

  const pupils = dogSvg.querySelectorAll('ellipse[rx="7"]');

  function blink() {
    pupils.forEach(p => {
      p.style.transition   = 'transform 0.06s ease';
      p.style.transformBox = 'fill-box';
      p.style.transformOrigin = 'center';
      p.style.transform    = 'scaleY(0.08)';
    });

    setTimeout(() => {
      pupils.forEach(p => { p.style.transform = 'scaleY(1)'; });
    }, 130);

    setTimeout(blink, 2000 + Math.random() * 4000);
  }

  setTimeout(blink, 1200);
}

/* ─────────────────────────────────────────────
   LOCAL VALIDATE FALLBACK
   (in case global.js hasn't loaded yet)
   ───────────────────────────────────────────── */
function localValidate(form) {
  let valid = true;
  form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error', 'has-success'));

  form.querySelectorAll('[required]').forEach(field => {
    const group   = field.closest('.form-group');
    if (!group) return;
    const isEmpty  = !field.value.trim();
    const isEmail  = field.type === 'email';
    const emailOk  = isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) : true;

    if (isEmpty || !emailOk) {
      group.classList.add('has-error');
      valid = false;
    } else {
      group.classList.add('has-success');
    }
  });

  const firstError = form.querySelector('.has-error .form-control, .has-error select');
  if (firstError) firstError.focus();
  return valid;
}
