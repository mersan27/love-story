/**
 * Password gate logic
 * Validates password, triggers shake / unlock / reveal landing.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "lovegift_unlocked";

  /** Apply gate-specific config text */
  function applyGateConfig() {
    const { gate } = SITE_CONFIG;

    document.querySelectorAll("[data-gate-config]").forEach((el) => {
      const key = el.dataset.gateConfig;
      if (gate[key] !== undefined) {
        el.textContent = gate[key];
      }
    });

    const input = document.getElementById("gate-password");
    if (input && gate.placeholder) {
      input.placeholder = gate.placeholder;
    }
  }

  /** Shake the card and flash the input on wrong password */
  function showError(card, input, errorEl) {
    card.classList.remove("gate__card--shake");
    input.classList.remove("gate__input--error");

    /* Force reflow so animation replays on repeated failures */
    void card.offsetWidth;

    card.classList.add("gate__card--shake");
    input.classList.add("gate__input--error");
    errorEl.classList.add("gate__error--visible");
    errorEl.textContent = SITE_CONFIG.gate.errorMessage;

    input.focus();
    input.select();
  }

  /** Play unlock animation, then fade into landing */
  function unlock(heartLock, gate, landing) {
    const btn = document.getElementById("gate-submit");
    if (btn) btn.disabled = true;

    heartLock.classList.add("heart-lock--unlocking");

    /* Transition to fully unlocked state mid-animation */
    setTimeout(() => {
      heartLock.classList.remove("heart-lock--unlocking");
      heartLock.classList.add("heart-lock--unlocked");
    }, 500);

    /* Fade out gate and reveal landing */
    setTimeout(() => {
      gate.classList.add("gate--hidden");
      landing.classList.add("landing--visible");
      landing.setAttribute("aria-hidden", "false");

      /* Persist unlock for this browser session */
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch (_) {
        /* sessionStorage unavailable — ignore */
      }

      /* Remove gate from tab order after transition */
      setTimeout(() => {
        gate.setAttribute("aria-hidden", "true");
        gate.hidden = true;
      }, 900);
    }, 900);
  }

  /** Skip gate if already unlocked this session */
  function skipIfUnlocked(gate, landing) {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        gate.classList.add("gate--hidden");
        gate.setAttribute("aria-hidden", "true");
        gate.hidden = true;
        landing.classList.add("landing--visible");
        landing.setAttribute("aria-hidden", "false");
        return true;
      }
    } catch (_) {
      /* sessionStorage unavailable — show gate */
    }
    return false;
  }

  /** Wire up form submission and validation */
  function initGate() {
    const gate = document.getElementById("gate");
    const landing = document.getElementById("landing");
    const form = document.getElementById("gate-form");
    const input = document.getElementById("gate-password");
    const card = document.getElementById("gate-card");
    const heartLock = document.getElementById("heart-lock");
    const errorEl = document.getElementById("gate-error");

    if (!gate || !landing || !form || !input) return;

    applyGateConfig();

    if (skipIfUnlocked(gate, landing)) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = input.value.trim();
      const { password } = SITE_CONFIG.gate;

      if (value === password) {
        errorEl.classList.remove("gate__error--visible");
        unlock(heartLock, gate, landing);
      } else {
        showError(card, input, errorEl);
      }
    });

    /* Clear error styling as user types */
    input.addEventListener("input", () => {
      input.classList.remove("gate__input--error");
      errorEl.classList.remove("gate__error--visible");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGate);
  } else {
    initGate();
  }
})();
