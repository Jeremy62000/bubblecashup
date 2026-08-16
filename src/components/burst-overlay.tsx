import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import type { BurstEvent } from "@/hooks/use-bubble-game";

interface Particle {
  dx: number;
  dy: number;
  size: number;
  rotate: number;
  color: string;
  duration: number;
  delay: number;
}

const COIN_COLORS = ["#fbbf24", "#f59e0b", "#fde68a", "#60a5fa", "#ffffff"];
const GEM_COLORS = ["#e879f9", "#22d3ee", "#a78bfa", "#f0abfc", "#67e8f9"];
const POP_COLORS = ["#c4b5fd", "#93c5fd", "#ffffff", "#a5b4fc", "#f0abfc"];

function makeParticles(seed: number, kind: BurstEvent["kind"], big: boolean): Particle[] {
  const count = kind === "pop" ? (big ? 34 : 26) : big ? 30 : 18;
  const palette = kind === "coins" ? COIN_COLORS : kind === "gems" ? GEM_COLORS : POP_COLORS;
  const particles: Particle[] = [];
  let s = seed * 2654435761 % 4294967296;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.6;
    const dist = (kind === "pop" ? 90 + rand() * 110 : 70 + rand() * 150) * (document.body.clientWidth >= 420 ? 0.8 : 1);
    particles.push({
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 30,
      size: kind === "gems" ? 14 + rand() * 12 : 9 + rand() * 13,
      rotate: (rand() - 0.5) * 540,
      color: palette[Math.floor(rand() * palette.length)],
      duration: 0.7 + rand() * 0.5,
      delay: rand() * 0.12,
    });
  }
  return particles;
}

export function BurstOverlay({
  burst,
  onDone,
}: {
  burst: BurstEvent | null;
  onDone: () => void;
}) {
  const particles = useMemo(
    () => (burst ? makeParticles(burst.id, burst.kind, burst.big) : []),
    [burst],
  );

  useEffect(() => {
    if (!burst) return;
    const t = window.setTimeout(onDone, 1300);
    return () => window.clearTimeout(t);
  }, [burst, onDone]);

  return (
    <AnimatePresence>
      {burst && (
        <div
          key={burst.id}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden"
        >
          {particles.map((p, i) => (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{
                x: p.dx,
                y: p.dy,
                opacity: 0,
                scale: [0.4, 1.1, 0.75],
                rotate: p.rotate,
              }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
              className="absolute rounded-full shadow-sm"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: burst.kind === "gems" ? "35% 65% 55% 45% / 55% 40% 60% 45%" : "9999px",
              }}
            />
          ))}
          {burst.kind === "pop" && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute h-40 w-40 rounded-full border-4 border-violet-300/70"
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}