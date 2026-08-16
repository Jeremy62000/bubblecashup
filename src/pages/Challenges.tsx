import { AnimatePresence, motion } from "framer-motion";
import { Coins, Flame, Gem } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import {
  DAILY_BONUS_GEMS,
  goalEmoji,
  goalLabel,
  progressOf,
  streakReward,
} from "@/lib/challenges";
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

export default function Challenges() {
  const game = useBubbleGame();
  const { save, daily } = game;
  const todayReward = streakReward(daily.streak);
  const tomorrowReward = streakReward(daily.streak + 1);
  const allDone = daily.goals.every((g) => progressOf(daily, g).complete);
  const bonusAvailable = allDone && !daily.bonusClaimed;

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
        className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl"
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, -36, 22, 0], y: [0, 28, -18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-28 pt-5">
        <header className="flex flex-col gap-3">
          <h1 className="text-center text-2xl font-black tracking-tight">
            Défis<span className="text-orange-400">.</span>
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

        {/* ---------- streak ---------- */}
        <GlassCard className="relative overflow-hidden p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/20 blur-3xl"
          />
          <div className="flex items-center gap-4">
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-300/30 bg-orange-500/15 text-3xl shadow-[0_0_24px_rgba(249,115,22,0.35)]"
            >
              <Flame className="h-8 w-8 text-orange-400" />
            </motion.span>
            <div className="flex-1">
              <p className="text-lg font-black">
                Streak de {daily.streak} jour{daily.streak > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-violet-300/70">
                Reviens chaque jour pour faire grandir la flamme !
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex gap-2 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-violet-300/60">
                  Aujourd'hui
                </p>
                <p className="text-sm font-black text-amber-300">+{todayReward} 💎</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-violet-300/60">
                  Demain
                </p>
                <p className="text-sm font-black text-violet-200">+{tomorrowReward} 💎</p>
              </div>
            </div>
            <button
              type="button"
              disabled={daily.streakClaimed}
              onClick={game.claimStreak}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-black transition-all active:scale-95 ${
                daily.streakClaimed
                  ? "cursor-default border border-white/10 bg-white/[0.04] text-violet-300/40"
                  : "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_6px_24px_rgba(249,115,22,0.45)] hover:shadow-[0_6px_30px_rgba(249,115,22,0.6)]"
              }`}
            >
              {daily.streakClaimed ? "Réclamé ✓" : "Réclamer"}
            </button>
          </div>
        </GlassCard>

        {/* ---------- daily goals ---------- */}
        <div className="flex flex-col gap-3">
          {daily.goals.map((g) => {
            const { current, complete } = progressOf(daily, g);
            const claimed = daily.claimed.includes(g.id);
            const pct = Math.min(100, (current / g.target) * 100);
            return (
              <GlassCard key={g.id} className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl shadow-lg">
                    {goalEmoji(g)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{goalLabel(g)}</p>
                    <p className="text-[11px] text-violet-300/70">
                      {complete
                        ? "Objectif atteint !"
                        : `${Math.floor(current)} / ${g.target}`}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          complete
                            ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                            : "bg-gradient-to-r from-violet-400 to-fuchsia-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {claimed ? (
                    <span className="shrink-0 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
                      ✓ {g.reward} 💎
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={!complete}
                      onClick={() => game.claimDailyGoal(g.id)}
                      className={`shrink-0 rounded-2xl px-3 py-2.5 text-xs font-black transition-all active:scale-95 ${
                        complete
                          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_6px_24px_rgba(168,85,247,0.45)]"
                          : "cursor-not-allowed bg-white/10 text-violet-300/40"
                      }`}
                    >
                      +{g.reward} 💎
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ---------- all-3 bonus ---------- */}
        <AnimatePresence>
          {bonusAvailable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-amber-300/30 bg-amber-400/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-amber-200">
                    Les 3 défis sont réussis !
                  </p>
                  <p className="text-[11px] text-violet-300/70">
                    Bonus de la journée : +{DAILY_BONUS_GEMS} 💎
                  </p>
                </div>
                <button
                  type="button"
                  onClick={game.claimDailyBonus}
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-4 py-2.5 text-xs font-black text-[#22103f] shadow-[0_6px_24px_rgba(244,114,182,0.45)] transition-all active:scale-95"
                >
                  Réclamer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[11px] text-violet-300/50">
          De nouveaux défis arrivent chaque jour à minuit ✨
        </p>
      </div>

      <BottomNav />
    </motion.div>
  );
}