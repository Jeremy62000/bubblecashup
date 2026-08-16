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

function GlassRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/55 p-4 shadow-lg shadow-indigo-900/5 backdrop-blur-xl">
      {children}
    </div>
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
      className="relative min-h-dvh overflow-hidden text-slate-800"
      style={{
        background: "radial-gradient(120% 80% at 50% -10%, #dbeafe 0%, #ede9fe 45%, #fae8ff 100%)",
      }}
    >
      <motion.span
        aria-hidden
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl"
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, -36, 22, 0], y: [0, 28, -18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-28 pt-5">
        {/* ---------- header ---------- */}
        <header className="flex flex-col gap-3">
          <h1 className="text-center text-2xl font-black tracking-tight">
            Boutique<span className="text-indigo-500">.</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm backdrop-blur-md">
              <Coins className="h-3.5 w-3.5" />
              {engine.formatCoins(save.coins)}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-fuchsia-200/80 bg-fuchsia-50/80 px-2.5 py-1 text-xs font-bold text-fuchsia-700 shadow-sm backdrop-blur-md">
              <Gem className="h-3.5 w-3.5" />
              {engine.formatCoins(save.gems)}
            </span>
          </div>
        </header>

        <BottomNav />

        {/* ---------- prestige teaser ---------- */}
        <div className="flex items-center gap-3 rounded-3xl border border-dashed border-indigo-300/70 bg-indigo-50/50 px-4 py-3 backdrop-blur-md">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-200/80 bg-white/70 text-lg shadow-sm">
            🌟
          </span>
          <div className="flex-1">
            <p className="text-sm font-extrabold text-indigo-700">Prestige — bientôt</p>
            <p className="text-xs text-slate-500">
              Repars de zéro pour gagner des éclats et débloquer des bulles multiples.
            </p>
          </div>
          <Lock className="h-4 w-4 text-indigo-300" />
        </div>

        {/* ---------- tabs ---------- */}
        <Tabs defaultValue="permanents" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl border border-white/70 bg-white/50 backdrop-blur-xl">
            <TabsTrigger value="permanents" className="rounded-xl text-xs font-bold">
              Boosts
            </TabsTrigger>
            <TabsTrigger value="boosters" className="rounded-xl text-xs font-bold">
              Jetons
            </TabsTrigger>
            <TabsTrigger value="skins" className="rounded-xl text-xs font-bold">
              Skins
            </TabsTrigger>
            <TabsTrigger value="passifs" className="rounded-xl text-xs font-bold">
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
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-2xl shadow-sm">
                      {u.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-extrabold">{u.name}</p>
                        <p className="text-xs font-bold text-slate-500">Nv. {level}</p>
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">{u.desc}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
                          style={{ width: `${maxed ? 100 : pct}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={maxed || !can}
                      onClick={() => game.buyUpgrade(u.id)}
                      className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-xs font-black ${
                        maxed
                          ? "cursor-default border border-emerald-200/70 bg-emerald-50/70 text-emerald-600"
                          : can
                            ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30 active:scale-95"
                            : "cursor-not-allowed border border-white/70 bg-white/50 text-slate-400"
                      }`}
                    >
                      {maxed ? "MAX" : `${engine.formatCoins(price)} 🪙`}
                    </button>
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
                <GlassRow key={b.id} >
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{b.emoji}</span>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                        ×{stock}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-extrabold leading-tight">{b.name}</p>
                    <p className="mt-1 flex-1 text-[11px] leading-snug text-slate-500">
                      {b.desc}
                    </p>
                    <button
                      type="button"
                      disabled={!can}
                      onClick={() => game.buyBooster(b.id as TempBoosterId)}
                      className={`mt-3 w-full rounded-2xl py-2.5 text-xs font-black ${
                        can
                          ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30 active:scale-95"
                          : "cursor-not-allowed bg-white/50 text-slate-400"
                      }`}
                    >
                      {engine.formatCoins(b.price)} 🪙
                    </button>
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
                      className="h-16 w-16 rounded-full border-2 shadow-md"
                      style={{
                        background: s.gradient,
                        borderColor: equipped ? "#818cf8" : "rgba(255,255,255,0.8)",
                      }}
                    />
                    <p className="mt-2 text-xs font-extrabold">{s.name}</p>
                    <button
                      type="button"
                      disabled={equipped}
                      onClick={() => game.buySkin(s.id)}
                      className={`mt-2 w-full rounded-2xl py-2 text-[11px] font-black ${
                        equipped
                          ? "cursor-default border border-indigo-200/70 bg-indigo-50/70 text-indigo-600"
                          : owned
                            ? "border border-white/70 bg-white/70 text-indigo-600 active:scale-95"
                            : can
                              ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white shadow-md shadow-fuchsia-500/30 active:scale-95"
                              : "cursor-not-allowed bg-white/50 text-slate-400"
                      }`}
                    >
                      {equipped
                        ? "Équipé ✓"
                        : owned
                          ? "Équiper"
                          : `${s.gems} 💎`}
                    </button>
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
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-2xl shadow-sm">
                      {p.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-extrabold">{p.name}</p>
                        {owned ? (
                          <p className="text-[11px] font-bold text-emerald-600">
                            ⚙️ {p.ratePerMinute}/min
                          </p>
                        ) : (
                          <p className="text-[11px] font-bold text-slate-400">
                            🔒 {p.unlockRuns} parties
                          </p>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">{p.desc}</p>
                      {!unlocked && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={owned || !unlocked || !can}
                      onClick={() => game.buyPassive(p.id)}
                      className={`shrink-0 rounded-2xl px-3.5 py-2.5 text-xs font-black ${
                        owned
                          ? "cursor-default border border-emerald-200/70 bg-emerald-50/70 text-emerald-600"
                          : unlocked && can
                            ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30 active:scale-95"
                            : "cursor-not-allowed bg-white/50 text-slate-400"
                      }`}
                    >
                      {owned ? "Possédée ✓" : `${engine.formatCoins(p.price)} 🪙`}
                    </button>
                  </div>
                </GlassRow>
              );
            })}
            <p className="flex items-center gap-1.5 px-1 text-[11px] text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
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
      </div>
    </motion.div>
  );
}