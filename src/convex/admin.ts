import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";
import { DEFAULT_THEME } from "../lib/theme";

// ---------------------------------------------------------------------------
// Admin space: the first account that ever connects claims the admin role.
// Then it can manage custom quests and the global theme colors.
// ---------------------------------------------------------------------------

const themeValidator = v.object({
  bgA: v.string(),
  bgB: v.string(),
  bgC: v.string(),
  nav1: v.string(),
  nav2: v.string(),
  cta1: v.string(),
  cta2: v.string(),
  cta3: v.string(),
  bubbleA: v.string(),
  bubbleB: v.string(),
  bubbleC: v.string(),
});

/** First user ever to call this becomes the admin. */
export const maybeClaimAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return false;
    const user = await ctx.db.get(userId);
    if (user?.role === ROLES.ADMIN) return true;

    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .first();
    if (existingAdmin) return false;

    await ctx.db.patch(userId, { role: ROLES.ADMIN });
    return true;
  },
});

/** Public settings (used on every page incl. the landing). */
export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query("settings").first();
    return doc?.theme ?? DEFAULT_THEME;
  },
});

export const updateSettings = mutation({
  args: { theme: themeValidator },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) throw new Error("Admin only");

    const existing = await ctx.db.query("settings").first();
    const data = { theme: args.theme, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("settings", data);
    }
  },
});

export const resetSettings = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) throw new Error("Admin only");
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        theme: DEFAULT_THEME,
        updatedAt: Date.now(),
      });
    }
  },
});

// --- custom quests ----------------------------------------------------------

export const getQuests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("quests")
      .withIndex("by_active", (q) => q.eq("active", true))
      .order("desc")
      .take(50);
  },
});

/** All quests (for the admin management screen). */
export const getAllQuests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) return [];
    return await ctx.db.query("quests").order("desc").take(100);
  },
});

export const addQuest = mutation({
  args: {
    title: v.string(),
    emoji: v.string(),
    type: v.string(),
    target: v.number(),
    reward: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) throw new Error("Admin only");
    await ctx.db.insert("quests", {
      ...args,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const toggleQuest = mutation({
  args: { id: v.id("quests"), active: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) throw new Error("Admin only");
    await ctx.db.patch(args.id, { active: args.active });
  },
});

export const deleteQuest = mutation({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (user?.role !== ROLES.ADMIN) throw new Error("Admin only");
    await ctx.db.delete(args.id);
  },
});