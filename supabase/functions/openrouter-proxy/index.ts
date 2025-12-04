import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, addCorsHeaders } from "../_shared/cors.ts";

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek/deepseek-v3.2"; // Latest DeepSeek V3.2 - GPT-5 class
const IMAGE_MODEL = "google/gemini-3-pro-image-preview"; // Nano Banana Pro for images

// Get API key from environment
const apiKey = Deno.env.get("OPENROUTER_API_KEY");

if (!apiKey) {
  console.error("OPENROUTER_API_KEY environment variable is not set");
}

// Types
interface Recipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  nutritionalNotes?: string[];
  cookingTips?: string[];
}

interface RecipeGenerationRequest {
  action: 'generateRecipe';
  ingredients: string[];
  restrictions?: string[];
  cuisineType?: string;
  mealType?: string;
  servingSize?: number;
}

interface RecipeEditRequest {
  action: 'edit';
  recipe: Recipe;
  editInstructions: string;
}

interface RecipeDescribeRequest {
  action: 'describe';
  recipe: { title: string; ingredients: string[] };
}

interface PantryListRequest {
  action: 'generatePantryList';
  ingredients: string[];
  country?: string;
}

interface ImageGenerationRequest {
  action: 'generateImage';
  recipeName: string;
  ingredients?: string[];
}

type RequestBody = RecipeGenerationRequest | RecipeEditRequest | RecipeDescribeRequest | PantryListRequest | ImageGenerationRequest;

