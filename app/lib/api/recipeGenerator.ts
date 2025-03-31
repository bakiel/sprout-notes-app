// Direct API client for DeepSeek (used as a fallback when Supabase Edge Functions aren't available)

// Define types
export interface RecipeRequest {
  ingredients: string[];
  restrictions: string[];
  cuisineType?: string;
  servingSize?: number;
}

export interface Recipe {
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

// DeepSeek API key - in production this should be secured in an Edge Function
// For development purposes only
const DEEPSEEK_API_KEY = 'sk-121a8ea2510e44e49c880b6746ee10ca';

/**
 * Generate a recipe directly using the DeepSeek API
 * This is a fallback for when Supabase Edge Functions aren't available (e.g., Docker not running)
 */
export async function generateRecipe(request: RecipeRequest): Promise<Recipe> {
  const { ingredients, restrictions, cuisineType } = request;
  
  // Validate request data
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Invalid request: ingredients must be a non-empty array");
  }

  // Craft prompt for DeepSeek API
  const restrictionsText = restrictions?.length
    ? ` The recipe must be ${restrictions.join(' and ')}.`
    : "";
    
  const cuisineText = cuisineType
    ? ` Make it a ${cuisineType} style dish.`
    : "";
    
  const servingSizeText = request.servingSize
    ? ` Make the recipe for ${request.servingSize} servings.`
    : "";

  const prompt = `Generate a vegan recipe using these ingredients: ${ingredients.join(
    ", "
  )}.${restrictionsText}${cuisineText}${servingSizeText} The recipe should be delicious, practical, and suitable for home cooking. Format the response as a JSON object with these fields: title, description, ingredients (as an array), instructions (as an array of steps), nutritionalNotes (as an array of nutrition facts), and cookingTips (as an array of helpful tips). Each step should be clear and detailed. Include nutritional information like calories, protein, carbs, and fat estimates. Also include 3-5 cooking tips specific to this recipe. You may add small amounts of common ingredients not listed if needed for a complete recipe.`;

  console.log("Calling DeepSeek API directly with prompt:", prompt);

  try {
    // Call DeepSeek API
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
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
      return recipeData;
    } catch (jsonError) {
      console.error("Error parsing DeepSeek response:", jsonError);
      console.error("Response content:", content);
      throw new Error("Failed to parse recipe data from DeepSeek API");
    }
  } catch (error) {
    console.error("Error calling DeepSeek API directly:", error);
    throw error;
  }
}
