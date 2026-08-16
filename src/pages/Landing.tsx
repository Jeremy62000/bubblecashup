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
    text: "Bats ton record, décroche des bulles spéciales et collectionne des cristaux.",
  },
];

const FEATURES = [
  {
    icon: <Coins className="h-5 w-5 text-amber-400" />,
    title: "Bulle d'or ×3",
    text: "Une bulle dorée triple la valeur… mais le risque grimpe vite !",
    chip: "border-amber-300/25 bg-amber-400/10",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-fuchsia-400" />,
    title: "Bulle arc-en-ciel",
    text: "Encaisse-la pour gagner 1 à 3 cristaux à la place des pièces.",
    chip: "border-fuchsia-300/25 bg-fuchsia-400/10",
  },
  {
    icon: <Trophy className="h-5 w-5 text-violet-300" />,
    title: "Combo de risque",
    text: "Encaisser avec un risque très élevé ? Ta prochaine bulle rapporte plus.",
    chip: "border-violet-300/25 bg-violet-400/10",
  },
];

function GlassMark() {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-sky-400/90 via-violet-500/90 to-fuchsia-500/90 shadow-[0_0_24px_rgba(139,92,246,0.55)]">
      <span className="absolute left-[20%] top-[14%] h-[35%] w-[45%] -rotate-[24deg] rounded-full bg-white/80 blur-[2px]" />
    </span>
  );
}

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
          className="pointer-events-none absolute rounded-full border border-white/15 bg-white/[0.05] backdrop-blur-sm"
          style={{ left: b.left, top: b.top, width: b.size, height: b.size }}
        />
      )),
    [],
  );

  return (
    <div
      className="relative min-h-dvh overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(130% 90% at 50% -12%, #4c1d95 0%, #2e1065 44%, #19063a 100%)",
      }}
    >
      {decor}
      <motion.div
        aria-hidden
        animate={{ x: [0, 46, -18, 0], y: [0, -34, 18, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-violet-500/25 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -40, 24, 0], y: [0, 30, -22, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-32 top-2/3 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl"
      />

      {/* ---------- nav ---------- */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-5 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <GlassMark />
          <span className="text-lg font-extrabold tracking-tight">
            Bubble<span className="text-fuchsia-400">Up</span>
          </span>
        </Link>
        <Link
          to="/auth?returnTo=/play"
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20 active:scale-95"
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
            className="rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-fuchsia-200 backdrop-blur-md"
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
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Encaisse avant qu'elle explose !
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="max-w-md text-base text-violet-300/80 sm:text-lg"
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
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-8 py-4 text-lg font-black uppercase tracking-wide text-[#22103f] shadow-[0_12px_44px_rgba(244,114,182,0.5)] transition hover:shadow-[0_16px_54px_rgba(244,114,182,0.65)] active:scale-95"
            >
              Jouer maintenant
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth?returnTo=/play"
              className="rounded-full border border-white/15 bg-white/10 px-8 py-4 text-lg font-bold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/20 active:scale-95"
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
          className="relative w-full max-w-sm rounded-[2rem] border border-white/15 bg-white/[0.07] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Coins className="h-3.5 w-3.5" /> 128
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 px-3 py-1 text-xs font-bold text-fuchsia-300">
              <Gem className="h-3.5 w-3.5" /> 6
            </span>
          </div>

          <div className="relative flex h-52 items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-36 w-36 rounded-full border border-sky-200/50 shadow-[0_0_50px_rgba(34,211,238,0.45)]"
              style={{
                background:
                  "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.98) 0%, rgba(186,230,253,0.92) 30%, rgba(129,140,248,0.6) 68%, rgba(167,139,250,0.55) 100%)",
              }}
            >
              <span className="absolute left-[14%] top-[9%] h-[32%] w-[42%] -rotate-[24deg] rounded-full bg-white/80 blur-[3px]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: -34 }}
              transition={{ delay: 0.9, duration: 0.8, repeat: Infinity, repeatDelay: 1.6 }}
              className="absolute right-8 top-4 rounded-full bg-[#291157]/90 px-3 py-1 text-sm font-extrabold text-amber-300 shadow-lg"
            >
              +84 🪙
            </motion.span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-violet-300/60">
            <span>Risque</span>
            <span className="text-rose-400">71%</span>
          </div>
          <div className="mt-1.5 h-4 overflow-hidden rounded-full border border-white/15 bg-white/10 p-[3px] shadow-inner backdrop-blur-md">
            <div className="h-full w-[71%] rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" />
          </div>

          <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 py-3.5 text-base font-black uppercase tracking-[0.25em] text-[#22103f] shadow-[0_10px_36px_rgba(244,114,182,0.5)]">
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
                className="rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              >
                <span className="text-3xl">{s.emoji}</span>
                <h3 className="mt-3 text-base font-extrabold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-violet-300/75">{s.text}</p>
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
                className={`rounded-3xl border p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${f.chip}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-lg">
                  {f.icon}
                </span>
                <h3 className="mt-3 text-base font-extrabold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-violet-300/75">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="mt-6 w-full">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/[0.06] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-12">
            <Shield className="absolute -left-6 -top-6 h-32 w-32 opacity-10" />
            <h2 className="text-2xl font-black sm:text-3xl">
              Prêt à faire éclater ta bulle&nbsp;? 🫧
            </h2>
            <p className="mx-auto mt-2 max-w-md text-violet-300/75">
              Sans téléchargement, sans mot de passe — joue sur ton téléphone ou
              ton ordinateur, ta progression est sauvegardée.
            </p>
            <Link
              to="/auth?returnTo=/play"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-8 py-4 text-lg font-black uppercase tracking-wide text-[#22103f] shadow-[0_12px_44px_rgba(244,114,182,0.5)] transition hover:shadow-[0_16px_54px_rgba(244,114,182,0.65)] active:scale-95"
            >
              C'est parti
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-violet-300/50">
        Bubble Up · un jeu incrémental pour petits et grands
      </footer>
    </div>
  );
}