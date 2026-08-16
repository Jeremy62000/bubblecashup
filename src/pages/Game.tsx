import { AnimatePresence, motion } from "framer-motion";
import {
  Coins,
  Gem,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { BurstOverlay } from "@/components/burst-overlay";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import * as engine from "@/lib/game-engine";
import type { BubbleKind } from "@/lib/game-engine";
import { skinById, TEMP_BOOSTERS, type TempBoosterId } from "@/lib/shop";

// --- special bubble skins (golden / rainbow keep their own look) ------------
const SPECIAL_STYLES: Record<
  Exclude<BubbleKind, "normal">,
  { label: string; background: string; accent: string; shadow: string; chip: string }
> = {
  golden: {
    label: "Bulle d'or",
    background:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(253,230,138,0.95) 32%, rgba(251,191,36,0.75) 68%, rgba(217,119,6,0.55) 100%)",
    accent: "border-amber-200/90",
    shadow: "0 18px 55px -10px rgba(245,158,11,0.65), inset 0 -12px 28px rgba(255,255,255,0.45)",
    chip: "border-amber-300/80 bg-amber-100/70 text-amber-900",
  },
  rainbow: {
    label: "Bulle arc-en-ciel",
    background:
      "conic-gradient(from 200deg, #f471b5, #a78bfa, #60a5fa, #34d399, #fbbf24, #fb7185, #f471b5)",
    accent: "border-fuchsia-200/80",
    shadow: "0 18px 50px -8px rgba(217,70,239,0.4), inset 0 -12px 28px rgba(255,255,255,0.4)",
    chip: "border-fuchsia-200/80 bg-fuchsia-100/70 text-fuchsia-900",
  },
};

const DECOR_BUBBLES = [
  { left: "6%", top: "12%", size: 56, delay: 0 },
  { left: "84%", top: "8%", size: 40, delay: 0.8 },
  { left: "12%", top: "62%", size: 34, delay: 1.6 },
  { left: "88%", top: "58%", size: 62, delay: 0.4 },
  { left: "18%", top: "24%", size: 22, delay: 2.1 },
  { left: "78%", top: "30%", size: 30, delay: 1.2 },
] as const;

function HeaderStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 px-3.5 py-2">
      {icon}
      <span className="leading-tight">
        <span className="block text-[13px] font-bold text-slate-800 tabular-nums">
          {value}
        </span>
        <span className="block text-[8px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </span>
    </span>
  );
}

function EffectChip({ children }: { children: ReactNode }) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-sm backdrop-blur-md"
    >
      {children}
    </motion.span>
  );
}

