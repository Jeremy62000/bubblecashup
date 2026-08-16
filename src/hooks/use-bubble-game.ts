// ---------------------------------------------------------------------------
// Bubble Up — game loop hook. Owns the run state (bubble + risk + value),
// the combo system, cash-out / explosion flow, saves to localStorage and
// fires burst/flash effects for the UI. V2 adds the shop; V3 adds daily
// challenges, the streak and achievements.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import * as engine from "@/lib/game-engine";
import {
  ACHIEVEMENTS,
  DAILY_BONUS_GEMS,
  goalLabel,
  newDailyState,
  progressOf,
  streakReward,
  todayKey,
  type DailyState,
} from "@/lib/challenges";
import {
  passiveById,
  passiveRate,
  skinById,
  tempBoosterById,
  TEMP_BOOSTER_MAX_STOCK,
  type TempBoosterId,
  upgradeById,
  upgradePrice,
  type UpgradeId,
} from "@/lib/shop";
import { initAudio, setMuted, sfx } from "@/lib/audio";

const SAVE_KEY = "bubble-up-save-v1";

export interface SaveData {
  coins: number;
  gems: number;
  bestBubble: number;
  runs: number;
  cashouts: number;
  pops: number;
  muted: boolean;
  upgrades: engine.Upgrades;
  boosters: Record<TempBoosterId, number>;
  skins: string[];
  skin: string;
  passives: Record<string, boolean>;
  lastSeen: number;
  /** Coins earned over the whole life of the account. */
  lifetimeCoins: number;
  /** Daily challenges + connection streak (V3). */
  daily: DailyState;
  /** Unlocked achievement ids (V3). */
  achievements: string[];
  /** Display name used on the world leaderboard. */
  pseudo: string;
  /** Last values successfully synced to the Convex leaderboard. */
  synced: { biggest: number; total: number };
}

export interface BurstEvent {
  id: number;
  kind: "coins" | "gems" | "pop";
  big: boolean;
}

export interface ActiveEffectsView {
  shield: { until: number; duration: number } | null;
  freeze: { until: number; risk: number } | null;
  cashMult: number | null;
  lucky: boolean;
}

export interface OfflineClaim {
  coins: number;
  minutes: number;
}

const DEFAULT_SAVE: SaveData = {
  coins: 0,
  gems: 0,
  bestBubble: 0,
  runs: 0,
  cashouts: 0,
  pops: 0,
  muted: false,
  upgrades: { ...engine.EMPTY_UPGRADES },
  boosters: {
    shield5: 0,
    freeze10: 0,
    double: 0,
    shield15: 0,
    freeze25: 0,
    triple: 0,
    lucky: 0,
  },
  skins: ["classic"],
  skin: "classic",
  passives: {},
  lastSeen: Date.now(),
  lifetimeCoins: 0,
  daily: newDailyState(todayKey(), undefined),
  achievements: [],
  pseudo: `Bulleur${Math.floor(1000 + Math.random() * 9000)}`,
  synced: { biggest: 0, total: 0 },
};

function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_SAVE;
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...parsed,
      upgrades: { ...DEFAULT_SAVE.upgrades, ...(parsed.upgrades ?? {}) },
      boosters: { ...DEFAULT_SAVE.boosters, ...(parsed.boosters ?? {}) },
      passives: { ...(parsed.passives ?? {}) },
      skins: Array.isArray(parsed.skins) ? parsed.skins : ["classic"],
      daily:
        parsed.daily && parsed.daily.date === todayKey()
          ? parsed.daily
          : newDailyState(todayKey(), parsed.daily),
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      lifetimeCoins:
        typeof parsed.lifetimeCoins === "number" ? parsed.lifetimeCoins : 0,
      pseudo: typeof parsed.pseudo === "string" ? parsed.pseudo : `Bulleur${Math.floor(1000 + Math.random() * 9000)}`,
      synced: {
        biggest: parsed.synced?.biggest ?? 0,
        total: parsed.synced?.total ?? 0,
      },
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

