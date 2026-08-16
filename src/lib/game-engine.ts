// ---------------------------------------------------------------------------
// Bubble Up — core game engine (pure functions, no React).
// V1 scope: play & cash out. Keep this file dependency-free & testable.
// ---------------------------------------------------------------------------

export type BubbleKind = "normal" | "golden" | "rainbow";

export type RunStatus = "inflating" | "cashed" | "popped";

/** Base value generated per second of inflation (coins/s). */
export const BASE_COINS_PER_SECOND = 4;

/** Seconds of inflation at which risk hits 100% (with a normal bubble). */
export const MAX_RISK_SECONDS = 88;

/** Exponent of the risk curve (>1 → slow start, then accelerates). */
export const RISK_EXPONENT = 2.0;

/** Golden bubbles start with this risk floor. */
export const GOLDEN_BASE_RISK = 50;

/** Chance (0..1) that a new bubble is special. */
export const SPECIAL_BUBBLE_CHANCE = 0.12;

/** Value multiplier of the golden bubble. */
export const GOLDEN_MULTIPLIER = 3;

/** Risk thresholds for the combo system (0..1). */
export const COMBO_HIGH_RISK = 0.7;
export const COMBO_LOW_RISK = 0.3;

/** Each high-risk cash-out adds this to the combo multiplier. */
export const COMBO_STEP = 0.5;

/** Explosion check cadence (ms). */
export const EXPLOSION_TICK_MS = 300;

/** UI refresh cadence (ms). */
export const UI_TICK_MS = 100;

/** Space between the "burst" and the next bubble (ms). */
export const RESET_DELAY_MS = 900;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Accelered risk curve → 0..100 in % (slow start, faster over time). */
export function riskForElapsed(elapsedSeconds: number, baseRisk = 0): number {
  const f = clamp(elapsedSeconds / MAX_RISK_SECONDS, 0, 1);
  const curve = Math.pow(f, RISK_EXPONENT) * 100;
  return clamp(baseRisk + ((100 - baseRisk) / 100) * curve, 0, 100);
}

/** Current bubble cash value in coins (floored). */
export function valueForElapsed(elapsedSeconds: number, kind: BubbleKind): number {
  const base = elapsedSeconds * BASE_COINS_PER_SECOND;
  return Math.floor(base * multiplierFor(kind));
}

/** Multiplier applied to the displayed/earned value. */
export function multiplierFor(kind: BubbleKind): number {
  return kind === "golden" ? GOLDEN_MULTIPLIER : 1;
}

/** Bubble diameter in px (feels smooth, max ~230px on small screens). */
export function sizeForElapsed(elapsedSeconds: number): number {
  const f = clamp(elapsedSeconds / MAX_RISK_SECONDS, 0, 1);
  return 84 + 150 * Math.pow(f, 0.75);
}

/** Base risk (%) that a bubble starts with. */
export function baseRiskFor(kind: BubbleKind): number {
  return kind === "golden" ? GOLDEN_BASE_RISK : 0;
}

/**
 * Probability that the bubble explodes on a single explosion check tick,
 * weighted by current risk (%): at 50% ≈ 1/10 per tick, >90% ≈ every second.
 */
export function explosionChance(riskPercent: number): number {
  const r = clamp(riskPercent, 0, 100) / 100;
  return 0.32 * Math.pow(r, 1.7);
}

/** Rolls a random bubble at the start of each run. */
export function rollBubbleKind(random = Math.random): BubbleKind {
  if (random() < SPECIAL_BUBBLE_CHANCE) {
    return random() < 0.5 ? "golden" : "rainbow";
  }
  return "normal";
}

/** Rainbow bubbles reward 1–3 gems. */
export function rollRainbowGems(random = Math.random): number {
  return 1 + Math.floor(random() * 3);
}

/** Combo multiplier for a number of stacked combo steps (starts at x1). */
export function comboMultiplierFor(stacks: number): number {
  return 1 + COMBO_STEP * stacks;
}

/** Formats a coin amount for display (compact, kid friendly). */
export function formatCoins(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.floor(value).toLocaleString("fr-FR");
}

/** Formats the in-run value (keeps decimals while it's small). */
export function formatLiveValue(value: number): string {
  if (value >= 100) return Math.floor(value).toLocaleString("fr-FR");
  return value.toFixed(1);
}