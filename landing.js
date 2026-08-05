/**
 * Landing page interactions
 * Handles config injection, ambient particles, and CTA behavior.
 */

(function () {
  "use strict";

  /* ── Apply config values to [data-config] elements ── */

  function applyConfig() {
    document.querySelectorAll("[data-config]").forEach((el) => {
      const key = el.dataset.config;
      if (SITE_CONFIG[key] !== undefined) {
        el.textContent = SITE_CONFIG[key];
      }
    });
  }

  /* ── Subtle floating particles (canvas) ───────────── */

  function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationId = null;

    /** Resize canvas to match viewport */
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    /** Create a single particle with random properties */
    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        speedY: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
      };
    }

    /** Initialize particle pool (density scales with screen size) */
    function init() {
      const count = Math.min(60, Math.floor(window.innerWidth / 25));
      particles = Array.from({ length: count }, createParticle);
    }

    /** Draw and update all particles each frame */
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
          p.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(draw);
    }

    /* Respect reduced-motion preference */
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    resize();
    init();
    draw();

    window.addEventListener("resize", () => {
      resize();
      init();
    });

    /* Cleanup on page unload */
    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(animationId);
    });
  }

  /* ── CTA button: prepare for next section ─────────── */

  function initCTA() {
    const btn = document.getElementById("open-gift-btn");
    const landing = document.getElementById("landing");

    if (!btn || !landing) return;

    btn.addEventListener("click", () => {
      /* Visual feedback while next section is built */
      landing.classList.add("landing--opening");
      btn.classList.add("is-loading");
      btn.querySelector("span").textContent = "Opening…";

      /*
       * Placeholder: future sections will load here.
       * For now, reset after a brief moment so the demo feels alive.
       */
      setTimeout(() => {
        landing.classList.remove("landing--opening");
        btn.classList.remove("is-loading");
        btn.querySelector("span").textContent = SITE_CONFIG.ctaLabel;
      }, 1800);
    });
  }

  /* ── Boot ─────────────────────────────────────────── */

  function init() {
    applyConfig();
    initParticles();
    initCTA();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
