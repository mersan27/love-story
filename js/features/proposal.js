/**
 * Proposal scene
 * ─────────────────────────────────────
 * A playful "will you..." moment, shown right after the gate unlocks.
 * The "No" button evades the pointer; "Yes" triggers a short beat and
 * a heart-burst reveal. This file doesn't know the gate or the intro
 * exist by name — it listens for "gate:unlocked" and, once the
 * visitor continues, emits "proposal:yes" for whoever's next.
 */

import { bus } from '../core/events.js';
import { SITE_CONFIG } from '../core/config.js';
import { $, rand, randInt, clamp, wait, prefersReducedMotion } from '../core/utils.js';

const SPARK_COUNT = 14;
const LOADER_MS = 900;
const MAX_FORCED_DODGES = 6;
const LEAVE_MS = 500;

let dodgeCount = 0;

function applyProposalConfig() {
  const { proposal } = SITE_CONFIG;
  if (!proposal) return;

  document.querySelectorAll('[data-proposal-config]').forEach((el) => {
    const key = el.dataset.proposalConfig;
    if (proposal[key] !== undefined) el.textContent = proposal[key];
  });
}

/* ── The evasive "No" button ────────────────────────── */

function dodge(noBtn, stage) {
  const stageRect = stage.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  if (!noBtn.classList.contains('is-dodging')) {
    /* Freeze its current spot in px before switching to absolute,
       so the very first dodge doesn't visually jump. */
    noBtn.style.left = `${btnRect.left - stageRect.left}px`;
    noBtn.style.top = `${btnRect.top - stageRect.top}px`;
    noBtn.classList.add('is-dodging');
    void noBtn.offsetWidth; // commit that position before the transition applies
  }

  const maxLeft = Math.max(stageRect.width - btnRect.width, 0);
  const maxTop = Math.max(stageRect.height - btnRect.height, 0);

  noBtn.style.left = `${clamp(rand(0, maxLeft), 0, maxLeft)}px`;
  noBtn.style.top = `${clamp(rand(0, maxTop), 0, maxTop)}px`;
}

function growYes(yesBtn) {
  const scale = Math.min(1.3, 1 + dodgeCount * 0.04);
  yesBtn.style.transform = `scale(${scale})`;
}

function wiggle(noBtn) {
  noBtn.classList.remove('proposal__no-btn--wiggle');
  void noBtn.offsetWidth;
  noBtn.classList.add('proposal__no-btn--wiggle');
}

function initDodgingNo() {
  const stage = $('#proposal-stage');
  const noBtn = $('#proposal-no');
  const yesBtn = $('#proposal-yes');
  if (!stage || !noBtn || !yesBtn) return;

  if (prefersReducedMotion()) return; // let it sit still — no chase for reduced-motion users

  const evade = (e) => {
    dodgeCount += 1;

    /* After enough teasing, a click just wiggles instead of doing
       nothing — so a keyboard/assistive-tech user isn't stuck with
       an un-activatable button. They can still Tab to "Yes". */
    if (e.type === 'click' && dodgeCount > MAX_FORCED_DODGES) {
      wiggle(noBtn);
      return;
    }

    e.preventDefault();
    dodge(noBtn, stage);
    growYes(yesBtn);
  };

  noBtn.addEventListener('pointerenter', evade);
  noBtn.addEventListener('click', evade);
}

/* ── The "Yes" reveal ────────────────────────────────── */

function spawnBurst(container) {
  container.innerHTML = '';
  const hearts = ['♥', '♡'];

  for (let i = 0; i < SPARK_COUNT; i += 1) {
    const span = document.createElement('span');
    span.className = 'proposal__spark';
    span.textContent = hearts[randInt(0, hearts.length - 1)];

    const angle = rand(0, Math.PI * 2);
    const distance = rand(60, 140);
    span.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    span.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    span.style.setProperty('--spark-delay', `${rand(0, 0.3)}s`);

    container.appendChild(span);
  }
}

async function revealYes() {
  const questionEl = $('#proposal-question');
  const revealEl = $('#proposal-reveal');
  const loaderEl = $('#proposal-loader');
  const contentEl = $('#proposal-reveal-content');
  const burstEl = $('#proposal-burst');
  const continueBtn = $('#proposal-continue');

  questionEl?.setAttribute('hidden', '');
  revealEl.hidden = false;
  loaderEl.hidden = false;
  contentEl.hidden = true;

  await wait(prefersReducedMotion() ? 150 : LOADER_MS);

  loaderEl.hidden = true;
  contentEl.hidden = false;
  if (burstEl && !prefersReducedMotion()) spawnBurst(burstEl);

  await wait(prefersReducedMotion() ? 0 : 900);
  continueBtn.hidden = false;
  continueBtn.classList.add('proposal__continue-btn--visible');
}

function initYesButton() {
  const yesBtn = $('#proposal-yes');
  if (!yesBtn) return;

  yesBtn.addEventListener('click', () => {
    yesBtn.disabled = true;
    revealYes();
  }, { once: true });
}

/* ── Continue → hand off to whatever's next ─────────── */

function initContinue() {
  const continueBtn = $('#proposal-continue');
  const section = $('#proposal');
  if (!continueBtn || !section) return;

  continueBtn.addEventListener('click', () => {
    section.classList.remove('proposal--active');
    section.classList.add('proposal--leaving');

    wait(LEAVE_MS).then(() => {
      section.classList.remove('proposal--leaving');
      section.hidden = true;
      section.setAttribute('aria-hidden', 'true');
      bus.emit('proposal:yes');
    });
  }, { once: true });
}

/* ── Boot ────────────────────────────────────────────── */

function enter() {
  const section = $('#proposal');
  if (!section) return;

  section.hidden = false;
  section.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => section.classList.add('proposal--active'));
}

export function initProposal() {
  applyProposalConfig();
  initDodgingNo();
  initYesButton();
  initContinue();

  bus.on('gate:unlocked', (detail) => {
    /* Returning visitor this session — skip straight past this too. */
    if (detail?.instant) {
      bus.emit('proposal:yes', { instant: true });
      return;
    }
    enter();
  });
}
