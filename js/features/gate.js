/**
 * Password gate feature
 * ─────────────────────────────────────
 * Validates the password, plays the heart-lock unlock animation, then
 * hands off to the rest of the experience by emitting "gate:unlocked"
 * on the event bus. This file does not know that "intro" or "landing"
 * exist — it only knows how to open its own lock.
 */

import { bus } from '../core/events.js';
import { SITE_CONFIG } from '../core/config.js';
import { $ } from '../core/utils.js';

const STORAGE_KEY = 'lovegift_unlocked';

function applyGateConfig() {
  const { gate } = SITE_CONFIG;

  document.querySelectorAll('[data-gate-config]').forEach((el) => {
    const key = el.dataset.gateConfig;
    if (gate[key] !== undefined) el.textContent = gate[key];
  });

  const input = $('#gate-password');
  if (input && gate.placeholder) input.placeholder = gate.placeholder;
}

/** Shake the card and flash the input on wrong password */
function showError(card, input, errorEl) {
  card.classList.remove('gate__card--shake');
  input.classList.remove('gate__input--error');

  void card.offsetWidth; // force reflow so the animation can replay

  card.classList.add('gate__card--shake');
  input.classList.add('gate__input--error');
  errorEl.classList.add('gate__error--visible');
  errorEl.textContent = SITE_CONFIG.gate.errorMessage;

  input.focus();
  input.select();
}

/** Play the unlock animation, then announce it to the rest of the app */
function playUnlockAnimation({ heartLock, gate }) {
  const submitBtn = $('#gate-submit');
  if (submitBtn) submitBtn.disabled = true;

  heartLock.classList.add('heart-lock--unlocking');

  setTimeout(() => {
    heartLock.classList.remove('heart-lock--unlocking');
    heartLock.classList.add('heart-lock--unlocked');
  }, 500);

  setTimeout(() => {
    gate.classList.add('gate--hidden');

    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {
      /* sessionStorage unavailable — unlock still works for this visit */
    }

    setTimeout(() => {
      gate.setAttribute('aria-hidden', 'true');
      gate.hidden = true;
    }, 900);

    bus.emit('gate:unlocked');
  }, 900);
}

function wasPreviouslyUnlocked() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

export function initGate() {
  const gate = $('#gate');
  const form = $('#gate-form');
  const input = $('#gate-password');
  const card = $('#gate-card');
  const heartLock = $('#heart-lock');
  const errorEl = $('#gate-error');

  if (!gate || !form || !input) return;

  applyGateConfig();

  /* Returning visitor this session — skip the gate and the intro cinematic */
  if (wasPreviouslyUnlocked()) {
    gate.classList.add('gate--hidden');
    gate.setAttribute('aria-hidden', 'true');
    gate.hidden = true;
    bus.emit('gate:unlocked', { instant: true });
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const value = input.value.trim();
    const { password } = SITE_CONFIG.gate;

    if (value === password) {
      errorEl.classList.remove('gate__error--visible');
      playUnlockAnimation({ heartLock, gate });
    } else {
      showError(card, input, errorEl);
    }
  });

  input.addEventListener('input', () => {
    input.classList.remove('gate__input--error');
    errorEl.classList.remove('gate__error--visible');
  });
}
