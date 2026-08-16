import { AnimatePresence, motion } from "framer-motion";
import { Coins, Gem, Lock, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import * as engine from "@/lib/game-engine";
import {
  PASSIVES,
  SKINS,
  TEMP_BOOSTERS,
  upgradePrice,
  UPGRADES,
  type TempBoosterId,
} from "@/lib/shop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ctaStyle, pageBgStyle } from "@/lib/theme";

function GlassRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      {children}
    </div>
  );
}

function NeonButton({
  children,
  disabled,
  onClick,
  tone = "primary",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  tone?: "primary" | "buy" | "soft";
}) {
  const styles = {
    primary:
      disabled
        ? "cursor-not-allowed bg-white/10 text-violet-300/40"
        : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_6px_24px_rgba(168,85,247,0.45)] hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)]",
    buy:
      disabled
        ? "cursor-not-allowed bg-white/10 text-violet-300/40"
        : "text-[#22103f] shadow-[0_6px_24px_rgba(244,114,182,0.35)] hover:shadow-[0_6px_30px_rgba(244,114,182,0.5)]",
    soft:
      disabled
        ? "cursor-not-allowed bg-white/10 text-violet-300/40"
        : "border border-white/20 bg-white/10 text-white hover:bg-white/20",
  }[tone];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={tone === "buy" && !disabled ? ctaStyle : undefined}
      className={`rounded-2xl px-3.5 py-2.5 text-xs font-black transition-all active:scale-95 ${styles}`.trim()}
    >
      {children}
    </button>
  );
}

