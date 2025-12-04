"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek/deepseek-v3.2"; // DeepSeek V3.2 - latest version
const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

// Recipe generation action - API key is securely stored on server
export const generateRecipe = action({
  args: {
    ingredients: v.array(v.string()),
    restrictions: v.optional(v.array(v.string())),
    cuisineType: v.optional(v.string()),
    mealType: v.optional(v.string()),
    servingSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const { ingredients, restrictions, cuisineType, mealType, servingSize } = args;

    const restrictionsText = restrictions?.length
      ? ` The recipe must be ${restrictions.join(" and ")}.`
      : "";
    const cuisineText = cuisineType ? ` Make it a ${cuisineType} style dish.` : "";
    const servingSizeText = servingSize ? ` Make the recipe for ${servingSize} servings.` : "";
    const mealTypeText = mealType ? ` It should be suitable for ${mealType}.` : "";

    const prompt = `Generate a delicious vegan recipe using these ingredients: ${ingredients.join(", ")}.${restrictionsText}${cuisineText}${mealTypeText}${servingSizeText}

The recipe should be practical for home cooking. Format the response as a JSON object with these fields:
- title: Creative, appetising name
- description: Brief enticing description (1-2 sentences)
- ingredients: Array of ingredients with measurements
- instructions: Array of clear step-by-step instructions
- prepTime: Preparation time (e.g., "15 minutes")
- cookTime: Cooking time (e.g., "30 minutes")
- servings: Number of servings
- nutritionalNotes: Array of key nutrition facts
- cookingTips: Array of 3-5 helpful tips

You may add common pantry staples if needed. Return ONLY valid JSON, no markdown.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sprout-notes-app.vercel.app",
        "X-Title": "Sprout Notes - AI Vegan Recipe Generator",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a professional vegan chef. Create delicious, practical plant-based recipes. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Invalid response from OpenRouter API");
    }

    try {
      const jsonStr = content.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Failed to parse recipe data");
    }
  },
});

// Recipe editing action
export const editRecipe = action({
  args: {
    recipe: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      ingredients: v.array(v.string()),
      instructions: v.array(v.string()),
      prepTime: v.optional(v.string()),
      cookTime: v.optional(v.string()),
      servings: v.optional(v.string()),
      nutritionalNotes: v.optional(v.array(v.string())),
      cookingTips: v.optional(v.array(v.string())),
    }),
    editInstructions: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const { recipe, editInstructions } = args;
    const recipeJson = JSON.stringify(recipe, null, 2);

    const prompt = `Modify this vegan recipe according to the instructions.

Current recipe:
${recipeJson}

Modification request: ${editInstructions}

Return the modified recipe in the same JSON format. Keep it vegan and practical. Return ONLY valid JSON.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sprout-notes-app.vercel.app",
        "X-Title": "Sprout Notes - AI Vegan Recipe Generator",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a professional vegan chef. Modify recipes as requested while keeping them delicious and practical. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Invalid response from OpenRouter API");
    }

    try {
      const jsonStr = content.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Failed to parse edited recipe data");
    }
  },
});

// Image generation action
export const generateImage = action({
  args: {
    recipeName: v.string(),
    ingredients: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const { recipeName, ingredients = [] } = args;
    const ingredientList = ingredients.slice(0, 5).join(", ");

    const prompt = `Generate a beautiful, appetising photograph of a vegan dish called "${recipeName}"${ingredientList ? ` featuring ${ingredientList}` : ""}.

The image should have:
- Professional food photography styling
- Natural soft lighting from the side
- Clean white ceramic plate or rustic wooden board
- Fresh, vibrant colours of vegetables and ingredients
- Shallow depth of field for artistic effect
- Restaurant-quality plating and presentation
- Appropriate garnishes (fresh herbs, seeds, or microgreens)
- Clean, minimal background

Style: editorial food photography, high resolution, warm inviting tones.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sprout-notes-app.vercel.app",
        "X-Title": "Sprout Notes - AI Vegan Recipe Generator",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: "16:9",
          width: 1024,
          height: 576,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Image API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    let imageUrl: string | null = null;

    if (message?.images?.length > 0) {
      const img = message.images[0];
      imageUrl = img?.image_url?.url || (typeof img === "string" ? img : null);
    }

    if (!imageUrl && message?.content) {
      const match = message.content.match(/data:image\/[^;]+;base64,[^\s"']+/);
      if (match) imageUrl = match[0];
    }

    return imageUrl;
  },
});

// Shopping list generation action
export const generateShoppingList = action({
  args: {
    ingredients: v.array(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const { ingredients, country = "US" } = args;

    const prompt = `Create a shopping list from these recipe ingredients: ${ingredients.join(", ")}

Organise them by grocery store section/category (e.g., Produce, Dairy Alternatives, Pantry, etc.)
Localise ingredient names for ${country} (use local terminology and common brand names where applicable).

Return as JSON object where keys are category names and values are arrays of items.
Example: { "Produce": ["2 ripe avocados", "1 bunch fresh cilantro"], "Pantry": ["1 can black beans"] }

Return ONLY valid JSON.`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://sprout-notes-app.vercel.app",
        "X-Title": "Sprout Notes - AI Vegan Recipe Generator",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful shopping assistant. Organise ingredients into logical grocery store categories. Always respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Invalid response from OpenRouter API");
    }

    try {
      const jsonStr = content.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Failed to parse shopping list data");
    }
  },
});
