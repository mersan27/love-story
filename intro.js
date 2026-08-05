/**
 * Animated intro
 * ─────────────────────────────────────
 * Plays a short "unwrapping" sequence after the gate unlocks and
 * before the landing page reveals itself. Purely cinematic — no
 * input required, with an optional skip for repeat visitors.
 *
 * This file doesn't know the gate exists. It just listens for
 * "gate:unlocked" and, when it's done, emits "intro:complete" —
 * whoever wants to react to that (currently: landing.js) can.
 */

import { bus } from '../core/events.js';
import { SITE_CONFIG } from '../core/config.js';
import { $, wait, prefersReducedMotion } from '../core/utils.js';

const SEQUENCE_MS = 3200;
const LEAVE_MS = 500;

let finished = false;

function applyIntroConfig() {
  const text = $('#intro-text');
  if (text && SITE_CONFIG.intro?.message) {
    text.textContent = SITE_CONFIG.intro.message;
  }
}

function finish(section, onComplete) {
  if (finished) return;
  finished = true;

  section.classList.remove('intro--active');
  section.classList.add('intro--leaving');

  wait(LEAVE_MS).then(() => {
    section.classList.remove('intro--leaving');
    section.hidden = true;
    section.setAttribute('aria-hidden', 'true');
    onComplete();
  });
}

async function playSequence(onComplete) {
  const section = $('#intro');
  const skipBtn = $('#intro-skip');
  if (!section) {
    onComplete();
    return;
  }

  finished = false;
  section.hidden = false;
  section.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => section.classList.add('intro--active'));

  skipBtn?.addEventListener('click', () => finish(section, onComplete), { once: true });

  if (prefersReducedMotion()) {
    await wait(400);
    finish(section, onComplete);
    return;
  }

  await wait(SEQUENCE_MS);
  finish(section, onComplete);
}

export function initIntro() {
  applyIntroConfig();

  bus.on('gate:unlocked', (detail) => {
    /* Returning visitor this session — the gate already skipped its
       own animation, so skip this cinematic too and go straight in. */
    if (detail?.instant) {
      bus.emit('intro:complete', { instant: true });
      return;
    }

    playSequence(() => bus.emit('intro:complete'));
  });
}
