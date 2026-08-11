/**
 * Love letters
 * ─────────────────────────────────────
 * A shelf of sealed envelopes, one per entry in data/letters.js.
 * Opening one plays a small "unseal" beat (same heart motif as the
 * gate, intro, and proposal scenes) and swaps into a reading view.
 *
 * Listens for "landing:opened" to reveal itself. This is currently
 * the last built stop in the journey — it doesn't emit anything
 * onward yet.
 */

import { bus } from '../core/events.js';
import { SITE_CONFIG } from '../core/config.js';
import { LETTERS } from '../../data/letters.js';
import { $, $$, wait, prefersReducedMotion } from '../core/utils.js';

const UNSEAL_MS = 450;

function applyLettersConfig() {
  const { letters } = SITE_CONFIG;
  if (!letters) return;

  document.querySelectorAll('[data-letters-config]').forEach((el) => {
    const key = el.dataset.lettersConfig;
    if (letters[key] !== undefined) el.textContent = letters[key];
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const HEART_ICON = `
  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 26s-8-5.2-8-12a4 4 0 0 1 8-1.5 4 4 0 0 1 8 1.5c0 6.8-8 12-8 12z" fill="currentColor"/>
  </svg>
`;

/* ── Shelf ───────────────────────────────────────────── */

function renderShelf() {
  const shelf = $('#letters-shelf');
  if (!shelf) return;

  shelf.innerHTML = LETTERS.map((letter, index) => `
    <button
      class="letters__envelope"
      type="button"
      role="listitem"
      data-letter-index="${index}"
      aria-label="Open: ${escapeHtml(letter.title)}"
    >
      <span class="letters__seal">${HEART_ICON}</span>
      <span class="letters__envelope-date">${escapeHtml(letter.date)}</span>
      <span class="letters__envelope-title">${escapeHtml(letter.title)}</span>
    </button>
  `).join('');
}

function initShelf() {
  const shelf = $('#letters-shelf');
  if (!shelf) return;

  shelf.addEventListener('click', (e) => {
    const btn = e.target.closest('.letters__envelope');
    if (!btn) return;

    const index = Number(btn.dataset.letterIndex);

    if (prefersReducedMotion()) {
      openLetter(index);
      return;
    }

    btn.classList.add('letters__envelope--opening');
    wait(UNSEAL_MS).then(() => openLetter(index));
  });
}

/* ── Reading view ────────────────────────────────────── */

function renderParagraphs(text) {
  return `<p class="letters__reader-body">${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
}

function renderLetterBody(letter) {
  const parts = [];

  if (letter.body) parts.push(renderParagraphs(letter.body));
  if (letter.intro) parts.push(renderParagraphs(letter.intro));

  if (letter.items) {
    const rows = letter.items.map((item) => `
      <div class="letters__list-item">
        <span class="letters__list-number">${item.number}.</span>
        <span>${escapeHtml(item.text)}</span>
      </div>
    `).join('');

    parts.push(`<div class="letters__list">${rows}</div>`);

    if (letter.itemsNote) {
      parts.push(`<p class="letters__list-gap-note">${escapeHtml(letter.itemsNote)}</p>`);
    }
  }

  if (letter.outro) parts.push(renderParagraphs(letter.outro));

  return parts.join('');
}

function openLetter(index) {
  const letter = LETTERS[index];
  const shelf = $('#letters-shelf');
  const reader = $('#letters-reader');
  const card = $('#letters-reader-card');
  if (!letter || !shelf || !reader || !card) return;

  card.innerHTML = `
    <p class="letters__reader-date">${escapeHtml(letter.date)}</p>
    <h2 class="letters__reader-title">${escapeHtml(letter.title)}</h2>
    ${letter.teaser ? `<p class="letters__reader-teaser">${escapeHtml(letter.teaser)}</p>` : ''}
    ${renderLetterBody(letter)}
  `;

  shelf.hidden = true;
  reader.hidden = false;
  reader.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function initBack() {
  const backBtn = $('#letters-back');
  const shelf = $('#letters-shelf');
  const reader = $('#letters-reader');
  if (!backBtn || !shelf || !reader) return;

  backBtn.addEventListener('click', () => {
    reader.hidden = true;
    shelf.hidden = false;
    $$('.letters__envelope--opening', shelf).forEach((el) => {
      el.classList.remove('letters__envelope--opening');
    });
  });
}

/* ── Boot ────────────────────────────────────────────── */

export function revealLetters() {
  const section = $('#letters');
  if (!section) return;
  section.hidden = false;
  section.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => section.classList.add('letters--visible'));
}

export function initLetters() {
  applyLettersConfig();
  renderShelf();
  initShelf();
  initBack();

  bus.on('landing:opened', () => revealLetters());
}
