import { AnimatePresence, motion } from "framer-motion";
import { Coins, Gem, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { BurstOverlay } from "@/components/burst-overlay";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import * as engine from "@/lib/game-engine";
import type { BubbleKind } from "@/lib/game-engine";

// --- bubble skins (light glass, kid friendly) ------------------------------
const BUBBLE_STYLES: Record<
  BubbleKind,
  { label: string; background: string; accent: string; shadow: string; chip: string }
> = {
  normal: {
    label: "Bulle",
    background:
      "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(186,230,253,0.92) 30%, rgba(129,140,248,0.55) 68%, rgba(167,139,250,0.5) 100%)",
    accent: "border-sky-200/80",
    shadow: "0 18px 50px -12px rgba(79,70,229,0.45), inset 0 -12px 28px rgba(255,255,255,0.35)",
    chip: "border-sky-200/70 bg-sky-100/60 text-sky-800",
  },
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

function Chip({
  icon,
  label,
  value,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-2xl border border-white/70 bg-white/60 px-2.5 py-1.5 shadow-sm shadow-indigo-900/5 backdrop-blur-xl ${className}`}
    >
      {icon}
      <div className="leading-tight">
        <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="text-[13px] font-bold text-slate-800 tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function Game() {
  const game = useBubbleGame();
  const { save, kind, risk, value, size, status, comboStacks, burst, flash, lastGain } = game;
  const style = BUBBLE_STYLES[kind];
  const multiplier = engine.comboMultiplierFor(comboStacks);
  const isBusy = status !== "inflating";

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

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden text-slate-800"
      style={{
        background:
          "radial-gradient(130% 90% at 50% -10%, #e0f2fe 0%, #ede9fe 48%, #fce7f3 100%)",
      }}
    >
      {decor}

      {/* soft light beams */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl"
      />
      <div
        aria-hidden
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

      {/* ---------- header ---------- */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 pt-4 sm:px-4">
        <Chip
          icon={<Coins className="h-4 w-4 text-amber-500" />}
          label="Pièces"
          value={engine.formatCoins(save.coins)}
        />
        <Chip
          icon={<Gem className="h-4 w-4 text-fuchsia-500" />}
          label="Cristaux"
          value={engine.formatCoins(save.gems)}
        />
        <Chip
          icon={<Trophy className="h-4 w-4 text-indigo-500" />}
          label="Record"
          value={engine.formatCoins(save.bestBubble)}
        />
        <button
          type="button"
          onClick={game.toggleMute}
          aria-label={save.muted ? "Activer le son" : "Couper le son"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-slate-600 shadow-sm backdrop-blur-xl transition hover:bg-white/80 active:scale-95"
        >
          {save.muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </header>

      {/* ---------- stage ---------- */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3 px-4">
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
                Combo ×{multiplier.toFixed(1)} sur le prochain encaissement
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* bubble + kind chip */}
        <div className="flex flex-col items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md ${style.chip}`}
          >
            {style.label}
            {kind === "golden" && " · ×3"}
            {kind === "rainbow" && " · offres des cristaux"}
          </span>

          <div className="relative flex h-[280px] w-full max-w-[300px] items-center justify-center sm:h-[320px] sm:max-w-[340px]">
            {/* floating gain */}
            <AnimatePresence>
              {lastGain && (
                <motion.p
                  key={lastGain.coins + ":" + lastGain.gems + ":" + (burst?.id ?? 0)}
                  initial={{ opacity: 0, y: 6, scale: 0.7 }}
                  animate={{ opacity: 1, y: -46, scale: 1.1 }}
                  exit={{ opacity: 0, y: -70, scale: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute top-6 z-20 rounded-full border border-amber-300/70 bg-white/80 px-4 py-1.5 text-lg font-extrabold text-amber-600 shadow-lg backdrop-blur-md"
                >
                  {lastGain.gems > 0
                    ? `+${lastGain.gems} 💎`
                    : `+${engine.formatCoins(lastGain.coins)} 🪙`}
                </motion.p>
              )}
            </AnimatePresence>

            {/* bubble */}
            <div
              className="relative flex items-center justify-center transition-[width,height] duration-500 ease-out"
              style={{ width: size, height: size }}
            >
              <motion.div
                animate={{ scale: [1, 1.025, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-full w-full items-center justify-center"
              >
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={status}
                    initial={{ scale: status === "inflating" ? 0.6 : 1, opacity: 0.6 }}
                    animate={
                      status === "inflating"
                        ? { scale: 1, opacity: 1 }
                        : { scale: status === "cashed" ? 1.12 : 1.35, opacity: 0 }
                    }
                    transition={{ duration: status === "inflating" ? 0.35 : 0.5, ease: "easeOut" }}
                    className={`absolute inset-0 rounded-full border ${style.accent}`}
                    style={{ background: style.background, boxShadow: style.shadow }}
                  >
                    {/* specular highlight */}
                    <span
                      aria-hidden
                      className="absolute left-[14%] top-[9%] h-[30%] w-[42%] -rotate-[24deg] rounded-full bg-white/80 blur-[3px]"
                    />
                    <span
                      aria-hidden
                      className="absolute left-[16%] top-[15%] h-[16%] w-[20%] rounded-full bg-white/85 blur-[1px]"
                    />
                    {kind === "golden" && (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-amber-900/70">
                        ×3
                      </span>
                    )}
                    {kind === "rainbow" && (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-400/20 via-transparent to-white/40"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>

        {/* value readout */}
        <div className="flex items-baseline gap-2">
          <motion.span
            key={multiplier}
            initial={{ scale: 1.25, color: "#b45309" }}
            animate={{ scale: 1, color: "#0f172a" }}
            className="text-4xl font-black tabular-nums"
          >
            {engine.formatLiveValue(value)}
          </motion.span>
          <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
            {kind === "rainbow" ? "cristaux ?" : "pièces"}
          </span>
        </div>

        {/* risk gauge */}
        <div className="w-64 max-w-full">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Risque</span>
            <span className={risk >= 70 ? "text-rose-500" : "text-slate-600"}>
              {Math.round(risk)}%
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full border border-white/70 bg-white/50 p-[3px] shadow-inner backdrop-blur-md">
            <motion.div
              animate={{ width: `${risk}%` }}
              transition={{ duration: 0.25, ease: "linear" }}
              className={`h-full rounded-full ${
                risk < 50
                  ? "bg-gradient-to-r from-sky-400 to-indigo-400"
                  : risk < 75
                    ? "bg-gradient-to-r from-indigo-400 to-violet-400"
                    : "bg-gradient-to-r from-violet-400 to-rose-400"
              }`}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          {risk >= 70
            ? "⚠️ Très risqué… encaisse vite !"
            : "Encaisser souvent = garder ses pièces plus longtemps !"}
        </p>
      </main>

      {/* ---------- footer ---------- */}
      <footer className="relative z-10 mx-auto w-full max-w-md px-5 pb-6 pt-2">
        <motion.button
          type="button"
          onClick={game.cashOut}
          whileTap={isBusy ? undefined : { scale: 0.94 }}
          disabled={isBusy}
          className={`relative w-full rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-4 text-xl font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/30 transition-colors ${
            isBusy ? "cursor-not-allowed opacity-40" : "hover:shadow-indigo-500/50"
          }`}
        >
          Encaisser
          <span className="pointer-events-none absolute inset-0 rounded-3xl border border-white/40" />
        </motion.button>
      </footer>
    </div>
  );
}