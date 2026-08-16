// ---------------------------------------------------------------------------
// Bubble Up — shop catalog & price helpers. Static data only (no React).
// ---------------------------------------------------------------------------

export type UpgradeId =
  | "inflate"
  | "value"
  | "riskReduction"
  | "resistance"
  | "clover"
  | "comboMemory"
  | "gemVein"
  | "airReserve";

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  emoji: string;
  desc: string;
  basePrice: number;
  growth: number;
  maxLevel: number; // Infinity = no cap
}

/** Permanent boosters, paid in coins, price grows per level. */
export const UPGRADES: UpgradeDef[] = [
  {
    id: "inflate",
    name: "Vitesse de gonflage",
    emoji: "🎈",
    desc: "+10 % de valeur et une bulle plus grosse à chaque niveau.",
    basePrice: 30,
    growth: 1.6,
    maxLevel: 40,
  },
  {
    id: "value",
    name: "Valeur par seconde",
    emoji: "💰",
    desc: "+10 % de pièces gagnées à chaque seconde de gonflage.",
    basePrice: 35,
    growth: 1.6,
    maxLevel: 40,
  },
  {
    id: "riskReduction",
    name: "Réduction du risque",
    emoji: "🛡️",
    desc: "-5 % de risque par niveau (max -60 %). Respire un peu !",
    basePrice: 50,
    growth: 1.5,
    maxLevel: 12,
  },
  {
    id: "resistance",
    name: "Résistance de la bulle",
    emoji: "🧱",
    desc: "+6 secondes avant que le risque atteigne son maximum, par niveau.",
    basePrice: 80,
    growth: 1.65,
    maxLevel: 20,
  },
  {
    id: "clover",
    name: "Trèfle à bulles",
    emoji: "🍀",
    desc: "+2 % de chances d'avoir une bulle spéciale par niveau.",
    basePrice: 60,
    growth: 1.7,
    maxLevel: 30,
  },
  {
    id: "comboMemory",
    name: "Mémoire de combo",
    emoji: "🧠",
    desc: "Combo max +0,5 par niveau : enchaîne les encaissements à haut risque !",
    basePrice: 150,
    growth: 1.8,
    maxLevel: 20,
  },
  {
    id: "gemVein",
    name: "Filon de gemmes",
    emoji: "💎",
    desc: "+1 % de chance de gagner un cristal à chaque encaissement (max 35 %).",
    basePrice: 120,
    growth: 1.75,
    maxLevel: 35,
  },
  {
    id: "airReserve",
    name: "Réserve d'air",
    emoji: "🌀",
    desc: "+15 % sur tes gains hors ligne par niveau.",
    basePrice: 200,
    growth: 1.8,
    maxLevel: 20,
  },
];

/** Price of buying the next level of an upgrade. */
export function upgradePrice(def: UpgradeDef, level: number): number {
  return Math.floor(def.basePrice * Math.pow(def.growth, level));
}

export const upgradeById = (id: UpgradeId) =>
  UPGRADES.find((u) => u.id === id)!;

// ---------------------------------------------------------------------------
// Temporary boosters (single-use per run, buyable stock)
// ---------------------------------------------------------------------------

export type TempBoosterId =
  | "shield5"
  | "freeze10"
  | "double"
  | "shield15"
  | "freeze25"
  | "triple"
  | "lucky";

export interface TempBoosterDef {
  id: TempBoosterId;
  name: string;
  emoji: string;
  price: number;
  desc: string;
  kind: "shield" | "freeze" | "cash" | "lucky";
  duration?: number; // seconds for timed effects
}

export const TEMP_BOOSTERS: TempBoosterDef[] = [
  {
    id: "shield5",
    name: "Bouclier 5 s",
    emoji: "🛡️",
    price: 40,
    desc: "Protège ta bulle de l'explosion pendant 5 secondes.",
    kind: "shield",
    duration: 5,
  },
  {
    id: "freeze10",
    name: "Gel du risque 10 s",
    emoji: "🧊",
    price: 70,
    desc: "Le risque reste figé 10 secondes, la valeur continue de monter.",
    kind: "freeze",
    duration: 10,
  },
  {
    id: "double",
    name: "Double gains",
    emoji: "🪙",
    price: 100,
    desc: "Ta prochaine encaisse vaut 2× plus. Une seule bulle !",
    kind: "cash",
    duration: 2,
  },
  {
    id: "shield15",
    name: "Bouclier renforcé 15 s",
    emoji: "🛡️✨",
    price: 140,
    desc: "Un bouclier solide qui encaisse 15 secondes.",
    kind: "shield",
    duration: 15,
  },
  {
    id: "freeze25",
    name: "Gel profond 25 s",
    emoji: "❄️",
    price: 200,
    desc: "Risque gelé pendant 25 secondes : la bulle devient un coffre-fort !",
    kind: "freeze",
    duration: 25,
  },
  {
    id: "triple",
    name: "Triple gains",
    emoji: "🚀",
    price: 260,
    desc: "Ta prochaine encaisse vaut ×3. Pousse la bulle bien loin !",
    kind: "cash",
    duration: 3,
  },
  {
    id: "lucky",
    name: "Porte-bonheur",
    emoji: "🍀",
    price: 150,
    desc: "Ta prochaine bulle est garantie SPÉCIALE (or ou arc-en-ciel).",
    kind: "lucky",
  },
];

export const tempBoosterById = (id: TempBoosterId) =>
  TEMP_BOOSTERS.find((b) => b.id === id)!;

