// ---------------------------------------------------------------------------
// Bubble Up — daily challenges, streak & achievements (V3).
// Static data + pure helpers. No React.
// ---------------------------------------------------------------------------

// --- daily challenges -------------------------------------------------------

export type DailyGoalType =
  | "cash_total"
  | "giant_bubble"
  | "combo"
  | "special"
  | "cashouts";

export interface DailyGoal {
  id: string;
  type: DailyGoalType;
  target: number;
  reward: number;
}

export interface DailyState {
  /** Local date key YYYY-MM-DD. */
  date: string;
  goals: DailyGoal[];
  cashToday: number;
  bestBubbleToday: number;
  specialToday: number;
  comboToday: number; // max combo multiplier reached
  cashoutsToday: number;
  claimed: string[]; // goal ids claimed
  bonusClaimed: boolean;
  /** Admin-quest ids claimed today. */
  claimedAdmin: string[];
  streak: number;
  streakClaimed: boolean;
}

export const DAILY_BONUS_GEMS = 6;

const GOAL_POOL: Array<{ type: DailyGoalType; targets: number[]; reward: number }> = [
  { type: "cash_total", targets: [100, 150, 250, 400], reward: 3 },
  { type: "giant_bubble", targets: [60, 100, 150, 250], reward: 3 },
  { type: "combo", targets: [2, 2.5, 3, 3.5], reward: 4 },
  { type: "special", targets: [2, 3, 4], reward: 4 },
  { type: "cashouts", targets: [5, 8, 12], reward: 2 },
];

/** Local date key (YYYY-MM-DD). */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Date key for `offset` days before/after today. */
export function dateKeyOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayKey(d);
}

