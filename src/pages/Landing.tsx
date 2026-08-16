import { motion } from "framer-motion";
import { ArrowRight, Coins, Gem, LogIn, Shield, Sparkles, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

const FLOATING = [
  { left: "4%", top: "18%", size: 64, delay: 0 },
  { left: "90%", top: "12%", size: 44, delay: 0.9 },
  { left: "8%", top: "70%", size: 40, delay: 1.5 },
  { left: "88%", top: "64%", size: 70, delay: 0.4 },
  { left: "16%", top: "42%", size: 26, delay: 2 },
  { left: "80%", top: "38%", size: 32, delay: 1.2 },
];

const STEPS = [
  {
    emoji: "🫧",
    title: "1 · Fais gonfler ta bulle",
    text: "Elle grossit toute seule et gagne de la valeur à chaque seconde.",
  },
  {
    emoji: "⏱️",
    title: "2 · Encaisse à temps",
    text: "Le risque monte… appuie sur ENCAISSER pour garder tes pièces avant l'explosion.",
  },
  {
    emoji: "🎉",
    title: "3 · Recommence plus fort",
    text: "Batte ton record, décroche des bulles spéciales et collectionne des cristaux.",
  },
];

const FEATURES = [
  {
    icon: <Coins className="h-5 w-5 text-amber-500" />,
    title: "Bulle d'or ×3",
    text: "Une bulle dorée triple la valeur… mais le risque grimpe vite !",
    chip: "border-amber-200/80 bg-amber-50/60",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-fuchsia-500" />,
    title: "Bulle arc-en-ciel",
    text: "Encaisse-la pour gagner 1 à 3 cristaux à la place des pièces.",
    chip: "border-fuchsia-200/80 bg-fuchsia-50/60",
  },
  {
    icon: <Trophy className="h-5 w-5 text-indigo-500" />,
    title: "Combo de risque",
    text: "Encaisser avec un risque très élevé ? Ta prochaine bulle rapporte plus.",
    chip: "border-indigo-200/80 bg-indigo-50/60",
  },
];

export default function Landing() {
  const decor = useMemo(
    () =>
      FLOATING.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0], x: [0, i % 2 ? 8 : -8, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
          className="pointer-events-none absolute rounded-full border border-white/60 bg-white/30 shadow-inner backdrop-blur-sm"
          style={{ left: b.left, top: b.top, width: b.size, height: b.size }}
        />
      )),
    [],
  );

  return (
    <div
      className="relative min-h-dvh overflow-hidden text-slate-800"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, #dbeafe 0%, #ede9fe 45%, #fae8ff 100%)",
      }}
    >
      {decor}
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-2/3 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl" />

      {/* ---------- nav ---------- */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <GlassMark />
          <span className="text-lg font-extrabold tracking-tight">
            Bubble<span className="text-indigo-500">Up</span>
          </span>
        </Link>
        <Link
          to="/auth?returnTo=/play"
          className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur-xl transition hover:bg-white/90 active:scale-95"
        >
          <LogIn className="h-4 w-4" />
          Se connecter
        </Link>
      </header>

      {/* ---------- hero ---------- */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-5 pb-16 pt-6 sm:pt-14">
        <div className="flex max-w-2xl flex-col items-center gap-5 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-full border border-indigo-200/70 bg-indigo-50/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 backdrop-blur-md"
          >
            🫧 Fais gonfler · Encaisse · Recommence
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl"
          >
            Ta bulle grandit.
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-400 bg-clip-text text-transparent">
              Encaisse avant qu'elle explose !
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="max-w-md text-base text-slate-600 sm:text-lg"
          >
            Un jeu incrémental tout doux : la bulle gonfle, gagne des pièces…
            et le risque monte. Clique à temps pour garder ton trésor !
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              to="/auth?returnTo=/play"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-black uppercase tracking-wide text-white shadow-xl shadow-indigo-500/30 transition hover:shadow-indigo-500/50 active:scale-95"
            >
              Jouer maintenant
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth?returnTo=/play"
              className="rounded-full border border-white/70 bg-white/60 px-8 py-4 text-lg font-bold text-indigo-600 shadow-sm backdrop-blur-xl transition hover:bg-white/90 active:scale-95"
            >
              Essayer sans compte
            </Link>
          </motion.div>
        </div>

        {/* ---------- game preview card ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/50 p-6 shadow-xl shadow-indigo-900/10 backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-bold text-amber-700">
              <Coins className="h-3.5 w-3.5" /> 128
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-fuchsia-200/80 bg-fuchsia-50/70 px-3 py-1 text-xs font-bold text-fuchsia-700">
              💎 6
            </span>
          </div>

          <div className="relative flex h-52 items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-36 w-36 rounded-full border border-sky-200/90"
              style={{
                background:
                  "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(186,230,253,0.92) 30%, rgba(129,140,248,0.55) 68%, rgba(167,139,250,0.5) 100%)",
                boxShadow:
                  "0 18px 50px -12px rgba(79,70,229,0.45), inset 0 -12px 28px rgba(255,255,255,0.35)",
              }}
            >
              <span className="absolute left-[14%] top-[9%] h-[32%] w-[42%] -rotate-[24deg] rounded-full bg-white/80 blur-[3px]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: -34 }}
              transition={{ delay: 0.9, duration: 0.8, repeat: Infinity, repeatDelay: 1.6 }}
              className="absolute right-8 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-amber-600 shadow-md"
            >
              +84 🪙
            </motion.span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Risque</span>
            <span className="text-rose-500">71%</span>
          </div>
          <div className="mt-1.5 h-4 overflow-hidden rounded-full border border-white/70 bg-white/60 p-[3px] shadow-inner">
            <div className="h-full w-[71%] rounded-full bg-gradient-to-r from-violet-400 to-rose-400" />
          </div>

          <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-3.5 text-base font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-indigo-500/30">
            Encaisser
          </div>
        </motion.div>

        {/* ---------- how to play ---------- */}
        <section className="mt-4 w-full">
          <h2 className="mb-6 text-center text-2xl font-extrabold sm:text-3xl">
            Comment jouer&nbsp;?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-3xl border border-white/70 bg-white/55 p-6 shadow-lg shadow-indigo-900/5 backdrop-blur-xl"
              >
                <span className="text-3xl">{s.emoji}</span>
                <h3 className="mt-3 text-base font-extrabold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------- features ---------- */}
        <section className="w-full">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`rounded-3xl border p-5 shadow-lg shadow-indigo-900/5 backdrop-blur-xl ${f.chip}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/70 shadow-sm">
                  {f.icon}
                </span>
                <h3 className="mt-3 text-base font-extrabold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="mt-6 w-full">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/50 p-8 text-center shadow-xl shadow-indigo-900/10 backdrop-blur-2xl sm:p-12">
            <Shield className="absolute -left-6 -top-6 h-32 w-32 opacity-10" />
            <h2 className="text-2xl font-black sm:text-3xl">
              Prêt à faire éclater ta bulle&nbsp;? 🫧
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Sans téléchargement, sans mot de passe — joue sur ton téléphone ou ton
              ordinateur, ta progression est sauvegardée.
            </p>
            <Link
              to="/auth?returnTo=/play"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-black uppercase tracking-wide text-white shadow-xl shadow-indigo-500/30 transition hover:shadow-indigo-500/50 active:scale-95"
            >
              C'est parti
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/50 py-6 text-center text-xs text-slate-500">
        Bubble Up · un jeu incrémental pour petits et grands 🫧
      </footer>
    </div>
  );
}

function GlassMark() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-indigo-300 to-fuchsia-300 shadow-md shadow-indigo-300/50">
      <span className="absolute left-[20%] top-[14%] h-[35%] w-[45%] -rotate-[24deg] rounded-full bg-white/80 blur-[2px]" />
    </span>
  );
}