import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// World leaderboard: scores are upserted (merged with max) only when the
// player beats their own record client-side.
// ---------------------------------------------------------------------------

export const upsertScore = mutation({
  args: {
    name: v.string(),
    biggestBubble: v.number(),
    totalCoins: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const data = {
      userId,
      name: args.name,
      biggestBubble: Math.max(args.biggestBubble, existing?.biggestBubble ?? 0),
      totalCoins: Math.max(args.totalCoins, existing?.totalCoins ?? 0),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("scores", data);
    }
  },
});

export const leaderboardBiggest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_biggest", (q) => q.gt("biggestBubble", -1))
      .order("desc")
      .take(100);
  },
});

export const leaderboardTotal = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("scores")
      .withIndex("by_total", (q) => q.gt("totalCoins", -1))
      .order("desc")
      .take(100);
  },
});

/** Rank + score of the current player (null if they never synced). */
export const myRank = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const score = await ctx.db
      .query("scores")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!score) return null;

    const bigger = await ctx.db
      .query("scores")
      .withIndex("by_biggest", (q) => q.gt("biggestBubble", score.biggestBubble))
      .collect();
    const richer = await ctx.db
      .query("scores")
      .withIndex("by_total", (q) => q.gt("totalCoins", score.totalCoins))
      .collect();

    return {
      biggestRank: bigger.length + 1,
      totalRank: richer.length + 1,
      score,
    };
  },
});