/** Deterministic PRNG from a string seed (same goals all day long). */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generates the 3 daily goals for a given date (stable within the day). */
export function generateDailyGoals(date: string): DailyGoal[] {
  const rand = seededRandom(`bubbleup-${date}`);
  const pool = [...GOAL_POOL];
  const picks: Array<{ type: DailyGoalType; targets: number[]; reward: number }> = [];
  while (picks.length < 3 && pool.length > 0) {
    const idx = Math.floor(rand() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks.map((p, i) => ({
    id: `${date}-${p.type}`,
    type: p.type,
    target: p.targets[Math.floor(rand() * p.targets.length)],
    reward: p.reward,
  }));
}

/** Creates the state for a brand-new day; carries the streak over if eligible. */
export function newDailyState(
  date: string,
  prev: DailyState | undefined,
): DailyState {
  const yesterday = dateKeyOffset(-1);
  const streakEligible = prev !== undefined && prev.date === yesterday;
  return {
    date,
    goals: generateDailyGoals(date),
    cashToday: 0,
    bestBubbleToday: 0,
    specialToday: 0,
    comboToday: 0,
    cashoutsToday: 0,
    claimed: [],
    bonusClaimed: false,
    claimedAdmin: [],
    streak: streakEligible ? prev.streak + 1 : 1,
    streakClaimed: false,
  };
}

/** Progress of a goal within the current day. */
export function progressOf(
  d: DailyState,
  g: DailyGoal,
): { current: number; complete: boolean } {
  let current = 0;
  switch (g.type) {
    case "cash_total":
      current = d.cashToday;
      break;
    case "giant_bubble":
      current = d.bestBubbleToday;
      break;
    case "combo":
      current = d.comboToday;
      break;
    case "special":
      current = d.specialToday;
      break;
    case "cashouts":
      current = d.cashoutsToday;
      break;
  }
  return { current, complete: current >= g.target };
}

export function goalLabel(g: DailyGoal): string {
  switch (g.type) {
    case "cash_total":
      return `Encaisser ${Math.floor(g.target)} pièces aujourd'hui`;
    case "giant_bubble":
      return `Encaisser une bulle de ${Math.floor(g.target)} pièces ou plus`;
    case "combo":
      return `Atteindre un combo de ×${g.target.toFixed(1)}`;
    case "special":
      return `Encaisser ${g.target} bulles spéciales`;
    case "cashouts":
      return `Encaisser ${g.target} bulles`;
  }
}

export function goalEmoji(g: DailyGoal): string {
  switch (g.type) {
    case "cash_total":
      return "🪙";
    case "giant_bubble":
      return "🫧";
    case "combo":
      return "⚡";
    case "special":
      return "✨";
    case "cashouts":
      return "🎯";
  }
}

/** Gems granted for the daily connection streak (grows with the streak). */
export function streakReward(streak: number): number {
  return Math.min(12, 2 + streak);
}

// --- achievements (17 paliers) ----------------------------------------------

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  reward: number;
  value: (s: { cashouts: number; runs: number; bestBubble: number; lifetimeCoins: number }) => number;
  target: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "premiere", name: "Première bulle encaissée", desc: "Encaisse ta toute première bulle", reward: 1, value: (s) => s.cashouts, target: 1 },
  { id: "bulle_50", name: "Bulle à 50 pièces", desc: "Encaisse une bulle valant 50 pièces", reward: 1, value: (s) => s.bestBubble, target: 50 },
  { id: "bulle_100", name: "Bulle à 100 pièces", desc: "Encaisse une bulle valant 100 pièces", reward: 2, value: (s) => s.bestBubble, target: 100 },
  { id: "bulle_500", name: "Bulle à 500 pièces", desc: "Encaisse une bulle valant 500 pièces", reward: 3, value: (s) => s.bestBubble, target: 500 },
  { id: "bulle_1000", name: "Bulle à 1000 pièces", desc: "Encaisse une bulle valant 1000 pièces", reward: 5, value: (s) => s.bestBubble, target: 1000 },
  { id: "bulle_5000", name: "Bulle à 5000 pièces", desc: "Encaisse une bulle valant 5000 pièces", reward: 8, value: (s) => s.bestBubble, target: 5000 },
  { id: "eviteur_10", name: "Explosions évitées ×10", desc: "Encaisse 10 bulles avant qu'elles n'explosent", reward: 2, value: (s) => s.cashouts, target: 10 },
  { id: "eviteur_50", name: "Explosions évitées ×50", desc: "Encaisse 50 bulles avant qu'elles n'explosent", reward: 5, value: (s) => s.cashouts, target: 50 },
  { id: "eviteur_200", name: "Explosions évitées ×200", desc: "Encaisse 200 bulles avant qu'elles n'explosent", reward: 12, value: (s) => s.cashouts, target: 200 },
  { id: "habitue_25", name: "Habitué des bulles", desc: "Joue 25 parties", reward: 3, value: (s) => s.runs, target: 25 },
  { id: "accro_100", name: "Accro aux bulles", desc: "Joue 100 parties", reward: 8, value: (s) => s.runs, target: 100 },
  { id: "veteran_500", name: "Vétéran des bulles", desc: "Joue 500 parties", reward: 15, value: (s) => s.runs, target: 500 },
  { id: "fortune_1k", name: "Petite fortune", desc: "Gagne 1 000 pièces à vie", reward: 5, value: (s) => s.lifetimeCoins, target: 1000 },
  { id: "magnat_100k", name: "Magnat des bulles", desc: "Gagne 100 000 pièces à vie", reward: 12, value: (s) => s.lifetimeCoins, target: 100_000 },
  { id: "millionnaire_1M", name: "Millionnaire", desc: "Gagne 1 000 000 de pièces à vie", reward: 25, value: (s) => s.lifetimeCoins, target: 1_000_000 },
  { id: "titanesque_25k", name: "Bulle titanesque", desc: "Encaisse une bulle de 25 000 pièces", reward: 15, value: (s) => s.bestBubble, target: 25_000 },
  { id: "pro_200", name: "Encaisseur pro", desc: "Encaisser 200 bulles au total", reward: 10, value: (s) => s.cashouts, target: 200 },
];