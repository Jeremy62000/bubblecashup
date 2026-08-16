import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Coins, Crown, Gem, Medal, RefreshCw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useBubbleGame } from "@/hooks/use-bubble-game";
import * as engine from "@/lib/game-engine";
import { pageBgStyle } from "@/lib/theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScoreRow {
  _id: string;
  userId: string;
  name: string;
  biggestBubble: number;
  totalCoins: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({
  rank,
  name,
  value,
  isMe,
}: {
  rank: number;
  name: string;
  value: number;
  isMe: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 ${
        isMe
          ? "border-fuchsia-300/40 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 shadow-[0_0_20px_rgba(217,70,239,0.15)]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <span className="w-8 shrink-0 text-center text-sm font-black tabular-nums text-violet-300/80">
        {rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">
        {name}
        {isMe && (
          <span className="ml-2 rounded-full bg-fuchsia-500/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-fuchsia-200">
            toi
          </span>
        )}
      </span>
      <span className="shrink-0 text-sm font-black tabular-nums text-amber-300">
        {engine.formatCoins(value)}
      </span>
    </div>
  );
}

export default function Leaderboard() {
  const game = useBubbleGame();
  const { save } = game;
  const [, setTick] = useState(0);

  const biggest = useQuery(api.leaderboard.leaderboardBiggest);
  const total = useQuery(api.leaderboard.leaderboardTotal);
  const myRank = useQuery(api.leaderboard.myRank);

  // periodic refresh (re-subscribes the queries)
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const meId = myRank?.score.userId;

  const renderList = (
    rows: ScoreRow[] | undefined,
    pick: (r: ScoreRow) => number,
  ) => {
    if (rows === undefined) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-2xl bg-white/[0.06]" />
          ))}
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-3xl">🫧</p>
          <p className="mt-2 text-sm font-bold text-violet-200">
            Personne n'a encore joué !
          </p>
          <p className="text-xs text-violet-300/60">
            Bat ton record pour apparaître ici.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <Row
            key={r._id}
            rank={i + 1}
            name={r.name}
            value={pick(r)}
            isMe={r.userId === meId}
          />
        ))}
      </div>
    );
  };

  const notInTop100Biggest =
    biggest !== undefined &&
    myRank !== null &&
    myRank !== undefined &&
    myRank.biggestRank > 100 &&
    meId !== undefined &&
    !biggest.some((r) => r.userId === meId);
  const notInTop100Total =
    total !== undefined &&
    myRank !== null &&
    myRank !== undefined &&
    myRank.totalRank > 100 &&
    meId !== undefined &&
    !total.some((r) => r.userId === meId);

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
        className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl"
      />
      <motion.span
        aria-hidden
        animate={{ x: [0, -36, 22, 0], y: [0, 28, -18, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 pb-28 pt-5">
        <header className="flex flex-col gap-3">
          <h1 className="text-center text-2xl font-black tracking-tight">
            Top<span className="text-cyan-300">.</span>
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

        {/* my podium line */}
        {myRank && (
          <div className="flex items-center gap-2 rounded-3xl border border-white/15 bg-white/[0.06] px-4 py-2.5 shadow-lg backdrop-blur-xl">
            <Crown className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="min-w-0 flex-1 truncate text-xs text-violet-200/80">
              {save.pseudo} · bulle{" "}
              <b className="text-white">
                {engine.formatCoins(myRank.score.biggestBubble)}
              </b>
            </p>
            <p className="shrink-0 text-xs font-black text-amber-300">
              #{myRank.biggestRank}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300/60">
            Top 100 mondial
          </p>
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/20 active:scale-95"
          >
            <RefreshCw className="h-3 w-3" />
            Rafraîchir
          </button>
        </div>

        <Tabs defaultValue="biggest" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-white/15 bg-white/[0.06] p-1 backdrop-blur-xl">
            <TabsTrigger
              value="biggest"
              className="flex items-center gap-1.5 rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(168,85,247,0.5)] data-[state=inactive]:text-violet-300/70"
            >
              <Trophy className="h-3.5 w-3.5" /> Plus grosse bulle
            </TabsTrigger>
            <TabsTrigger
              value="total"
              className="flex items-center gap-1.5 rounded-xl py-2 text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-[0_4px_18px_rgba(168,85,247,0.5)] data-[state=inactive]:text-violet-300/70"
            >
              <Medal className="h-3.5 w-3.5" /> Total pièces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biggest" className="mt-3">
            {renderList(biggest, (r) => r.biggestBubble)}
            {notInTop100Biggest && myRank && (
              <p className="mt-3 text-center text-xs text-violet-300/60">
                Ton rang réel : <b className="text-white">#{myRank.biggestRank}</b>
              </p>
            )}
          </TabsContent>
          <TabsContent value="total" className="mt-3">
            {renderList(total, (r) => r.totalCoins)}
            {notInTop100Total && myRank && (
              <p className="mt-3 text-center text-xs text-violet-300/60">
                Ton rang réel : <b className="text-white">#{myRank.totalRank}</b>
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </motion.div>
  );
}