(() => {
  'use strict';

  const DEFAULT_SCREEN = 'cover';
  const screens = Array.from(document.querySelectorAll('.screen'));
  const screenIds = screens.map(s => s.id);

  function showScreen(id, { pushHistory = true } = {}) {
    if (!screenIds.includes(id)) id = DEFAULT_SCREEN;
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    if (pushHistory && location.hash.slice(1) !== id) {
      location.hash = id;
    }
    document.title = id === DEFAULT_SCREEN
      ? 'XV Años · Mariana Claro'
      : `${document.querySelector(`#${id}`).getAttribute('aria-label')} · Mariana Claro`;
  }

  function navigate(id) {
    showScreen(id);
  }

  // Delegate clicks on any element with data-nav
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-nav]');
    if (!target) return;
    navigate(target.getAttribute('data-nav'));
  });

  // Hash-based routing (supports back/forward + deep links)
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '') || DEFAULT_SCREEN;
    showScreen(id, { pushHistory: false });
  });

  // Initial screen
  const initial = location.hash.replace('#', '');
  showScreen(screenIds.includes(initial) ? initial : DEFAULT_SCREEN, { pushHistory: false });

  // ---------- Envelope open animation ----------
  const openEnvelopeBtn = document.getElementById('openEnvelope');
  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener('click', () => {
      const coverScreen = document.getElementById('cover');
      coverScreen.classList.add('leaving');
      window.setTimeout(() => {
        navigate('presentacion');
        coverScreen.classList.remove('leaving');
      }, 480);
    });
  }

  // ---------- Countdown ----------
  // Guatemala (UTC-6, no DST) — start of the Misa
  const EVENT_DATE = new Date('2026-11-21T16:00:00-06:00');

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMin = document.getElementById('cd-min');
  const cdSec = document.getElementById('cd-sec');

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateCountdown() {
    if (!cdDays) return;
    const diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) {
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMin.textContent = '00';
      cdSec.textContent = '00';
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    cdDays.textContent = pad(days);
    cdHours.textContent = pad(hours);
    cdMin.textContent = pad(minutes);
    cdSec.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ---------- RSVP modal ----------
  const rsvpOverlay = document.getElementById('rsvpOverlay');
  const openRsvpBtn = document.getElementById('openRsvp');
  const closeRsvpBtn = document.getElementById('closeRsvp');
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpSuccess = document.getElementById('rsvpSuccess');

  function openRsvp() {
    rsvpOverlay.hidden = false;
    rsvpForm.hidden = false;
    rsvpSuccess.hidden = true;
  }
  function closeRsvp() {
    rsvpOverlay.hidden = true;
  }

  if (openRsvpBtn) openRsvpBtn.addEventListener('click', openRsvp);
  if (closeRsvpBtn) closeRsvpBtn.addEventListener('click', closeRsvp);
  if (rsvpOverlay) {
    rsvpOverlay.addEventListener('click', (e) => {
      if (e.target === rsvpOverlay) closeRsvp();
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(rsvpForm).entries());

      // TODO: reemplazar por la llamada real al backend/API de confirmaciones.
      // Ejemplo futuro: fetch('/api/rsvp', { method: 'POST', body: JSON.stringify(data) })
      console.log('RSVP recibido (pendiente de conectar a backend):', data);

      rsvpForm.hidden = true;
      rsvpSuccess.hidden = false;
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rsvpOverlay && !rsvpOverlay.hidden) closeRsvp();
  });
})();
