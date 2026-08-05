/**
 * Tiny pub/sub event bus
 * ─────────────────────────────────────
 * Lets features talk to each other ("gate:unlocked", "music:started",
 * "letters:opened"…) without importing one another directly. This is
 * what keeps every feature file deletable on its own — nothing holds
 * a hard reference to anything else.
 */

class EventBus {
  #listeners = new Map();

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * @param {string} event
   * @param {(detail?: any) => void} callback
   */
  on(event, callback) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.#listeners.get(event)?.delete(callback);
  }

  emit(event, detail) {
    this.#listeners.get(event)?.forEach((callback) => callback(detail));
  }
}

export const bus = new EventBus();
