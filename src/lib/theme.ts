// ---------------------------------------------------------------------------
// Bubble Up — theme helpers. All colors flow through CSS custom properties
// so the admin can restyle the app live (background, menus, bubble, CTA).
// ---------------------------------------------------------------------------

export const THEME_VARS = {
  bgA: "--bu-bg-a",
  bgB: "--bu-bg-b",
  bgC: "--bu-bg-c",
  nav1: "--bu-nav-1",
  nav2: "--bu-nav-2",
  cta1: "--bu-cta-1",
  cta2: "--bu-cta-2",
  cta3: "--bu-cta-3",
  bubbleA: "--bu-bubble-a",
  bubbleB: "--bu-bubble-b",
  bubbleC: "--bu-bubble-c",
} as const;

export type ThemeColors = Record<keyof typeof THEME_VARS, string>;

/** Fallback theme (matches the default “night purple” look). */
export const DEFAULT_THEME: ThemeColors = {
  bgA: "#4c1d95",
  bgB: "#2e1065",
  bgC: "#19063a",
  nav1: "#8b5cf6",
  nav2: "#d946ef",
  cta1: "#fbbf24",
  cta2: "#f97316",
  cta3: "#f43f5e",
  bubbleA: "rgba(186,230,253,0.92)",
  bubbleB: "rgba(129,140,248,0.55)",
  bubbleC: "rgba(167,139,250,0.5)",
};

/** Applies a theme to the document root (all pages). */
export function applyTheme(theme: ThemeColors) {
  const root = document.documentElement;
  (Object.keys(THEME_VARS) as Array<keyof typeof THEME_VARS>).forEach((key) => {
    root.style.setProperty(THEME_VARS[key], theme[key]);
  });
}

/** Page background (radial, purple night by default). */
export const pageBgStyle = {
  background:
    "radial-gradient(130% 90% at 50% -12%, var(--bu-bg-a) 0%, var(--bu-bg-b) 44%, var(--bu-bg-c) 100%)",
} as const;

/** Primary CTA gradient (ENCAISSER, claim buttons, landing CTAs). */
export const ctaGradient =
  "linear-gradient(90deg, var(--bu-cta-1), var(--bu-cta-2), var(--bu-cta-3))";

export const ctaStyle = { background: ctaGradient } as const;

/** Bottom-nav active pill gradient. */
export const navGradient =
  "linear-gradient(90deg, var(--bu-nav-1), var(--bu-nav-2))";

export const navStyle = { background: navGradient } as const;

/** “Classique” bubble gradient (admin-tunable). */
export const classicBubbleGradient = `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, var(--bu-bubble-a) 30%, var(--bu-bubble-b) 68%, var(--bu-bubble-c) 100%)`;