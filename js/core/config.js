/**
 * Site configuration
 * ─────────────────────────────────────
 * Customize all copy from this single file. Every feature imports
 * SITE_CONFIG rather than hardcoding strings, so the gift's content
 * can change without touching any feature's logic.
 */

export const SITE_CONFIG = {
  /**
   * Password gate — change `password` to whatever you like.
   * Case-sensitive. Example ideas: anniversary date, pet name, "forever".
   */
  gate: {
    password: 'forever',
    title: 'Unlock your gift',
    subtitle: 'Enter the word that only we know',
    placeholder: 'Password',
    hint: 'Hint: think of our special word',
    errorMessage: 'Not quite — try again',
  },

  /** Playful proposal moment — right after the gate unlocks. */
  proposal: {
    eyebrow: 'One more thing',
    question: 'Will you be mine, always?',
    yesLabel: 'Yes, always',
    noLabel: 'No',
    revealTitle: 'I knew it.',
    revealMessage:
      "Every \u2018yes\u2019 with you feels like the easiest choice I'll ever make.",
  },

  /** Animated intro — plays once, right after the proposal moment. */
  intro: {
    message: 'Something has been waiting for you…',
  },

  /** Love letters — revealed after the landing CTA is opened. */
  letters: {
    eyebrow: 'Her <3',
    title: 'A little book, just for you',
    subtitle:
      'Hi baby, I created this book only for you. I know you love to read a lot haha. In this book you will see mostly the same things I told you because those are not lies. I will not lie to you with my love or anything baby <3.',
    backLabel: 'Back to letters',
  },

  /** Small badge at the top of the landing page */
  occasion: 'Made with love',

  /** Line above the main title */
  eyebrow: 'A gift, just for you',

  /** Recipient's name — the hero headline */
  recipientName: 'My Love',

  /** Supporting paragraph under the title */
  subtitle:
    'Something special awaits. Take a breath, tap below, and let the moment unfold.',

  /** Text inside the glass CTA card */
  ctaText: 'An interactive journey through our story',

  /** Primary button label */
  ctaLabel: 'Open your gift',

  /** Footer signature */
  senderName: '— Yours',
};
