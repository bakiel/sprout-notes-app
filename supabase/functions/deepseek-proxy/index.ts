import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, addCorsHeaders } from "../_shared/cors.ts";

// Interface for request body
interface RecipeRequestBody {
  ingredients: string[];
  restrictions: string[];
  cuisineType?: string;
  servingSize?: number;
}

// Interface for the recipe response
interface Recipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  nutritionalNotes?: string[]; // Array of nutrition facts
  cookingTips?: string[]; // Array of helpful cooking tips
}

// Get API key from environment variables
const apiKey = Deno.env.get("DEEPSEEK_API_KEY");

if (!apiKey) {
  console.error("DEEPSEEK_API_KEY environment variable is not set");
}

serve(async (req) => {
  // Handle CORS preflight request
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request JSON
    const requestData: RecipeRequestBody = await req.json();
    const { ingredients, restrictions } = requestData;

    // Validate request data
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: ingredients must be a non-empty array" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Craft prompt for DeepSeek API
    const restrictionsText = restrictions?.length
      ? ` The recipe must be ${restrictions.join(' and ')}.`
      : "";
      
    const cuisineText = requestData.cuisineType
      ? ` Make it a ${requestData.cuisineType} style dish.`
      : "";
      
    const servingSizeText = requestData.servingSize
      ? ` Make the recipe for ${requestData.servingSize} servings.`
      : "";

    const prompt = `Generate a vegan recipe using these ingredients: ${ingredients.join(
      ", "
    )}.${restrictionsText}${cuisineText}${servingSizeText} The recipe should be delicious, practical, and suitable for home cooking. Format the response as a JSON object with these fields: title, description, ingredients (as an array), instructions (as an array of steps), nutritionalNotes (as an array of nutrition facts), and cookingTips (as an array of helpful tips). Each step should be clear and detailed. Include nutritional information like calories, protein, carbs, and fat estimates. Also include 3-5 cooking tips specific to this recipe. You may add small amounts of common ingredients not listed if needed for a complete recipe.`;

    console.log("Calling DeepSeek API with prompt:", prompt);

    // Call DeepSeek API
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a professional vegan chef. You specialize in creating plant-based recipes that are delicious and practical. Your responses should be in valid JSON format only, with no additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json();
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${JSON.stringify(errorData)}`);
    }

    // Parse DeepSeek response
    const deepseekData = await deepseekResponse.json();
    console.log("Raw DeepSeek response:", JSON.stringify(deepseekData, null, 2));

    // Extract the response content from DeepSeek
    const content = deepseekData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response from DeepSeek API: Missing content");
    }

    try {
      // Parse JSON from DeepSeek response
      // Sometimes DeepSeek might include markdown backticks for JSON, so we need to handle that
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const recipeData = JSON.parse(jsonStr) as Recipe;

      // Return the recipe data
      return addCorsHeaders(
        new Response(JSON.stringify({ recipe: recipeData }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    } catch (jsonError) {
      console.error("Error parsing DeepSeek response:", jsonError);
      console.error("Response content:", content);
      throw new Error("Failed to parse recipe data from DeepSeek API");
    }
  } catch (error) {
    console.error("Error processing request:", error);

    return addCorsHeaders(
      new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error occurred",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
  }
});