/** Max stock a player can hold of one temporary booster. */
export const TEMP_BOOSTER_MAX_STOCK = 5;

// ---------------------------------------------------------------------------
// Cosmetic bubble skins (paid in gems)
// ---------------------------------------------------------------------------

export interface SkinDef {
  id: string;
  name: string;
  gems: number;
  gradient: string;
  border: string;
}

export const SKINS: SkinDef[] = [
  {
    id: "classic",
    name: "Classique",
    gems: 0,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(186,230,253,0.92) 30%, rgba(129,140,248,0.55) 68%, rgba(167,139,250,0.5) 100%)",
    border: "border-sky-200/80",
  },
  {
    id: "gold",
    name: "Or",
    gems: 5,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(253,230,138,0.95) 32%, rgba(251,191,36,0.8) 68%, rgba(217,119,6,0.6) 100%)",
    border: "border-amber-200/90",
  },
  {
    id: "arcenciel",
    name: "Arc-en-ciel",
    gems: 8,
    gradient:
      "conic-gradient(from 200deg, #f471b5, #a78bfa, #60a5fa, #34d399, #fbbf24, #fb7185, #f471b5)",
    border: "border-fuchsia-200/80",
  },
  {
    id: "neon",
    name: "Néon",
    gems: 8,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95) 0%, rgba(34,211,238,0.9) 35%, rgba(217,70,239,0.85) 72%, rgba(232,121,249,0.7) 100%)",
    border: "border-cyan-300/80",
  },
  {
    id: "galaxie",
    name: "Galaxie",
    gems: 12,
    gradient:
      "radial-gradient(circle at 28% 24%, rgba(255,255,255,0.95) 0%, rgba(129,140,248,0.9) 30%, rgba(49,46,129,0.95) 70%, rgba(30,27,75,0.95) 100%)",
    border: "border-indigo-300/80",
  },
  {
    id: "ocean",
    name: "Océan",
    gems: 8,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.96) 0%, rgba(103,232,249,0.9) 32%, rgba(14,165,233,0.8) 68%, rgba(8,145,178,0.7) 100%)",
    border: "border-cyan-200/80",
  },
  {
    id: "candy",
    name: "Bonbon",
    gems: 8,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.97) 0%, rgba(249,168,212,0.92) 32%, rgba(244,114,182,0.8) 68%, rgba(219,39,119,0.6) 100%)",
    border: "border-pink-200/80",
  },
  {
    id: "lava",
    name: "Lave",
    gems: 12,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95) 0%, rgba(253,186,116,0.9) 32%, rgba(249,115,22,0.85) 68%, rgba(220,38,38,0.75) 100%)",
    border: "border-orange-300/80",
  },
  {
    id: "mint",
    name: "Menthe glacée",
    gems: 12,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(167,243,208,0.95) 34%, rgba(52,211,153,0.75) 70%, rgba(16,185,129,0.55) 100%)",
    border: "border-emerald-200/90",
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    gems: 15,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95) 0%, rgba(217,70,239,0.85) 30%, rgba(124,58,237,0.85) 62%, rgba(6,182,212,0.8) 100%)",
    border: "border-fuchsia-300/80",
  },
  {
    id: "obsidian",
    name: "Obsidienne",
    gems: 20,
    gradient:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.85) 0%, rgba(76,29,149,0.95) 35%, rgba(30,27,75,1) 75%, rgba(10,10,35,1) 100%)",
    border: "border-violet-300/80",
  },
];

export const skinById = (id: string): SkinDef =>
  SKINS.find((s) => s.id === id) ?? SKINS[0];

// ---------------------------------------------------------------------------
// Idle passives (produce coins even offline, 8h cap)
// ---------------------------------------------------------------------------

export interface PassiveDef {
  id: string;
  name: string;
  emoji: string;
  unlockRuns: number;
  price: number;
  ratePerMinute: number;
  desc: string;
}

export const PASSIVES: PassiveDef[] = [
  {
    id: "pump",
    name: "Petite pompe",
    emoji: "🪄",
    unlockRuns: 5,
    price: 150,
    ratePerMinute: 2,
    desc: "Souffle quelques pièces quand tu es absent.",
  },
  {
    id: "compressor",
    name: "Compresseur",
    emoji: "🌬️",
    unlockRuns: 15,
    price: 800,
    ratePerMinute: 6,
    desc: "Ramasse des pièces plus vite hors-ligne.",
  },
  {
    id: "factory",
    name: "Usine à bulles",
    emoji: "🏭",
    unlockRuns: 40,
    price: 4_000,
    ratePerMinute: 20,
    desc: "Une vraie petite usine qui tourne même sans toi.",
  },
  {
    id: "station",
    name: "Station de bulles",
    emoji: "🛰️",
    unlockRuns: 80,
    price: 20_000,
    ratePerMinute: 50,
    desc: "Production automatique sérieuse, même endormi.",
  },
  {
    id: "orbital",
    name: "Complexe orbital",
    emoji: "🪐",
    unlockRuns: 150,
    price: 90_000,
    ratePerMinute: 120,
    desc: "La grande orbite. Des pièces qui tombent du ciel.",
  },
];

export const passiveById = (id: string) =>
  PASSIVES.find((p) => p.id === id)!;

/** Total coins/minute from owned passives. */
export function passiveRate(passives: Record<string, boolean>): number {
  return PASSIVES.reduce(
    (sum, p) => sum + (passives[p.id] ? p.ratePerMinute : 0),
    0,
  );
}