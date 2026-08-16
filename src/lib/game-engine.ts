// ---------------------------------------------------------------------------
// Bubble Up — core game engine (pure functions, no React).
// V1: play & cash out. V2: permanent/temporary boosters, skins, idle passives.
// Keep this file dependency-free & testable.
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

/** Base combo stacks before upgrading "Mémoire de combo". */
export const BASE_COMBO_MAX_STACKS = 2;

/** Explosion check cadence (ms). */
export const EXPLOSION_TICK_MS = 300;

/** UI refresh cadence (ms). */
export const UI_TICK_MS = 100;

/** Space between the "burst" and the next bubble (ms). */
export const RESET_DELAY_MS = 900;

/** Maximum duration (minutes) over which idle passives produce coins offline. */
export const OFFLINE_CAP_MINUTES = 8 * 60;

// ---------------------------------------------------------------------------
// Upgrades (permanent boosters)
// ---------------------------------------------------------------------------

export interface Upgrades {
  inflate: number; // +10% inflation speed (value + visual size) / level
  value: number; // +10% value per second / level
  riskReduction: number; // -5% risk / level (max 60%)
  resistance: number; // +6s of max size before risk peaks / level
  clover: number; // +2% special bubble chance / level
  comboMemory: number; // +0.5 max combo multiplier / level
  gemVein: number; // +1% gem chance on cash-out / level (max 35%)
  airReserve: number; // +15% offline gains / level
}

export const EMPTY_UPGRADES: Upgrades = {
  inflate: 0,
  value: 0,
  riskReduction: 0,
  resistance: 0,
  clover: 0,
  comboMemory: 0,
  gemVein: 0,
  airReserve: 0,
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Coins per second with permanent upgrade multipliers. */
export function valuePerSecondUpgraded(up: Upgrades): number {
  return (
    BASE_COINS_PER_SECOND *
    (1 + 0.1 * up.inflate) *
    (1 + 0.1 * up.value)
  );
}

/** Seconds until the risk curve reaches 100% (extended by "résistance"). */
export function maxRiskSeconds(up: Upgrades): number {
  return MAX_RISK_SECONDS + up.resistance * 6;
}

/** Multiplier applied to risk (capped at -60%). */
export function riskReductionMultiplier(up: Upgrades): number {
  return Math.max(0.4, 1 - 0.05 * up.riskReduction);
}

/**
 * Accelerated risk curve → 0..100 in % (slow start, faster over time).
 * `baseRisk` = starting floor (golden bubbles). Upgrades reduce the result.
 */
export function riskForElapsed(
  elapsedSeconds: number,
  baseRisk = 0,
  up: Upgrades = EMPTY_UPGRADES,
): number {
  const f = clamp(elapsedSeconds / maxRiskSeconds(up), 0, 1);
  const curve = Math.pow(f, RISK_EXPONENT) * 100;
  const raw = baseRisk + ((100 - baseRisk) / 100) * curve;
  return clamp(raw * riskReductionMultiplier(up), 0, 100);
}

/** Current bubble cash value in coins (floored). */
export function valueForElapsed(
  elapsedSeconds: number,
  kind: BubbleKind,
  up: Upgrades = EMPTY_UPGRADES,
): number {
  const rate = valuePerSecondUpgraded(up);
  return Math.floor(elapsedSeconds * rate * multiplierFor(kind));
}

/** Multiplier applied to the displayed/earned value. */
export function multiplierFor(kind: BubbleKind): number {
  return kind === "golden" ? GOLDEN_MULTIPLIER : 1;
}

/** Bubble diameter in px (grows with inflation speed upgrades too). */
export function sizeForElapsed(
  elapsedSeconds: number,
  speedMult = 1,
): number {
  const f = clamp((elapsedSeconds * speedMult) / MAX_RISK_SECONDS, 0, 1);
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

/** Chance (0..1) of a special bubble, boosted by the clover. */
export function specialBubbleChance(up: Upgrades): number {
  return clamp(0.12 + 0.02 * up.clover, 0, 0.5);
}

/** Rolls a random bubble at the start of each run. */
export function rollBubbleKind(
  random = Math.random,
  specialChance = SPECIAL_BUBBLE_CHANCE,
): BubbleKind {
  if (random() < specialChance) {
    return random() < 0.5 ? "golden" : "rainbow";
  }
  return "normal";
}

/** Forced special bubble (porte-bonheur). */
export function rollLuckyBubbleKind(random = Math.random): BubbleKind {
  return random() < 0.5 ? "golden" : "rainbow";
}

/** Rainbow bubbles reward 1–3 gems. */
export function rollRainbowGems(random = Math.random): number {
  return 1 + Math.floor(random() * 3);
}

/** Bonus gem chance (%) on a regular cash-out (filon de gemmes). */
export function gemVeinChance(up: Upgrades): number {
  return Math.min(0.35, 0.01 * up.gemVein);
}

/** Max combo stacks — base 2 + "mémoire de combo" levels. */
export function comboMaxStacks(up: Upgrades): number {
  return BASE_COMBO_MAX_STACKS + up.comboMemory;
}

/** Combo multiplier for a number of stacked combo steps (starts at x1). */
export function comboMultiplierFor(stacks: number): number {
  return 1 + COMBO_STEP * stacks;
}

/** Offline coins produced by idle passives over `minutes` (capped, res. d'air). */
export function offlineGain(
  minutes: number,
  ratePerMinute: number,
  up: Upgrades = EMPTY_UPGRADES,
): { coins: number; appliedMinutes: number } {
  const applied = clamp(minutes, 0, OFFLINE_CAP_MINUTES);
  const coins = Math.floor(
    applied * ratePerMinute * (1 + 0.15 * up.airReserve),
  );
  return { coins, appliedMinutes: applied };
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