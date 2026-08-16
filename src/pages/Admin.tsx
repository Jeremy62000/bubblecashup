import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Coins,
  Gem,
  Lock,
  Palette,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import { DEFAULT_THEME, pageBgStyle, type ThemeColors } from "@/lib/theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const QUEST_TYPES = [
  { type: "cash_total", label: "Encaisser X pièces" },
  { type: "giant_bubble", label: "Bulle géante de X pièces" },
  { type: "combo", label: "Atteindre un combo ×X" },
  { type: "special", label: "Encaisser X bulles spéciales" },
  { type: "cashouts", label: "Encaisser X bulles" },
];

function toHex(color: string): string {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    const to = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${to(m[1])}${to(m[2])}${to(m[3])}`;
  }
  return color.startsWith("#") ? color : "#000000";
}

const COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string; swatch: string }> = [
  { key: "bgA", label: "Fond haut", swatch: "h-8 w-8 rounded-lg border border-white/20" },
  { key: "bgB", label: "Fond milieu", swatch: "h-8 w-8 rounded-lg border border-white/20" },
  { key: "bgC", label: "Fond bas", swatch: "h-8 w-8 rounded-lg border border-white/20" },
  { key: "nav1", label: "Menu dégradé 1", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "nav2", label: "Menu dégradé 2", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "cta1", label: "Bouton 1", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "cta2", label: "Bouton 2", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "cta3", label: "Bouton 3", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "bubbleA", label: "Bulle teinte claire", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "bubbleB", label: "Bulle teinte moyenne", swatch: "h-8 w-8 rounded-full border border-white/20" },
  { key: "bubbleC", label: "Bulle teinte profonde", swatch: "h-8 w-8 rounded-full border border-white/20" },
];

export default function Admin() {
  const { user } = useAuth();
  const game = useBubbleGame();
  const { save } = game;
  const isAdmin = user?.role === "admin";

  const settings = useQuery(api.admin.getSettings);
  const quests = useQuery(api.admin.getAllQuests);
  const addQuest = useMutation(api.admin.addQuest);
  const toggleQuest = useMutation(api.admin.toggleQuest);
  const deleteQuest = useMutation(api.admin.deleteQuest);
  const updateSettings = useMutation(api.admin.updateSettings);
  const resetSettings = useMutation(api.admin.resetSettings);

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🫧");
  const [type, setType] = useState("cash_total");
  const [target, setTarget] = useState("100");
  const [reward, setReward] = useState("3");
  const [colors, setColors] = useState<ThemeColors | null>(null);

  const currentColors = colors ?? settings ?? DEFAULT_THEME;

  const handleAddQuest = async () => {
    const t = Number(target);
    const r = Number(reward);
    if (!title.trim() || !Number.isFinite(t) || t <= 0 || !Number.isFinite(r) || r <= 0) return;
    await addQuest({ title: title.trim(), emoji, type, target: t, reward: r });
    setTitle("");
    setTarget("100");
    setReward("3");
  };

  const handleApplyColors = async () => {
    if (!colors) return;
    await updateSettings({ theme: colors });
  };

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white"
        style={pageBgStyle}
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/[0.06] text-4xl shadow-lg backdrop-blur-xl">
          🔒
        </span>
        <h1 className="mt-5 text-2xl font-black">Espace réservé à l'admin</h1>
        <p className="mt-2 max-w-xs text-sm text-violet-300/70">
          Le premier compte connecté devient automatiquement l'administrateur.
          Ce compte n'a pas encore les droits.
        </p>
        <BottomNav />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative min-h-dvh overflow-hidden text-white"
      style={pageBgStyle}
    >
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-28 pt-5">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          </div>
          <h1 className="text-center text-2xl font-black tracking-tight">
            Espace admin<span className="text-emerald-400">.</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-[#251052]/60 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-lg backdrop-blur-md">
              <Coins className="h-3.5 w-3.5" />
              {save.coins}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-[#251052]/60 px-3 py-1.5 text-xs font-bold text-fuchsia-300 shadow-lg backdrop-blur-md">
              <Gem className="h-3.5 w-3.5" />
              {save.gems}
            </span>
          </div>
        </header>

        <Tabs defaultValue="quests" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-white/15 bg-white/[0.06] p-1 backdrop-blur-xl">
            <TabsTrigger
              value="quests"
              className="flex items-center gap-1.5 rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(16,185,129,0.45)] data-[state=inactive]:text-violet-300/70"
            >
              <Sparkles className="h-3.5 w-3.5" /> Quêtes
            </TabsTrigger>
            <TabsTrigger
              value="colors"
              className="flex items-center gap-1.5 rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(16,185,129,0.45)] data-[state=inactive]:text-violet-300/70"
            >
              <Palette className="h-3.5 w-3.5" /> Couleurs
            </TabsTrigger>
          </TabsList>

          {/* ---------- quests ---------- */}
          <TabsContent value="quests" className="mt-4 flex flex-col gap-3">
            <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-4 shadow-lg backdrop-blur-xl">
              <p className="text-sm font-extrabold">➕ Nouvelle quête</p>
              <div className="mt-3 flex flex-col gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de la quête…"
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-violet-300/40"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  >
                    {QUEST_TYPES.map((q) => (
                      <option key={q.type} value={q.type} className="bg-[#291157]">
                        {q.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  >
                    {["🫧", "✨", "🪙", "⚡", "🎯", "💎", "🔥", "🌟", "🏆", "🌈"].map((e) => (
                      <option key={e} value={e} className="bg-[#291157]">
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    inputMode="numeric"
                    placeholder="Objectif"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-violet-300/40"
                  />
                  <input
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    inputMode="numeric"
                    placeholder="Récompense 💎"
                    className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-violet-300/40"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddQuest}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-black text-white shadow-lg active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Ajouter la quête
                </button>
              </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300/60">
              Quêtes ({quests?.length ?? 0})
            </p>
            <div className="flex flex-col gap-2">
              {quests === undefined ? (
                <div className="h-11 animate-pulse rounded-2xl bg-white/[0.06]" />
              ) : quests.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center text-xs text-violet-300/60">
                  Aucune quête pour l'instant.
                </p>
              ) : (
                quests.map((q) => (
                  <div
                    key={q._id}
                    className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 ${
                      q.active ? "border-white/15 bg-white/[0.06]" : "border-white/5 bg-white/[0.02] opacity-60"
                    }`}
                  >
                    <span className="text-xl">{q.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{q.title}</p>
                      <p className="text-[11px] text-violet-300/60">
                        cible {q.target} · +{q.reward} 💎 {q.active ? "" : "· désactivée"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleQuest({ id: q._id, active: !q.active })}
                      className={`rounded-xl px-2.5 py-1.5 text-[11px] font-black ${
                        q.active
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-white/10 text-violet-300/60"
                      }`}
                    >
                      {q.active ? "Active" : "Inactive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuest({ id: q._id })}
                      className="rounded-xl bg-rose-500/15 p-2 text-rose-300 active:scale-95"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <p className="flex items-center gap-1.5 px-1 text-[11px] text-violet-300/60">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Les quêtes actives s'affichent dans l'onglet Défis pour tous les joueurs.
            </p>
          </TabsContent>

          {/* ---------- colors ---------- */}
          <TabsContent value="colors" className="mt-4 flex flex-col gap-3">
            <div className="rounded-3xl border border-white/15 bg-white/[0.06] p-4 shadow-lg backdrop-blur-xl">
              <p className="text-sm font-extrabold">🎨 Couleurs de l'app</p>
              <p className="mt-1 text-[11px] text-violet-300/60">
                Fond, menus, boutons et bulle — appliquées à tout le monde en direct.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {COLOR_FIELDS.map((f) => (
                  <label key={f.key} className="flex items-center gap-2.5">
                    <span
                      className={`${f.swatch} shrink-0`}
                      style={{ backgroundColor: currentColors[f.key] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-bold text-violet-200/80">
                      {f.label}
                    </span>
                    <input
                      type="color"
                      value={toHex(currentColors[f.key])}
                      onChange={(e) =>
                        setColors({ ...(colors ?? (settings ?? DEFAULT_THEME)), [f.key]: e.target.value })
                      }
                      className="h-8 w-9 cursor-pointer rounded-lg border border-white/15 bg-transparent"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleApplyColors}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-black text-white shadow-lg active:scale-95"
                >
                  Appliquer les couleurs
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await resetSettings();
                    setColors(null);
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  Défaut
                </button>
              </div>
            </div>
            <p className="flex items-center gap-1.5 px-1 text-[11px] text-violet-300/60">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              Les valeurs sont stockées dans Convex et appliquées sur toutes les pages.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </motion.div>
  );
}