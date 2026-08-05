/**
 * Site configuration
 * ─────────────────────────────────────
 * Customize all copy from this single file.
 * Additional sections will read from here as they're built.
 */

const SITE_CONFIG = {
  /**
   * Password gate — change `password` to whatever you like.
   * Case-sensitive. Example ideas: anniversary date, pet name, "forever".
   */
  gate: {
    password: "forever",
    title: "Unlock your gift",
    subtitle: "Enter the word that only we know",
    placeholder: "Password",
    hint: "Hint: think of our special word",
    errorMessage: "Not quite — try again",
  },

  /** Small badge at the top */
  occasion: "Made with love",

  /** Line above the main title */
  eyebrow: "A gift, just for you",

  /** Recipient's name — the hero headline */
  recipientName: "My Love",

  /** Supporting paragraph under the title */
  subtitle:
    "Something special awaits. Take a breath, tap below, and let the moment unfold.",

  /** Text inside the glass CTA card */
  ctaText: "An interactive journey through our story",

  /** Primary button label */
  ctaLabel: "Open your gift",

  /** Footer signature */
  senderName: "— Yours",
};
