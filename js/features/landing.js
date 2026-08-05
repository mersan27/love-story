/**
 * Landing scene
 * ─────────────────────────────────────
 * Injects copy from config, renders the ambient particle field, and
 * hosts the primary call-to-action. It doesn't know who reveals it —
 * it just listens for "intro:complete" on the event bus and shows
 * itself when that fires.
 */

import { bus } from '../core/events.js';
import { SITE_CONFIG } from '../core/config.js';
import { $, $$, prefersReducedMotion, rand } from '../core/utils.js';

function applyConfig() {
  $$('[data-config]').forEach((el) => {
    const key = el.dataset.config;
    if (SITE_CONFIG[key] !== undefined) el.textContent = SITE_CONFIG[key];
  });
}

/* ── Subtle floating particles (canvas) ───────────── */

function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas || prefersReducedMotion()) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      radius: rand(0.5, 2),
      opacity: rand(0.1, 0.5),
      speedY: rand(0.1, 0.4),
      speedX: rand(-0.1, 0.1),
    };
  }

  function init() {
    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    particles = Array.from({ length: count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 179, 198, ${p.opacity})`;
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX;

      /* Recycle particles that drift off-screen */
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = rand(0, canvas.width);
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  window.addEventListener('resize', () => {
    resize();
    init();
  });

  window.addEventListener('beforeunload', () => cancelAnimationFrame(animationId));
}

/* ── CTA button ──────────────────────────────────── */

function initCTA() {
  const btn = $('#open-gift-btn');
  const landing = $('#landing');
  if (!btn || !landing) return;

  btn.addEventListener('click', () => {
    landing.classList.add('landing--opening');
    btn.classList.add('is-loading');
    btn.querySelector('span').textContent = 'Opening…';

    /*
     * Placeholder: the next scene (floating hearts / gallery / etc.)
     * will take over here once it's built. For now, reset after a
     * brief moment so the demo feels alive.
     */
    setTimeout(() => {
      landing.classList.remove('landing--opening');
      btn.classList.remove('is-loading');
      btn.querySelector('span').textContent = SITE_CONFIG.ctaLabel;
    }, 1800);
  });
}

export function revealLanding() {
  const landing = $('#landing');
  if (!landing) return;
  landing.classList.add('landing--visible');
  landing.setAttribute('aria-hidden', 'false');
}

export function initLanding() {
  applyConfig();
  initParticles();
  initCTA();

  bus.on('intro:complete', () => revealLanding());
}
