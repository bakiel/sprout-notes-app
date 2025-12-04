import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    prepTime: v.optional(v.string()),
    cookTime: v.optional(v.string()),
    servings: v.optional(v.string()),
    nutritionalNotes: v.optional(v.array(v.string())),
    cookingTips: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"]),
});