export default function Game() {
  const game = useBubbleGame();
  const {
    save,
    kind,
    risk,
    value,
    status,
    comboStacks,
    burst,
    flash,
    lastGain,
    effects,
    offlineClaim,
  } = game;
  const skin = skinById(save.skin);
  const style =
    kind === "normal"
      ? {
          label: "Bulle",
          background: skin.gradient,
          accent: skin.border,
          shadow:
            "0 18px 60px -12px rgba(79,70,229,0.5), inset 0 -14px 30px rgba(255,255,255,0.35)",
          chip: "border-white/70 bg-white/60 text-slate-700",
        }
      : SPECIAL_STYLES[kind];
  const multiplier = engine.comboMultiplierFor(comboStacks);
  const isBusy = status !== "inflating";
  const ratePerSec = engine.valuePerSecondUpgraded(save.upgrades);

  const now = Date.now();
  const shieldLeft = effects.shield
    ? Math.max(0, Math.ceil((effects.shield.until - now) / 1000))
    : 0;
  const freezeLeft = effects.freeze
    ? Math.max(0, Math.ceil((effects.freeze.until - now) / 1000))
    : 0;

  // --- 60 fps bubble size (direct DOM writes, no React re-render) ---------
  const gameRef = useRef(game);
  gameRef.current = game;
  const bubbleRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(game.size);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(40, t - last);
      last = t;
      const g = gameRef.current;
      if (g.status === "inflating") {
        const speedMult = 1 + 0.1 * g.save.upgrades.inflate;
        const target = engine.sizeForElapsed(g.getElapsed(), speedMult);
        // fast snap when shrinking (fresh bubble), smooth lerp when growing
        const alpha =
          target < sizeRef.current ? Math.min(1, dt / 50) : Math.min(1, dt / 120);
        sizeRef.current += (target - sizeRef.current) * alpha;
        if (bubbleRef.current) {
          bubbleRef.current.style.width = `${sizeRef.current}px`;
          bubbleRef.current.style.height = `${sizeRef.current}px`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const decor = useMemo(
    () =>
      DECOR_BUBBLES.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ y: 0 }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
          className="pointer-events-none absolute rounded-full border border-white/60 bg-white/25 backdrop-blur-sm"
          style={{ left: b.left, top: b.top, width: b.size, height: b.size }}
        />
      )),
    [],
  );

  const boostersInBag = TEMP_BOOSTERS.filter((b) => save.boosters[b.id] > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative flex min-h-dvh flex-col overflow-hidden text-slate-800"
      style={{
        background:
          "radial-gradient(130% 90% at 50% -10%, #e0f2fe 0%, #ede9fe 48%, #fce7f3 100%)",
      }}
    >
      {decor}

      {/* slow drifting light blobs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 46, -18, 0], y: [0, -34, 18, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -40, 24, 0], y: [0, 30, -22, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-fuchsia-300/25 blur-3xl"
      />

      {/* red explosion flash */}
      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="pointer-events-none absolute inset-0 z-30 bg-red-500/70"
          />
        )}
      </AnimatePresence>

      <BurstOverlay burst={burst} onDone={game.clearBurst} />

      {/* ---------- header (unified glass bar) ---------- */}
      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4 pt-4">
        <div className="flex items-center divide-x divide-indigo-200/60 rounded-3xl border border-white/70 bg-white/60 shadow-lg shadow-indigo-900/5 backdrop-blur-xl">
          <HeaderStat
            icon={<Coins className="h-4 w-4 text-amber-500" />}
            value={engine.formatCoins(save.coins)}
            label="pièces"
          />
          <HeaderStat
            icon={<Gem className="h-4 w-4 text-fuchsia-500" />}
            value={engine.formatCoins(save.gems)}
            label="cristaux"
          />
          <HeaderStat
            icon={<Trophy className="h-4 w-4 text-indigo-500" />}
            value={engine.formatCoins(save.bestBubble)}
            label="record"
          />
        </div>
        <button
          type="button"
          onClick={game.toggleMute}
          aria-label={save.muted ? "Activer le son" : "Couper le son"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-slate-500 shadow-md backdrop-blur-xl transition hover:bg-white/80 active:scale-95"
        >
          {save.muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* ---------- stage ---------- */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-2.5 px-4">
        {/* combo */}
        <div className="h-7">
          <AnimatePresence>
            {comboStacks > 0 && status === "inflating" && (
              <motion.div
                key={comboStacks}
                initial={{ scale: 0.5, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-100/70 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm backdrop-blur-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Combo ×{multiplier.toFixed(1)} au prochain encaissement
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* bubble + kind chip + active effects */}
        <div className="flex flex-col items-center gap-2.5">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md ${style.chip}`}
          >
            {style.label}
            {kind === "golden" && " · ×3"}
            {kind === "rainbow" && " · offres des cristaux"}
          </span>

          <div className="flex h-6 items-center justify-center gap-1.5">
            <AnimatePresence mode="popLayout">
              {shieldLeft > 0 && (
                <EffectChip key="shield">🛡️ bouclier {shieldLeft}s</EffectChip>
              )}
              {freezeLeft > 0 && (
                <EffectChip key="freeze">🧊 gel {freezeLeft}s</EffectChip>
              )}
              {effects.cashMult === 2 && !isBusy && (
                <EffectChip key="dbl">🪙 ×2 à l'encaissement</EffectChip>
              )}
              {effects.cashMult === 3 && !isBusy && (
                <EffectChip key="tpl">🚀 ×3 à l'encaissement</EffectChip>
              )}
              {effects.lucky && !isBusy && (
                <EffectChip key="lucky">🍀 prochaine bulle spéciale</EffectChip>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex h-[290px] w-full max-w-[310px] items-center justify-center sm:h-[330px] sm:max-w-[350px]">
            {/* floating gain */}
            <AnimatePresence>
              {lastGain && (
                <motion.p
                  key={lastGain.coins + ":" + lastGain.gems + ":" + (burst?.id ?? 0)}
                  initial={{ opacity: 0, y: 6, scale: 0.7 }}
                  animate={{ opacity: 1, y: -46, scale: 1.1 }}
                  exit={{ opacity: 0, y: -70, scale: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute top-4 z-20 rounded-full border border-amber-300/70 bg-white/80 px-4 py-1.5 text-lg font-extrabold text-amber-600 shadow-lg backdrop-blur-md"
                >
                  {lastGain.gems > 0
                    ? `+${lastGain.gems} 💎`
                    : `+${engine.formatCoins(lastGain.coins)} 🪙`}
                </motion.p>
              )}
            </AnimatePresence>

            {/* bubble (size driven by rAF loop = silky smooth) */}
            <div
              ref={bubbleRef}
              className="relative flex items-center justify-center"
              style={{ width: sizeRef.current, height: sizeRef.current }}
            >
              {/* soft aura glow */}
              <motion.div
                aria-hidden
                animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -inset-4 rounded-full blur-2xl"
                style={{
                  background:
                    kind === "golden"
                      ? "rgba(251,191,36,0.55)"
                      : kind === "rainbow"
                        ? "rgba(217,70,239,0.45)"
                        : "rgba(99,102,241,0.4)",
                }}
              />

              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-full w-full items-center justify-center"
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={status + skin.id}
                    initial={{ scale: status === "inflating" ? 0.6 : 1, opacity: 0.6 }}
                    animate={
                      status === "inflating"
                        ? { scale: 1, opacity: 1 }
                        : { scale: status === "cashed" ? 1.12 : 1.4, opacity: 0 }
                    }
                    transition={{ duration: status === "inflating" ? 0.35 : 0.55, ease: "easeOut" }}
                    className={`absolute inset-0 overflow-hidden rounded-full border ${style.accent}`}
                    style={{ background: style.background, boxShadow: style.shadow }}
                  >
                    {/* rotating light sheen */}
                    <motion.span
                      aria-hidden
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                      className="absolute -inset-[20%] rounded-full"
                      style={{
                        background:
                          "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.30) 24deg, transparent 70deg, rgba(255,255,255,0.12) 160deg, transparent 220deg, rgba(255,255,255,0.22) 300deg, transparent 360deg)",
                      }}
                    />
                    {/* specular highlights */}
                    <span
                      aria-hidden
                      className="absolute left-[14%] top-[9%] h-[30%] w-[42%] -rotate-[24deg] rounded-full bg-white/80 blur-[3px]"
                    />
                    <span
                      aria-hidden
                      className="absolute left-[16%] top-[15%] h-[16%] w-[20%] rounded-full bg-white/85 blur-[1px]"
                    />
                    {/* risk tint: bubble warms up as danger rises */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-500"
                      style={{
                        opacity: Math.max(0, Math.min(1, (risk - 35) / 55)),
                        background:
                          "radial-gradient(circle at 35% 30%, rgba(251,113,133,0) 0%, rgba(244,63,94,0.22) 55%, rgba(190,18,60,0.32) 100%)",
                      }}
                    />
                    {kind === "golden" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-amber-900/70">
                        ×3
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>

        {/* value readout + rate */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-2">
            <motion.span
              key={multiplier}
              initial={{ scale: 1.2, color: "#b45309" }}
              animate={{ scale: 1, color: "#0f172a" }}
              className="text-4xl font-black tabular-nums"
            >
              {engine.formatLiveValue(value)}
            </motion.span>
            <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
              {kind === "rainbow" ? "cristaux ?" : "pièces"}
            </span>
          </div>
          {kind !== "rainbow" && (
            <span className="rounded-full border border-white/60 bg-white/50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 backdrop-blur-sm">
              ⚡ +{ratePerSec.toFixed(1)}/s
            </span>
          )}
        </div>

        {/* risk gauge */}
        <div className="w-64 max-w-full">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Risque</span>
            <motion.span
              animate={risk >= 75 ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, repeat: risk >= 75 ? Infinity : 0 }}
              className={risk >= 70 ? "text-rose-500" : "text-slate-600"}
            >
              {Math.round(risk)}%
            </motion.span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full border border-white/70 bg-white/50 p-[3px] shadow-inner backdrop-blur-md">
            {/* ticks */}
            <span aria-hidden className="absolute left-1/4 top-0 h-full w-px bg-slate-300/50" />
            <span aria-hidden className="absolute left-2/4 top-0 h-full w-px bg-slate-300/50" />
            <span aria-hidden className="absolute left-3/4 top-0 h-full w-px bg-slate-300/50" />
            <motion.div
              animate={{ width: `${risk}%` }}
              transition={{ duration: 0.22, ease: "linear" }}
              className={`relative h-full rounded-full ${
                risk < 50
                  ? "bg-gradient-to-r from-sky-400 to-indigo-400"
                  : risk < 75
                    ? "bg-gradient-to-r from-indigo-400 to-violet-400"
                    : "bg-gradient-to-r from-violet-400 to-rose-400"
              }`}
            >
              {/* moving glint at the tip of the gauge */}
              <span
                aria-hidden
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/90 shadow-md"
                style={{ filter: "blur(1px)" }}
              />
            </motion.div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          {shieldLeft > 0
            ? "🛡️ Ta bulle est protégée !"
            : risk >= 70
              ? "⚠️ Très risqué… encaisse vite !"
              : "Encaisser souvent = garder ses pièces plus longtemps !"}
        </p>
      </main>

      {/* ---------- booster tray (owned ones) ---------- */}
      {boostersInBag.length > 0 && (
        <div className="relative z-10 mx-auto flex w-full max-w-md items-center gap-1.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TEMP_BOOSTERS.filter((b) => save.boosters[b.id] > 0).map((b) => {
            const count = save.boosters[b.id];
            const blocked =
              isBusy ||
              (b.kind === "shield" && Boolean(effects.shield)) ||
              (b.kind === "freeze" && Boolean(effects.freeze));
            return (
              <motion.button
                key={b.id}
                type="button"
                whileTap={blocked ? undefined : { scale: 0.9 }}
                disabled={blocked}
                onClick={() => game.activateBooster(b.id as TempBoosterId)}
                title={b.name}
                className={`relative flex shrink-0 items-center gap-1 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur-md transition-colors ${
                  blocked ? "cursor-not-allowed opacity-40" : "hover:bg-white/95"
                }`}
              >
                <span>{b.emoji}</span>
                <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-600">
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ---------- footer ---------- */}
      <footer className="relative z-10 mx-auto w-full max-w-md px-5 pb-24 pt-1">
        <motion.button
          type="button"
          onClick={game.cashOut}
          whileTap={isBusy ? undefined : { scale: 0.95 }}
          disabled={isBusy}
          className={`group relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-4 text-xl font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/30 transition-colors ${
            isBusy ? "cursor-not-allowed opacity-40" : "hover:shadow-indigo-500/50"
          }`}
        >
          {/* sweeping shine */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-[-40%] top-0 h-full w-[35%] -skew-x-12 bg-white/25 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[430%]"
          />
          <span className="relative">🫧 Encaisser</span>
          <span className="pointer-events-none absolute inset-0 rounded-3xl border border-white/40" />
        </motion.button>
      </footer>

      <BottomNav />

      {/* ---------- offline earnings ---------- */}
      <AnimatePresence>
        {offlineClaim && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-x-4 bottom-32 z-50 mx-auto max-w-md rounded-3xl border border-white/70 bg-white/85 p-4 shadow-2xl shadow-indigo-900/15 backdrop-blur-2xl"
          >
            <p className="text-sm font-bold text-slate-800">
              Bienvenue ! 🎉 Pendant tes {offlineClaim.minutes} min d'absence,
              tes machines ont fabriqué&nbsp;:
            </p>
            <p className="mt-1 text-2xl font-black text-amber-500">
              {engine.formatCoins(offlineClaim.coins)} 🪙
            </p>
            <button
              type="button"
              onClick={game.claimOffline}
              className="mt-3 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-3 text-base font-black uppercase tracking-widest text-white shadow-lg active:scale-95"
            >
              Récupérer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}