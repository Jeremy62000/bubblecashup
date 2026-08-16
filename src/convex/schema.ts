import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // --- world leaderboard ---
    scores: defineTable({
      userId: v.string(), // convex auth subject
      name: v.string(), // displayed pseudo
      biggestBubble: v.number(),
      totalCoins: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_biggest", ["biggestBubble"])
      .index("by_total", ["totalCoins"]),

    // --- admin-defined custom quests ---
    quests: defineTable({
      title: v.string(),
      emoji: v.string(),
      type: v.string(), // same types as daily goals
      target: v.number(),
      reward: v.number(),
      active: v.boolean(),
      createdAt: v.number(),
    }).index("by_active", ["active"]),

    // --- global app settings (theme colors) ---
    settings: defineTable({
      theme: v.object({
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
      }),
      updatedAt: v.number(),
    }),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
