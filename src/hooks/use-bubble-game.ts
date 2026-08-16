// ---------------------------------------------------------------------------
// Bubble Up — game loop hook. Owns the run state (bubble + risk + value),
// the combo system, cash-out / explosion flow, saves to localStorage and
// fires burst/flash effects for the UI.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useRef, useState } from "react";
import * as engine from "@/lib/game-engine";
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
}

export interface BurstEvent {
  id: number;
  kind: "coins" | "gems" | "pop";
  big: boolean;
}

const DEFAULT_SAVE: SaveData = {
  coins: 0,
  gems: 0,
  bestBubble: 0,
  runs: 0,
  cashouts: 0,
  pops: 0,
  muted: false,
};

function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return DEFAULT_SAVE;
    return { ...DEFAULT_SAVE, ...(JSON.parse(raw) as Partial<SaveData>) };
  } catch {
    return DEFAULT_SAVE;
  }
}

interface RunRef {
  kind: engine.BubbleKind;
  phaseStartedAt: number;
  baseElapsed: number;
  status: engine.RunStatus;
  comboStacks: number;
  save: SaveData;
  paused: boolean;
}

function createRunRef(kind: engine.BubbleKind): RunRef {
  return {
    kind,
    phaseStartedAt: Date.now(),
    baseElapsed: 0,
    status: "inflating",
    comboStacks: 0,
    save: loadSave(),
    paused: false,
  };
}

export function useBubbleGame() {
  const runRef = useRef<RunRef>(createRunRef(engine.rollBubbleKind()));
  const burstIdRef = useRef(0);
  const [save, setSave] = useState<SaveData>(runRef.current.save);
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
    setSave(runRef.current.save);
  }, []);

  const nextBurst = useCallback(
    (kind: BurstEvent["kind"], big: boolean): BurstEvent => ({
      id: ++burstIdRef.current,
      kind,
      big,
    }),
    [],
  );

  const resetRun = useCallback(() => {
    const r = runRef.current;
    r.kind = engine.rollBubbleKind();
    r.phaseStartedAt = Date.now();
    r.baseElapsed = 0;
    r.status = "inflating";
    r.paused = false;
    commit({ runs: r.save.runs + 1 });
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
  }, [commit]);

  const cashOut = useCallback(() => {
    const r = runRef.current;
    if (r.status !== "inflating") return;
    initAudio();

    const elapsed = effectiveElapsed();
    const value = engine.valueForElapsed(elapsed, r.kind);
    const risk = engine.riskForElapsed(elapsed, engine.baseRiskFor(r.kind));
    const multiplier = engine.comboMultiplierFor(r.comboStacks);

    let coins = 0;
    let gems = 0;
    if (r.kind === "rainbow") {
      gems = engine.rollRainbowGems();
    } else {
      coins = Math.floor(value * multiplier);
    }

    const bestBubble = Math.max(r.save.bestBubble, value);
    commit({
      coins: r.save.coins + coins,
      gems: r.save.gems + gems,
      bestBubble,
      cashouts: r.save.cashouts + 1,
    });

    // Combo: a high-risk cash-out stacks the next multiplier, a very early
    // one resets it.
    if (risk >= engine.COMBO_HIGH_RISK * 100) {
      r.comboStacks += 1;
    } else if (risk <= engine.COMBO_LOW_RISK * 100) {
      r.comboStacks = 0;
    }

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
    window.setTimeout(() => {
      if (runRef.current === r) resetRun();
    }, engine.RESET_DELAY_MS);
  }, [commit, effectiveElapsed, nextBurst, resetRun]);

  const explode = useCallback(() => {
    const r = runRef.current;
    if (r.status !== "inflating") return;
    initAudio();
    sfx.pop();
    r.comboStacks = 0;
    commit({ pops: r.save.pops + 1 });
    r.status = "popped";
    setSnapshot((s) => ({
      ...s,
      status: "popped",
      comboStacks: 0,
      flash: s.flash + 1,
      burst: nextBurst("pop", false),
    }));
    window.setTimeout(() => {
      if (runRef.current === r) resetRun();
    }, engine.RESET_DELAY_MS);
  }, [commit, nextBurst, resetRun]);

  // --- game loops ----------------------------------------------------------
  useEffect(() => {
    const uiTick = window.setInterval(() => {
      const r = runRef.current;
      if (r.status !== "inflating" || r.paused) return;
      const elapsed = effectiveElapsed();
      const risk = engine.riskForElapsed(elapsed, engine.baseRiskFor(r.kind));
      setSnapshot((s) => ({
        ...s,
        elapsed,
        risk,
        value: engine.valueForElapsed(elapsed, r.kind),
        size: engine.sizeForElapsed(elapsed),
      }));
    }, engine.UI_TICK_MS);

    const boomTick = window.setInterval(() => {
      const r = runRef.current;
      if (r.status !== "inflating" || r.paused) return;
      const elapsed = effectiveElapsed();
      const risk = engine.riskForElapsed(elapsed, engine.baseRiskFor(r.kind));
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

  // --- audio mute sync -----------------------------------------------------
  useEffect(() => {
    setMuted(save.muted);
  }, [save.muted]);

  const toggleMute = useCallback(() => {
    initAudio();
    sfx.click();
    commit({ muted: !runRef.current.save.muted });
  }, [commit]);

  const clearBurst = useCallback(() => {
    setSnapshot((s) => ({ ...s, burst: null }));
  }, []);

  return { ...snapshot, save, cashOut, toggleMute, clearBurst };
}