// ---------------------------------------------------------------------------
// Module-level save store, shared by every page (game, shop, …) so the
// wallet/upgrades stay in sync across routes.
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();
let storeSave: SaveData = loadSave();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSave = () => storeSave;

function setStoreSave(next: SaveData) {
  storeSave = next;
  listeners.forEach((l) => l());
}

interface RunRef {
  kind: engine.BubbleKind;
  phaseStartedAt: number;
  baseElapsed: number;
  status: engine.RunStatus;
  comboStacks: number;
  save: SaveData;
  paused: boolean;
  /** Pending “porte-bonheur”: next bubble is guaranteed special. */
  _pendingLucky: boolean;
  /** Pending ×2 / ×3 cash multiplier until the next cash-out. */
  _cashMult: number | null;
}

function createRunRef(kind: engine.BubbleKind): RunRef {
  return {
    kind,
    phaseStartedAt: Date.now(),
    baseElapsed: 0,
    status: "inflating",
    comboStacks: 0,
    save: getSave(),
    paused: false,
    _pendingLucky: false,
    _cashMult: null,
  };
}

/** Empty effects view. */
const NO_EFFECTS: ActiveEffectsView = {
  shield: null,
  freeze: null,
  cashMult: null,
  lucky: false,
};

export function useBubbleGame() {
  const runRef = useRef<RunRef>(createRunRef(engine.rollBubbleKind()));
  const burstIdRef = useRef(0);
  const upsertScore = useMutation(api.leaderboard.upsertScore);
  const save = useSyncExternalStore(subscribe, getSave);
  // initial wallet ref used for first renders before effects
  runRef.current.save = save;
  const [offlineClaim, setOfflineClaim] = useState<OfflineClaim | null>(null);
  const [effects, setEffects] = useState<ActiveEffectsView>(NO_EFFECTS);
  const [snapshot, setSnapshot] = useState({
    kind: runRef.current.kind as engine.BubbleKind,
    elapsed: 0,
    risk: engine.baseRiskFor(runRef.current.kind),
    value: 0,
    size: engine.sizeForElapsed(0),
    status: "inflating" as engine.RunStatus,
    comboStacks: 0,
    burst: null as BurstEvent | null,
    flash: 0,
    lastGain: null as { coins: number; gems: number } | null,
  });

  /** Elapsed seconds of the current run using an absolute clock. */
  const effectiveElapsed = useCallback(() => {
    const r = runRef.current;
    return r.baseElapsed + (Date.now() - r.phaseStartedAt) / 1000;
  }, []);

  /** Merge a patch into the persisted wallet/stats. */
  const commit = useCallback((patch: Partial<SaveData>) => {
    runRef.current.save = { ...runRef.current.save, ...patch };
    setStoreSave(runRef.current.save);
  }, []);

  const nextBurst = useCallback(
    (kind: BurstEvent["kind"], big: boolean): BurstEvent => ({
      id: ++burstIdRef.current,
      kind,
      big,
    }),
    [],
  );

  // --- daily rollover (midnight → new goals, streak update) ---------------
  const ensureDaily = useCallback(() => {
    const r = runRef.current;
    if (r.save.daily.date === todayKey()) return;
    commit({ daily: newDailyState(todayKey(), r.save.daily) });
  }, [commit]);

  useEffect(() => {
    ensureDaily();
  }, [ensureDaily]);

  // --- achievements: unlock + award gems + notify -------------------------
  const awardAchievements = useCallback(() => {
    const r = runRef.current;
    const s = r.save;
    const fresh: string[] = [];
    let gems = 0;
    for (const a of ACHIEVEMENTS) {
      if (!s.achievements.includes(a.id) && a.value(s) >= a.target) {
        fresh.push(a.id);
        gems += a.reward;
      }
    }
    if (fresh.length === 0) return;
    commit({
      achievements: [...s.achievements, ...fresh],
      gems: s.gems + gems,
    });
    sfx.gem();
    fresh.forEach((id) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id)!;
      toast.success(`Succès débloqué : ${a.name}`, {
        description: `+${a.reward} 💎`,
      });
    });
  }, [commit]);

  // --- offline earnings (once per session) --------------------------------
  useEffect(() => {
    const r = runRef.current;
    const now = Date.now();
    const awayMinutes = (now - r.save.lastSeen) / 60_000;
    const rate = passiveRate(r.save.passives);
    if (rate > 0 && awayMinutes > 1) {
      const { coins, appliedMinutes } = engine.offlineGain(
        awayMinutes,
        rate,
        r.save.upgrades,
      );
      if (coins >= 1) {
        setOfflineClaim({ coins, minutes: Math.round(appliedMinutes) });
      }
    }
    commit({ lastSeen: now });
  }, [commit]);

  const claimOffline = useCallback(() => {
    if (!offlineClaim) return;
    commit({
      coins: runRef.current.save.coins + offlineClaim.coins,
      lastSeen: Date.now(),
    });
    sfx.jackpot();
    setOfflineClaim(null);
  }, [commit, offlineClaim]);

  // --- run lifecycle -------------------------------------------------------
  const resetRun = useCallback(() => {
    const r = runRef.current;
    const up = r.save.upgrades;
    r.kind = r._pendingLucky
      ? engine.rollLuckyBubbleKind()
      : engine.rollBubbleKind(Math.random, engine.specialBubbleChance(up));
    r._pendingLucky = false;
    r.phaseStartedAt = Date.now();
    r.baseElapsed = 0;
    r.status = "inflating";
    r.paused = false;
    commit({ runs: r.save.runs + 1 });
    awardAchievements();
    setEffects(NO_EFFECTS);
    setSnapshot((s) => ({
      ...s,
      kind: r.kind,
      elapsed: 0,
      risk: engine.baseRiskFor(r.kind),
      value: 0,
      size: engine.sizeForElapsed(0),
      status: "inflating",
      lastGain: null,
    }));
  }, [commit, awardAchievements]);

  const cashOut = useCallback(() => {
    const r = runRef.current;
    if (r.status !== "inflating") return;
    initAudio();

    const up = r.save.upgrades;
    const elapsed = effectiveElapsed();
    const value = engine.valueForElapsed(elapsed, r.kind, up);
    const baseRisk = engine.baseRiskFor(r.kind);
    const frozen = effectsRef.current.freeze;
    const risk =
      frozen && Date.now() < frozen.until
        ? frozen.risk
        : engine.riskForElapsed(elapsed, baseRisk, up);
    const comboMult = engine.comboMultiplierFor(r.comboStacks);
    const tempMult = r._cashMult ?? 1;
    const multiplier = comboMult * tempMult;

    let coins = 0;
    let gems = 0;
    if (r.kind === "rainbow") {
      gems = engine.rollRainbowGems();
    } else {
      coins = Math.floor(value * multiplier);
      // filon de gemmes : small chance of a bonus gem on any cash-out
      if (Math.random() < engine.gemVeinChance(up)) gems += 1;
    }

    // Combo: high-risk cash-outs stack (up to the "mémoire de combo" cap);
    // a very early cash-out resets it.
    const maxStacks = engine.comboMaxStacks(up);
    let nextStacks = r.comboStacks;
    if (risk >= engine.COMBO_HIGH_RISK * 100) {
      if (nextStacks < maxStacks) nextStacks += 1;
    } else if (risk <= engine.COMBO_LOW_RISK * 100) {
      nextStacks = 0;
    }

    ensureDaily();
    const daily = runRef.current.save.daily;
    const bestBubble = Math.max(r.save.bestBubble, value);
    commit({
      coins: r.save.coins + coins,
      gems: r.save.gems + gems,
      bestBubble,
      cashouts: r.save.cashouts + 1,
      lifetimeCoins: r.save.lifetimeCoins + coins,
      daily: {
        ...daily,
        cashToday: daily.cashToday + coins,
        bestBubbleToday: Math.max(daily.bestBubbleToday, value),
        specialToday: daily.specialToday + (r.kind !== "normal" ? 1 : 0),
        cashoutsToday: daily.cashoutsToday + 1,
        comboToday: Math.max(
          daily.comboToday,
          engine.comboMultiplierFor(nextStacks),
        ),
      },
    });
    r.comboStacks = nextStacks;
    awardAchievements();

    // Consume pending cash multiplier (double/triple gains)
    r._cashMult = null;

    // Sounds + effects
    if (r.kind === "golden") sfx.golden();
    else if (r.kind === "rainbow") sfx.gem();
    else if (value >= 500) sfx.jackpot();
    else sfx.cash();

    r.status = "cashed";
    setSnapshot((s) => ({
      ...s,
      status: "cashed",
      comboStacks: r.comboStacks,
      lastGain: { coins, gems },
      burst: nextBurst(r.kind === "rainbow" ? "gems" : "coins", value >= 60),
    }));
    setEffects((e) => ({ ...e, cashMult: null }));
    window.setTimeout(() => {
      if (runRef.current === r) resetRun();
    }, engine.RESET_DELAY_MS);
  }, [awardAchievements, commit, effectiveElapsed, ensureDaily, nextBurst, resetRun]);

  const explode = useCallback(() => {
    const r = runRef.current;
    if (r.status !== "inflating") return;
    initAudio();
    sfx.pop();
    r.comboStacks = 0;
    r._cashMult = null;
    commit({ pops: r.save.pops + 1 });
    awardAchievements();
    r.status = "popped";
    setSnapshot((s) => ({
      ...s,
      status: "popped",
      comboStacks: 0,
      flash: s.flash + 1,
      burst: nextBurst("pop", false),
    }));
    setEffects(NO_EFFECTS);
    window.setTimeout(() => {
      if (runRef.current === r) resetRun();
    }, engine.RESET_DELAY_MS);
  }, [awardAchievements, commit, nextBurst, resetRun]);

  // --- boosters ------------------------------------------------------------
  const activateBooster = useCallback(
    (id: TempBoosterId) => {
      const r = runRef.current;
      if (r.status !== "inflating") return;
      if (r.save.boosters[id] < 1) return;
      const def = tempBoosterById(id);
      initAudio();
      sfx.click();

      const now = Date.now();
      if (def.kind === "shield") {
        const current = effects.shield;
        if (current && now < current.until) return;
        setEffects((e) => ({
          ...e,
          shield: { until: now + (def.duration ?? 5) * 1000, duration: def.duration ?? 5 },
        }));
      } else if (def.kind === "freeze") {
        const current = effects.freeze;
        if (current && now < current.until) return;
        const baseRisk = engine.baseRiskFor(r.kind);
        const frozenRisk = engine.riskForElapsed(
          effectiveElapsed(),
          baseRisk,
          r.save.upgrades,
        );
        setEffects((e) => ({
          ...e,
          freeze: { until: now + (def.duration ?? 10) * 1000, risk: frozenRisk },
        }));
      } else if (def.kind === "cash") {
        setEffects((e) => ({ ...e, cashMult: def.duration ?? 2 }));
        sfx.cash();
      } else {
        // lucky: next bubble guaranteed special
        r._pendingLucky = true;
        setEffects((e) => ({ ...e, lucky: true }));
      }

      commit({
        boosters: { ...r.save.boosters, [id]: r.save.boosters[id] - 1 },
      });
    },
    [commit, effectiveElapsed, effects],
  );

  // ref mirror of effects (used inside intervals without re-registering)
  const effectsRef = useRef(effects);
  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  // --- game loops ----------------------------------------------------------
  useEffect(() => {
    const uiTick = window.setInterval(() => {
      const r = runRef.current;
      if (r.status !== "inflating" || r.paused) return;
      const up = r.save.upgrades;
      const elapsed = effectiveElapsed();
      const speedMult = 1 + 0.1 * up.inflate;
      const baseRisk = engine.baseRiskFor(r.kind);

      setEffects((e) => {
        const now = Date.now();
        const shield = e.shield && now < e.shield.until ? e.shield : null;
        const freeze = e.freeze && now < e.freeze.until ? e.freeze : null;
        return { ...e, shield, freeze };
      });
      const frozen = effectsRef.current.freeze;
      setSnapshot((s) => ({
        ...s,
        elapsed,
        risk:
          frozen && Date.now() < frozen.until
            ? frozen.risk
            : engine.riskForElapsed(elapsed, baseRisk, up),
        value: engine.valueForElapsed(elapsed, r.kind, up),
        size: engine.sizeForElapsed(elapsed, speedMult),
      }));
    }, engine.UI_TICK_MS);

    const boomTick = window.setInterval(() => {
      const r = runRef.current;
      if (r.status !== "inflating" || r.paused) return;
      const up = r.save.upgrades;
      const elapsed = effectiveElapsed();
      const baseRisk = engine.baseRiskFor(r.kind);
      const risk = engine.riskForElapsed(elapsed, baseRisk, up);
      // A shield blocks the explosion entirely; a frozen risk is not solved.
      const shielded = effectsRef.current.shield && Date.now() < effectsRef.current.shield.until;
      if (shielded) return;
      if (Math.random() < engine.explosionChance(risk)) explode();
    }, engine.EXPLOSION_TICK_MS);

    return () => {
      window.clearInterval(uiTick);
      window.clearInterval(boomTick);
    };
  }, [effectiveElapsed, explode]);

  // --- pause while the tab is hidden (no surprise time jumps) --------------
  useEffect(() => {
    const onVisibility = () => {
      const r = runRef.current;
      if (document.hidden) {
        if (!r.paused && r.status === "inflating") {
          r.baseElapsed = effectiveElapsed();
          r.phaseStartedAt = Date.now();
          r.paused = true;
        }
      } else {
        r.paused = false;
        r.phaseStartedAt = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [effectiveElapsed]);

  // --- persistence --------------------------------------------------------
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ ...save, lastSeen: Date.now() }),
      );
    } catch {
      /* storage full/blocked — gameplay continues in memory */
    }
  }, [save]);

  // --- leaderboard sync (only when beating a record / every 500 coins) -----
  useEffect(() => {
    const s = save;
    const syncBiggest = s.bestBubble > s.synced.biggest;
    const syncTotal = s.lifetimeCoins - s.synced.total >= 500;
    if (!syncBiggest && !syncTotal) return;
    const next = {
      biggest: Math.max(s.bestBubble, s.synced.biggest),
      total: Math.max(s.lifetimeCoins, s.synced.total),
    };
    upsertScore({
      name: s.pseudo,
      biggestBubble: s.bestBubble,
      totalCoins: s.lifetimeCoins,
    })
      .then(() => {
        runRef.current.save = { ...runRef.current.save, synced: next };
        setStoreSave(runRef.current.save);
      })
      .catch(() => {
        /* offline — will retry when the score changes again */
      });
  }, [save.bestBubble, save.lifetimeCoins, save.pseudo, save.synced.biggest, save.synced.total, upsertScore]);

  // --- audio mute sync -----------------------------------------------------
  useEffect(() => {
    setMuted(save.muted);
  }, [save.muted]);

  // --- shop actions ---------------------------------------------------------
  const buyUpgrade = useCallback(
    (id: UpgradeId) => {
      const r = runRef.current;
      const def = upgradeById(id);
      const level = r.save.upgrades[id];
      if (level >= def.maxLevel) return;
      const price = upgradePrice(def, level);
      if (r.save.coins < price) return;
      initAudio();
      sfx.cash();
      commit({
        coins: r.save.coins - price,
        upgrades: { ...r.save.upgrades, [id]: level + 1 },
      });
    },
    [commit],
  );

  const buyBooster = useCallback(
    (id: TempBoosterId) => {
      const r = runRef.current;
      if (r.save.boosters[id] >= TEMP_BOOSTER_MAX_STOCK) return;
      const def = tempBoosterById(id);
      if (r.save.coins < def.price) return;
      initAudio();
      sfx.click();
      commit({
        coins: r.save.coins - def.price,
        boosters: { ...r.save.boosters, [id]: r.save.boosters[id] + 1 },
      });
    },
    [commit],
  );

  const buySkin = useCallback(
    (id: string) => {
      const r = runRef.current;
      const def = skinById(id);
      if (r.save.skins.includes(id)) {
        if (r.save.skin !== id) {
          initAudio();
          sfx.click();
          commit({ skin: id });
        }
        return;
      }
      if (r.save.gems < def.gems) return;
      initAudio();
      sfx.gem();
      commit({
        gems: r.save.gems - def.gems,
        skins: [...r.save.skins, id],
        skin: id,
      });
    },
    [commit],
  );

  const buyPassive = useCallback(
    (id: string) => {
      const r = runRef.current;
      if (r.save.passives[id]) return;
      const def = passiveById(id);
      if (def.unlockRuns > r.save.runs) return;
      if (r.save.coins < def.price) return;
      initAudio();
      sfx.cash();
      commit({
        coins: r.save.coins - def.price,
        passives: { ...r.save.passives, [id]: true },
      });
    },
    [commit],
  );

  // --- daily challenges claims --------------------------------------------
  const claimDailyGoal = useCallback(
    (goalId: string) => {
      const r = runRef.current;
      const daily = r.save.daily;
      if (daily.date !== todayKey() || daily.claimed.includes(goalId)) return;
      const goal = daily.goals.find((g) => g.id === goalId);
      if (!goal || !progressOf(daily, goal).complete) return;
      initAudio();
      sfx.gem();
      commit({
        gems: r.save.gems + goal.reward,
        daily: { ...daily, claimed: [...daily.claimed, goalId] },
      });
      toast.success(`Défi terminé : ${goalLabel(goal)}`, {
        description: `+${goal.reward} 💎`,
      });
    },
    [commit],
  );

  const claimDailyBonus = useCallback(() => {
    const r = runRef.current;
    const daily = r.save.daily;
    if (daily.date !== todayKey() || daily.bonusClaimed) return;
    const allDone = daily.goals.every((g) => progressOf(daily, g).complete);
    if (!allDone) return;
    initAudio();
    sfx.jackpot();
    commit({
      gems: r.save.gems + DAILY_BONUS_GEMS,
      daily: { ...daily, bonusClaimed: true },
    });
    toast.success("Bonus des 3 défis !", {
      description: `+${DAILY_BONUS_GEMS} 💎`,
    });
  }, [commit]);

  const claimStreak = useCallback(() => {
    const r = runRef.current;
    const daily = r.save.daily;
    if (daily.date !== todayKey() || daily.streakClaimed) return;
    initAudio();
    sfx.gem();
    const reward = streakReward(daily.streak);
    commit({
      gems: r.save.gems + reward,
      daily: { ...daily, streakClaimed: true },
    });
    toast.success(`Streak de ${daily.streak} jours !`, {
      description: `+${reward} 💎`,
    });
  }, [commit]);

  const claimAdminQuest = useCallback(
    (questId: string, reward: number) => {
      const r = runRef.current;
      const daily = r.save.daily;
      if (daily.date !== todayKey() || daily.claimedAdmin.includes(questId)) return;
      initAudio();
      sfx.gem();
      commit({
        gems: r.save.gems + reward,
        daily: { ...daily, claimedAdmin: [...daily.claimedAdmin, questId] },
      });
      toast.success("Quête terminée !", {
        description: `+${reward} 💎`,
      });
    },
    [commit],
  );

  /** Wipes the whole save (debug / test). */
  const resetProgress = useCallback(() => {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, []);

  const toggleMute = useCallback(() => {
    initAudio();
    sfx.click();
    commit({ muted: !runRef.current.save.muted });
  }, [commit]);

  const clearBurst = useCallback(() => {
    setSnapshot((s) => ({ ...s, burst: null }));
  }, []);

  return {
    ...snapshot,
    save,
    daily: save.daily,
    effects,
    offlineClaim,
    cashOut,
    toggleMute,
    clearBurst,
    activateBooster,
    buyUpgrade,
    buyBooster,
    buySkin,
    buyPassive,
    claimOffline,
    claimDailyGoal,
    claimDailyBonus,
    claimStreak,
    claimAdminQuest,
    resetProgress,
    /** Current elapsed seconds of the run (cheap, safe for per-frame reads). */
    getElapsed: effectiveElapsed,
  };
}