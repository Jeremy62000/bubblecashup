import { motion } from "framer-motion";
import { Coins, Gem, RotateCcw, Trophy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BottomNav } from "@/components/bottom-nav";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import { ACHIEVEMENTS } from "@/lib/challenges";
import * as engine from "@/lib/game-engine";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/15 bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300/60">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </GlassCard>
  );
}

export default function Achievements() {
  const game = useBubbleGame();
  const { save } = game;
  const unlockedCount = ACHIEVEMENTS.filter((a) => save.achievements.includes(a.id)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative min-h-dvh overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(130% 90% at 50% -12%, #4c1d95 0%, #2e1065 44%, #19063a 100%)",
      }}
    >
      <motion.span
        aria-hidden
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, -36, 22, 0], y: [0, 28, -18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-28 pt-5">
        <header className="flex flex-col gap-3">
          <h1 className="text-center text-2xl font-black tracking-tight">
            Succès<span className="text-amber-400">.</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-[#251052]/60 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md">
              <Coins className="h-3.5 w-3.5" />
              {engine.formatCoins(save.coins)}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-[#251052]/60 px-3 py-1.5 text-xs font-bold text-fuchsia-300 shadow-lg backdrop-blur-md">
              <Gem className="h-3.5 w-3.5" />
              {engine.formatCoins(save.gems)}
            </span>
          </div>
        </header>

        {/* ---------- stats ---------- */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Parties jouées" value={engine.formatCoins(save.runs)} />
          <StatCard label="Encaissements" value={engine.formatCoins(save.cashouts)} />
          <StatCard label="Explosions" value={engine.formatCoins(save.pops)} />
          <StatCard label="Plus grosse bulle" value={engine.formatCoins(save.bestBubble)} />
          <StatCard label="Pièces à vie" value={engine.formatCoins(save.lifetimeCoins)} />
          <StatCard label="Cristaux" value={engine.formatCoins(save.gems)} />
        </div>

        {/* ---------- paliers ---------- */}
        <h2 className="text-center text-sm font-extrabold uppercase tracking-widest text-violet-300/70">
          Paliers ({unlockedCount}/{ACHIEVEMENTS.length})
        </h2>
        <div className="flex flex-col gap-2.5">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = save.achievements.includes(a.id);
            const current = a.value(save);
            const pct = Math.min(100, (current / a.target) * 100);
            return (
              <GlassCard
                key={a.id}
                className={`p-3.5 ${unlocked ? "" : "opacity-80"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-lg ${
                      unlocked
                        ? "border-amber-300/40 bg-gradient-to-br from-amber-400 to-orange-500 text-[#22103f] shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                        : "border-white/10 bg-white/[0.06] text-violet-300/50"
                    }`}
                  >
                    <Trophy className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-extrabold ${unlocked ? "" : "text-violet-200/80"}`}>
                      {a.name}
                    </p>
                    <p className="truncate text-[11px] text-violet-300/60">{a.desc}</p>
                    {!unlocked && (
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-xl px-2 py-1 text-[11px] font-black ${
                      unlocked
                        ? "border border-amber-300/30 bg-amber-400/10 text-amber-300"
                        : "border border-white/10 bg-white/[0.04] text-violet-300/50"
                    }`}
                  >
                    +{a.reward} 💎
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ---------- reset ---------- */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Réinitialiser la progression
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl border border-white/15 bg-[#291157]/95 text-white backdrop-blur-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Tout recommencer à zéro ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-violet-300/70">
                Tes pièces, cristaux, upgrades, défis et succès seront définitivement
                effacés. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl border border-white/15 bg-white/10 text-white hover:bg-white/20">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={game.resetProgress}
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg"
              >
                Tout effacer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <BottomNav />
    </motion.div>
  );
}