export default function Shop() {
  const game = useBubbleGame();
  const { save, offlineClaim } = game;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative min-h-dvh overflow-hidden text-white"
      style={pageBgStyle}
    >
      <motion.span
        aria-hidden
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, -36, 22, 0], y: [0, 28, -18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-28 pt-5">
        {/* ---------- header ---------- */}
        <header className="flex flex-col gap-3">
          <h1 className="text-center text-2xl font-black tracking-tight">
            Boutique<span className="text-fuchsia-400">.</span>
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

        {/* ---------- prestige teaser ---------- */}
        <div className="flex items-center gap-3 rounded-3xl border border-dashed border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 backdrop-blur-md">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-fuchsia-300/30 bg-white/10 text-lg shadow-lg">
            🌟
          </span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-fuchsia-200">Prestige — bientôt</p>
            <p className="text-xs text-violet-300/70">
              Repars de zéro pour gagner des éclats et débloquer des bulles multiples.
            </p>
          </div>
          <Lock className="h-4 w-4 text-fuchsia-300/50" />
        </div>

        {/* ---------- tabs ---------- */}
        <Tabs defaultValue="permanents" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-4 gap-1 rounded-2xl border border-white/15 bg-white/[0.06] p-1 backdrop-blur-xl">
            <TabsTrigger
              value="permanents"
              className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(168,85,247,0.5)] data-[state=inactive]:text-violet-300/70"
            >
              Boosts
            </TabsTrigger>
            <TabsTrigger
              value="boosters"
              className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(168,85,247,0.5)] data-[state=inactive]:text-violet-300/70"
            >
              Jetons
            </TabsTrigger>
            <TabsTrigger
              value="skins"
              className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(168,85,247,0.5)] data-[state=inactive]:text-violet-300/70"
            >
              Skins
            </TabsTrigger>
            <TabsTrigger
              value="passifs"
              className="rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(168,85,247,0.5)] data-[state=inactive]:text-violet-300/70"
            >
              Machines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permanents" className="mt-4 flex flex-col gap-3">
            {UPGRADES.map((u) => {
              const level = save.upgrades[u.id];
              const maxed = level >= u.maxLevel;
              const price = upgradePrice(u, level);
              const can = save.coins >= price;
              const pct = Math.min(100, (level / u.maxLevel) * 100);
              return (
                <GlassRow key={u.id}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl shadow-lg">
                      {u.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-extrabold">{u.name}</p>
                        <p className="text-xs font-bold text-violet-300/70">Nv. {level}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-violet-300/70">{u.desc}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                          style={{ width: `${maxed ? 100 : pct}%` }}
                        />
                      </div>
                    </div>
                    <NeonButton
                      tone={maxed ? "soft" : "primary"}
                      disabled={!maxed && !can}
                      onClick={() => game.buyUpgrade(u.id)}
                    >
                      {maxed ? "MAX" : `${engine.formatCoins(price)} 🪙`}
                    </NeonButton>
                  </div>
                </GlassRow>
              );
            })}
          </TabsContent>

          <TabsContent value="boosters" className="mt-4 grid grid-cols-2 gap-3">
            {TEMP_BOOSTERS.map((b) => {
              const stock = save.boosters[b.id as TempBoosterId];
              const can = save.coins >= b.price;
              return (
                <GlassRow key={b.id}>
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{b.emoji}</span>
                      <span className="rounded-full bg-fuchsia-500/25 px-2 py-0.5 text-[10px] font-bold text-fuchsia-200">
                        ×{stock}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-extrabold leading-tight">{b.name}</p>
                    <p className="mt-1 flex-1 text-[11px] leading-snug text-violet-300/70">
                      {b.desc}
                    </p>
                    <NeonButton
                      tone="buy"
                      disabled={!can}
                      onClick={() => game.buyBooster(b.id as TempBoosterId)}
                    >
                      {engine.formatCoins(b.price)} 🪙
                    </NeonButton>
                  </div>
                </GlassRow>
              );
            })}
          </TabsContent>

          <TabsContent value="skins" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SKINS.map((s) => {
              const owned = save.skins.includes(s.id);
              const equipped = save.skin === s.id;
              const can = save.gems >= s.gems;
              return (
                <GlassRow key={s.id}>
                  <div className="flex flex-col items-center text-center">
                    <span
                      className="h-16 w-16 rounded-full border-2 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
                      style={{
                        background: s.gradient,
                        borderColor: equipped
                          ? "#e879f9"
                          : "rgba(255,255,255,0.25)",
                      }}
                    />
                    <p className="mt-2 text-xs font-extrabold">{s.name}</p>
                    <NeonButton
                      tone={equipped ? "soft" : can ? "primary" : "soft"}
                      disabled={equipped || (!owned && !can)}
                      onClick={() => game.buySkin(s.id)}
                    >
                      {equipped
                        ? "Équipé ✓"
                        : owned
                          ? "Équiper"
                          : `${s.gems} 💎`}
                    </NeonButton>
                  </div>
                </GlassRow>
              );
            })}
          </TabsContent>

          <TabsContent value="passifs" className="mt-4 flex flex-col gap-3">
            {PASSIVES.map((p) => {
              const owned = save.passives[p.id];
              const unlocked = save.runs >= p.unlockRuns;
              const can = save.coins >= p.price;
              const progress = Math.min(100, (save.runs / p.unlockRuns) * 100);
              return (
                <GlassRow key={p.id}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl shadow-lg">
                      {p.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-extrabold">{p.name}</p>
                        {owned ? (
                          <p className="text-[11px] font-bold text-emerald-300">
                            ⚙️ {p.ratePerMinute}/min
                          </p>
                        ) : (
                          <p className="text-[11px] font-bold text-violet-300/50">
                            🔒 {p.unlockRuns} parties
                          </p>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-violet-300/70">{p.desc}</p>
                      {!unlocked && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <NeonButton
                      tone={owned ? "soft" : "primary"}
                      disabled={owned || !unlocked || !can}
                      onClick={() => game.buyPassive(p.id)}
                    >
                      {owned ? "Possédée ✓" : `${engine.formatCoins(p.price)} 🪙`}
                    </NeonButton>
                  </div>
                </GlassRow>
              );
            })}
            <p className="flex items-center gap-1.5 px-1 text-[11px] text-violet-300/60">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
              Tes machines produisent des pièces même hors-ligne (jusqu'à 8 h).
            </p>
          </TabsContent>
        </Tabs>

        {/* ---------- offline earnings ---------- */}
        <AnimatePresence>
          {offlineClaim && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-x-4 bottom-32 z-50 mx-auto max-w-md rounded-3xl border border-white/15 bg-[#291157]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl"
            >
              <p className="text-sm font-bold text-white">
                Bienvenue ! 🎉 Pendant tes {offlineClaim.minutes} min d'absence,
                tes machines ont fabriqué&nbsp;:
              </p>
              <p className="mt-1 text-2xl font-black text-amber-400">
                {engine.formatCoins(offlineClaim.coins)} 🪙
              </p>
              <button
                type="button"
                onClick={game.claimOffline}
                style={ctaStyle}
                className="mt-3 w-full rounded-2xl py-3 text-base font-black uppercase tracking-widest text-[#22103f] shadow-lg active:scale-95"
              >
                Récupérer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </motion.div>
  );
}