/**
 * Scene manager
 * ─────────────────────────────────────
 * This experience is a journey (gate → intro → landing → hearts →
 * gallery → timeline → letters → surprises → finale), not a normal
 * scrolling page. Something needs to own "which chapter is active
 * right now" — this module is that single source of truth.
 *
 * It does NOT own DOM or animation details itself. Each feature
 * registers optional onEnter/onExit hooks and keeps full control of
 * its own markup and motion; this just sequences them and keeps a
 * record of the active scene so any feature can ask "are we currently
 * on the gallery?" without reaching into another feature's internals.
 */

import { bus } from './events.js';

const scenes = new Map();
let activeScene = null;

/**
 * @param {string} name
 * @param {{ onEnter?: (detail?: any) => any, onExit?: (detail?: any) => any }} [hooks]
 */
export function registerScene(name, hooks = {}) {
  scenes.set(name, hooks);
}

export async function showScene(name, detail) {
  const next = scenes.get(name);
  if (!next) {
    console.warn(`[scene-manager] "${name}" is not registered.`);
    return;
  }

  const previousName = activeScene;
  const previous = previousName ? scenes.get(previousName) : null;

  if (previous?.onExit) await previous.onExit(detail);

  activeScene = name;
  if (next.onEnter) await next.onEnter(detail);

  bus.emit('scene:changed', { from: previousName, to: name, detail });
}

export function getActiveScene() {
  return activeScene;
}
