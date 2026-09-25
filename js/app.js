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
  // One click: crossfade closed -> open envelope (revealing the card
  // photo), hold briefly so it's actually seen, then fade out and move
  // on to Presentación. No second click required.
  const openEnvelopeBtn = document.getElementById('openEnvelope');
  if (openEnvelopeBtn) {
    openEnvelopeBtn.addEventListener('click', () => {
      if (openEnvelopeBtn.classList.contains('opened')) return;
      const coverScreen = document.getElementById('cover');
      openEnvelopeBtn.classList.add('opened');
      startBackgroundMusic();
      window.setTimeout(() => {
        coverScreen.classList.add('leaving');
        window.setTimeout(() => {
          navigate('presentacion');
          coverScreen.classList.remove('leaving');
          openEnvelopeBtn.classList.remove('opened');
        }, 480);
      }, 1100);
    });
  }

  // ---------- Background music ----------
  // YouTube IFrame API, kept off-screen (see #yt-player in CSS/HTML) —
  // only the floating note button is visible. Starts on the envelope
  // click above (a real user gesture, which browsers require before
  // allowing audio with sound), and loops continuously from there.
  const YT_VIDEO_ID = 'ZkUQcn1DU5I';
  const musicToggle = document.getElementById('musicToggle');
  let ytPlayer = null;
  let ytReady = false;
  let musicRequested = false;
  let musicMuted = false;

  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new window.YT.Player('yt-player', {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        loop: 1,
        playlist: YT_VIDEO_ID, // required for loop:1 to work on a single video
        playsinline: 1,
        modestbranding: 1,
        fs: 0,
      },
      events: {
        onReady: () => {
          ytReady = true;
          if (musicRequested) ytPlayer.playVideo();
        },
      },
    });
  };

  // Injected here (after window.onYouTubeIframeAPIReady is defined
  // above) rather than as a static <script> tag in the HTML — the
  // YouTube API only calls that callback if it's already defined by
  // the time the API script finishes loading, and a static tag loading
  // before app.js runs would miss it.
  const ytScript = document.createElement('script');
  ytScript.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(ytScript);

  function startBackgroundMusic() {
    if (musicRequested) return;
    musicRequested = true;
    if (musicToggle) musicToggle.hidden = false;
    if (ytReady && ytPlayer) ytPlayer.playVideo();
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (!ytPlayer) return;
      musicMuted = !musicMuted;
      if (musicMuted) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
      }
      musicToggle.classList.toggle('muted', musicMuted);
      musicToggle.setAttribute('aria-label', musicMuted ? 'Activar música' : 'Silenciar música');
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
  // Desactivado: "Confirmar aquí" ahora es un enlace directo a un
  // formulario externo (ver el TODO junto a ese enlace en index.html), y
  // el <div id="rsvpOverlay"> que este bloque controlaba está comentado
  // en el HTML. Se deja el código aquí, comentado, por si se quiere
  // volver a usar el formulario propio.
  /*
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
  */
})();
