/**
 * App entry point
 * ─────────────────────────────────────
 * The only file allowed to import every feature. It boots each one
 * and wires the handful of events that move the visitor from one
 * scene to the next. Individual features never import each other —
 * they only talk through js/core/events.js.
 *
 * Journey so far: gate → proposal → intro → landing → letters
 * (hearts, gallery, timeline, surprises, confetti, fireworks, and
 * the finale will each register their own scene here as they're built.)
 */

import { bus } from './core/events.js';
import { registerScene, showScene } from './core/scene-manager.js';
import { initGate } from './features/gate.js';
import { initProposal } from './features/proposal.js';
import { initIntro } from './features/intro.js';
import { initLanding } from './features/landing.js';
import { initLetters } from './features/letters.js';

function boot() {
  registerScene('gate');
  registerScene('proposal');
  registerScene('intro');
  registerScene('landing');
  registerScene('letters');

  initProposal();
  initIntro();
  initLanding();
  initLetters();
  initGate();

  showScene('gate');

  bus.on('gate:unlocked', (detail) => showScene('proposal', detail));
  bus.on('proposal:yes', (detail) => showScene('intro', detail));
  bus.on('intro:complete', (detail) => showScene('landing', detail));
  bus.on('landing:opened', (detail) => showScene('letters', detail));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