// Helper to call OpenRouter
async function callOpenRouter(model: string, messages: any[], options: any = {}) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://sprouts-app.com",
      "X-Title": "Sprouts App - AI Vegan Recipe Generator",
    },
    body: JSON.stringify({
      model,
      messages,
      ...options
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestData: RequestBody = await req.json();
    const { action } = requestData;

    // ========== IMAGE GENERATION ==========
    if (action === 'generateImage') {
      const { recipeName, ingredients = [] } = requestData as ImageGenerationRequest;

      if (!recipeName) {
        return addCorsHeaders(new Response(
          JSON.stringify({ error: "recipeName is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        ));
      }

      const ingredientList = ingredients.slice(0, 5).join(', ');
      const prompt = `Generate a beautiful, appetizing photograph of a vegan dish called "${recipeName}"${ingredientList ? ` featuring ${ingredientList}` : ''}.

The image should have:
- Professional food photography styling
- Natural soft lighting from the side
- Clean white ceramic plate or rustic wooden board
- Fresh, vibrant colors of vegetables and ingredients
- Shallow depth of field for artistic effect
- Restaurant-quality plating and presentation
- Appropriate garnishes (fresh herbs, seeds, or microgreens)
- Clean, minimal background

Style: editorial food photography, high resolution, warm inviting tones.`;

      console.log("Generating image for:", recipeName);

      const data = await callOpenRouter(IMAGE_MODEL, [
        { role: "user", content: prompt }
      ], {
        modalities: ["image", "text"],
        image_config: { aspect_ratio: "4:3" }
      });

      // Extract image from response
      const message = data.choices?.[0]?.message;
      let imageUrl: string | null = null;

      if (message?.images?.length > 0) {
        const img = message.images[0];
        imageUrl = img?.image_url?.url || (typeof img === 'string' ? img : null);
      }

      if (!imageUrl && message?.content) {
        const match = message.content.match(/data:image\/[^;]+;base64,[^\s"']+/);
        if (match) imageUrl = match[0];
      }

      if (!imageUrl) {
        return addCorsHeaders(new Response(
          JSON.stringify({ error: "No image generated", fallback: true }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        ));
      }

      return addCorsHeaders(new Response(
        JSON.stringify({ imageUrl, recipeName, message: "Image generated successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ));
    }

    // ========== RECIPE GENERATION ==========
    if (action === 'generateRecipe') {
      const { ingredients, restrictions = [], cuisineType, mealType, servingSize } = requestData as RecipeGenerationRequest;

      if (!ingredients?.length) {
        return addCorsHeaders(new Response(
          JSON.stringify({ error: "ingredients array is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        ));
      }

      const restrictionsText = restrictions.length ? ` The recipe must be ${restrictions.join(' and ')}.` : "";
      const cuisineText = cuisineType ? ` Make it a ${cuisineType} style dish.` : "";
      const mealText = mealType ? ` This is for ${mealType}.` : "";
      const servingText = servingSize ? ` Make the recipe for ${servingSize} servings.` : "";

      const prompt = `Generate a delicious vegan recipe using these ingredients: ${ingredients.join(", ")}.${restrictionsText}${cuisineText}${mealText}${servingText}

The recipe should be practical for home cooking. Format the response as a JSON object with these fields:
- title: Creative, appetizing name
- description: Brief enticing description (1-2 sentences)
- ingredients: Array of ingredients with measurements
- instructions: Array of clear step-by-step instructions
- prepTime: Preparation time (e.g., "15 minutes")
- cookTime: Cooking time (e.g., "30 minutes")
- servings: Number of servings
- nutritionalNotes: Array of key nutrition facts
- cookingTips: Array of 3-5 helpful tips

You may add common pantry staples if needed. Return ONLY valid JSON, no markdown.`;

      console.log("Generating recipe with DeepSeek V3.2");

      const data = await callOpenRouter(DEEPSEEK_MODEL, [
        {
          role: "system",
          content: "You are a professional vegan chef. Create delicious, practical plant-based recipes. Always respond with valid JSON only."
        },
        { role: "user", content: prompt }
      ], {
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in response");

      const jsonStr = content.replace(/```json|```/g, '').trim();
      const recipe = JSON.parse(jsonStr);

      return addCorsHeaders(new Response(
        JSON.stringify({ recipe }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ));
    }

    // ========== RECIPE EDITING ==========
    if (action === 'edit') {
      const { recipe, editInstructions } = requestData as RecipeEditRequest;

      if (!recipe || !editInstructions) {
        return addCorsHeaders(new Response(
          JSON.stringify({ error: "recipe and editInstructions are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        ));
      }

      const prompt = `Modify this vegan recipe according to the instructions.

Current recipe:
${JSON.stringify(recipe, null, 2)}

Modification request: ${editInstructions}

Return the modified recipe in the same JSON format. Keep it vegan and practical. Return ONLY valid JSON.`;

      const data = await callOpenRouter(DEEPSEEK_MODEL, [
        {
          role: "system",
          content: "You are a professional vegan chef. Modify recipes as requested while keeping them delicious and practical. Always respond with valid JSON only."
        },
        { role: "user", content: prompt }
      ], {
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in response");

      const jsonStr = content.replace(/```json|```/g, '').trim();
      const modifiedRecipe = JSON.parse(jsonStr);

      return addCorsHeaders(new Response(
        JSON.stringify({ recipe: modifiedRecipe }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ));
    }

    // ========== RECIPE DESCRIPTION (for image search) ==========
    if (action === 'describe') {
      const { recipe } = requestData as RecipeDescribeRequest;

      if (!recipe?.title) {
        return addCorsHeaders(new Response(
          JSON.stringify({ error: "recipe with title is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        ));
      }

      const prompt = `Describe what a vegan dish called "${recipe.title}" would look like visually.
Main ingredients: ${recipe.ingredients?.join(', ') || 'various vegetables'}

Provide a single paragraph (60-80 words) focusing on:
- Colors and appearance
- Textures visible
- How it's plated
- Garnishes
- Overall presentation

This description will be used for image search. Focus only on visual aspects.`;

      const data = await callOpenRouter(DEEPSEEK_MODEL, [
        { role: "user", content: prompt }
      ], {
        temperature: 0.7,
        max_tokens: 200
      });

      const description = data.choices?.[0]?.message?.content?.trim() || "";

      return addCorsHeaders(new Response(
        JSON.stringify({ description }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ));
    }

    // ========== PANTRY LIST ==========
    if (action === 'generatePantryList') {
      const { ingredients, country } = requestData as PantryListRequest;

      if (!ingredients?.length) {
        return addCorsHeaders(new Response(
          JSON.stringify({ error: "ingredients array is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        ));
      }

      const countryContext = country
        ? `Adapt ingredient names for ${country} grocery stores.`
        : '';

      const prompt = `Create a categorized shopping list from these recipe ingredients:
${ingredients.join(', ')}

${countryContext}

Organize into categories (Produce, Pantry Staples, Spices & Herbs, Refrigerated/Frozen, etc.).
Return as JSON where keys are category names and values are arrays of items.
Return ONLY valid JSON.`;

      const data = await callOpenRouter(DEEPSEEK_MODEL, [
        { role: "user", content: prompt }
      ], {
        temperature: 0.5,
        max_tokens: 1000
      });

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in response");

      const jsonStr = content.replace(/```json|```/g, '').trim();
      const pantryList = JSON.parse(jsonStr);

      return addCorsHeaders(new Response(
        JSON.stringify({ pantryList }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      ));
    }

    // Unknown action
    return addCorsHeaders(new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    ));

  } catch (error) {
    console.error("Error:", error);
    return addCorsHeaders(new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    ));
  }
});
