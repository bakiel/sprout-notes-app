import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, addCorsHeaders } from "../_shared/cors.ts";

// Interface for recipe generation request body
interface RecipeGenerationRequestBody {
  ingredients: string[];
  restrictions: string[];
  cuisineType?: string;
  servingSize?: number;
}

// Interface for recipe editing request body
interface RecipeEditRequestBody {
  recipe: Recipe;
  editInstructions: string;
  action: 'edit';
}

// Interface for recipe description request body (for image search)
interface RecipeDescriptionRequestBody {
  recipe: {
    title: string;
    ingredients: string[];
  };
  action: 'describe';
}

// Combined request body type
type RequestBody = RecipeGenerationRequestBody | RecipeEditRequestBody | RecipeDescriptionRequestBody;

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

// Helper function to determine if the request is for recipe editing
function isRecipeEditRequest(request: any): request is RecipeEditRequestBody {
  return request && request.action === 'edit' && request.recipe && request.editInstructions;
}

// Helper function to determine if the request is for recipe description (for image search)
function isRecipeDescriptionRequest(request: any): request is RecipeDescriptionRequestBody {
  return request && request.action === 'describe' && request.recipe && request.recipe.title;
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
    const requestData: RequestBody = await req.json();
    
    // Determine which type of request this is: recipe editing, food description, or recipe generation
    let prompt: string;
    let isDescriptionRequest = false;
    
    if (isRecipeDescriptionRequest(requestData)) {
      // Food description request for image search
      const { recipe } = requestData;
      
      // Craft prompt for detailed food description
      prompt = `Please describe in detail what a vegan dish called "${recipe.title}" would look like visually. 
The dish uses these main ingredients: ${recipe.ingredients.join(', ')}. 

Your description should be detailed enough to be used as an image search query. Focus on:
1. Colors and appearance (vibrant, colorful, rustic, etc.)
2. Textures visible in the dish
3. How it's plated or served
4. Garnishes or toppings
5. The overall presentation

Provide a single paragraph description (60-80 words) that would help someone find a beautiful, appetizing image of this dish. The description should be specific to vegan food photography. Don't include any cooking instructions or tastes, just focus on the visual aspects.`;

      console.log("Calling DeepSeek API for food description of:", recipe.title);
      isDescriptionRequest = true;
    } else if (isRecipeEditRequest(requestData)) {
      // Recipe editing request
      const { recipe, editInstructions } = requestData;
      
      if (!recipe) {
        return new Response(
          JSON.stringify({ error: "Invalid request: recipe is required for editing" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (!editInstructions) {
        return new Response(
          JSON.stringify({ error: "Invalid request: editInstructions is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Create a JSON string representation of the recipe
      const recipeJson = JSON.stringify(recipe, null, 2);
      
      // Craft prompt for recipe editing
      prompt = `I have a vegan recipe that I want to modify. Here's the current recipe in JSON format:
      
${recipeJson}

Please modify this recipe according to these instructions: ${editInstructions}

Return the modified recipe in the same JSON format with all the same fields. Preserve the recipe's ID if it exists. Make sure the recipe remains vegan and practical for home cooking. The response should be valid JSON only.`;

      console.log("Calling DeepSeek API for recipe editing with instructions:", editInstructions);
    } else {
      // Recipe generation request
      const { ingredients, restrictions } = requestData as RecipeGenerationRequestBody;
      
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
      
      // Craft prompt for recipe generation
      const restrictionsText = restrictions?.length
        ? ` The recipe must be ${restrictions.join(' and ')}.`
        : "";
        
      const cuisineText = (requestData as RecipeGenerationRequestBody).cuisineType
        ? ` Make it a ${(requestData as RecipeGenerationRequestBody).cuisineType} style dish.`
        : "";
        
      const servingSizeText = (requestData as RecipeGenerationRequestBody).servingSize
        ? ` Make the recipe for ${(requestData as RecipeGenerationRequestBody).servingSize} servings.`
        : "";

      prompt = `Generate a vegan recipe using these ingredients: ${ingredients.join(
        ", "
      )}.${restrictionsText}${cuisineText}${servingSizeText} The recipe should be delicious, practical, and suitable for home cooking. Format the response as a JSON object with these fields: title, description, ingredients (as an array), instructions (as an array of steps), nutritionalNotes (as an array of nutrition facts), and cookingTips (as an array of helpful tips). Each step should be clear and detailed. Include nutritional information like calories, protein, carbs, and fat estimates. Also include 3-5 cooking tips specific to this recipe. You may add small amounts of common ingredients not listed if needed for a complete recipe.`;
      
      console.log("Calling DeepSeek API for recipe generation with ingredients:", ingredients.join(", "));
    }


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

    // Handle differently based on request type
    if (isDescriptionRequest) {
      // For food description requests, we want plain text, not JSON
      const description = content.trim();
      console.log("Food description generated:", description);
      
      // Return the description as plain text
      return addCorsHeaders(
        new Response(JSON.stringify({ description }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    } else {
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
