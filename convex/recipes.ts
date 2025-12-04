import { v } from "convex/values";
import { query, mutation} from "./_generated/server";

// Query to get all recipes
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

// Query to get a single recipe by ID
export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation to save a recipe
export const save = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const recipeId = await ctx.db.insert("recipes", {
      ...args,
      createdAt: Date.now(),
    });
    return recipeId;
  },
});

// Mutation to update a recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    instructions: v.optional(v.array(v.string())),
    prepTime: v.optional(v.string()),
    cookTime: v.optional(v.string()),
    servings: v.optional(v.string()),
    nutritionalNotes: v.optional(v.array(v.string())),
    cookingTips: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

// Mutation to delete a recipe
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
