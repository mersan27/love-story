/**
 * Shared helpers
 * ─────────────────────────────────────
 * Small, dependency-free utilities every feature is allowed to use.
 * Nothing here should know about any specific feature.
 */

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const rand = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Promise-based delay, e.g. `await wait(500)`. */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
