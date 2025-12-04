// OpenRouter API client for DeepSeek V3.2 and AI image generation
// Uses unified OpenRouter proxy Edge Function for all AI operations

// Define types
export interface RecipeRequest {
  ingredients: string[];
  restrictions: string[];
  cuisineType?: string;
  mealType?: string;
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
  nutritionalNotes?: string[];
  cookingTips?: string[];
  id?: string;
}

export interface RecipeEditRequest {
  recipe: Recipe;
  editInstructions: string;
}

// OpenRouter API configuration (client-side fallback)
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const DEEPSEEK_MODEL = "deepseek/deepseek-v3.2"; // DeepSeek V3.2 - latest version

/**
 * Convert any image (base64 or URL) to JPEG format for smaller file size
 * @param imageSource - Base64 data URL or image URL
 * @param quality - JPEG quality (0-1), default 0.85
 * @returns Promise resolving to JPEG base64 data URL
 */
export async function convertToJpeg(imageSource: string, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Fill with white background (for transparency handling)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Convert to JPEG
      const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(jpegDataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = imageSource;
  });
}

/**
 * Helper to call OpenRouter API directly (fallback when Edge Function unavailable)
 */
async function callOpenRouter(messages: any[], options: any = {}) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://sprouts-app.com",
      "X-Title": "Sprouts App - AI Vegan Recipe Generator",
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
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

/**
 * Edit a recipe with AI assistance using DeepSeek V3.2 via OpenRouter
 * @param request Object containing the recipe to edit and instructions for editing
 * @returns The edited recipe
 */
export async function editRecipe(request: RecipeEditRequest): Promise<Recipe> {
  const { recipe, editInstructions } = request;

  if (!recipe) {
    throw new Error("Invalid request: recipe is required");
  }

  if (!editInstructions) {
    throw new Error("Invalid request: editInstructions is required");
  }

  const recipeJson = JSON.stringify(recipe, null, 2);

  const prompt = `Modify this vegan recipe according to the instructions.

Current recipe:
${recipeJson}

Modification request: ${editInstructions}

Return the modified recipe in the same JSON format. Keep it vegan and practical. Return ONLY valid JSON.`;

  console.log("Calling OpenRouter API (DeepSeek V3.2) for recipe editing:", editInstructions);

  try {
    const data = await callOpenRouter([
      {
        role: "system",
        content: "You are a professional vegan chef. Modify recipes as requested while keeping them delicious and practical. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response from OpenRouter API: Missing content");
    }

    try {
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const editedRecipe = JSON.parse(jsonStr) as Recipe;

      // Preserve the recipe ID
      if (recipe.id && !editedRecipe.id) {
        editedRecipe.id = recipe.id;
      }

      return editedRecipe;
    } catch (jsonError) {
      console.error("Error parsing OpenRouter response for recipe editing:", jsonError);
      console.error("Response content:", content);
      throw new Error("Failed to parse edited recipe data from OpenRouter API");
    }
  } catch (error) {
    console.error("Error calling OpenRouter API for recipe editing:", error);
    throw error;
  }
}

/**
 * Generate a recipe using DeepSeek V3.2 via OpenRouter
 * This is a fallback for when Supabase Edge Functions aren't available
 */
export async function generateRecipe(request: RecipeRequest): Promise<Recipe> {
  const { ingredients, restrictions, cuisineType, mealType } = request;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Invalid request: ingredients must be a non-empty array");
  }

  const restrictionsText = restrictions?.length
    ? ` The recipe must be ${restrictions.join(' and ')}.`
    : "";

  const cuisineText = cuisineType
    ? ` Make it a ${cuisineType} style dish.`
    : "";

  const servingSizeText = request.servingSize
    ? ` Make the recipe for ${request.servingSize} servings.`
    : "";

  const mealTypeText = mealType
    ? ` It should be suitable for ${mealType}.`
    : "";

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

  console.log("Calling OpenRouter API (DeepSeek V3.2) for recipe generation");

  try {
    const data = await callOpenRouter([
      {
        role: "system",
        content: "You are a professional vegan chef. Create delicious, practical plant-based recipes. Always respond with valid JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response from OpenRouter API: Missing content");
    }

    try {
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const recipeData = JSON.parse(jsonStr) as Recipe;
      return recipeData;
    } catch (jsonError) {
      console.error("Error parsing OpenRouter response:", jsonError);
      console.error("Response content:", content);
      throw new Error("Failed to parse recipe data from OpenRouter API");
    }
  } catch (error) {
    console.error("Error calling OpenRouter API directly:", error);
    throw error;
  }
}

/**
 * Generate an AI image for a recipe using OpenRouter's image generation
 * Uses Google Nano Banana Pro (gemini-3-pro-image-preview) via OpenRouter
 */
export async function generateRecipeImage(recipeName: string, ingredients: string[] = []): Promise<string | null> {
  const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

  const ingredientList = ingredients.slice(0, 5).join(', ');
  const prompt = `Generate a beautiful, appetising photograph of a vegan dish called "${recipeName}"${ingredientList ? ` featuring ${ingredientList}` : ''}.

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

  console.log("Generating AI image for:", recipeName);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://sprouts-app.com",
        "X-Title": "Sprouts App - AI Vegan Recipe Generator",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
        image_config: {
          aspect_ratio: "16:9",
          width: 1024,  // 1K resolution instead of 4K
          height: 576   // 16:9 at 1K
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter Image API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

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

    // Convert to JPEG for smaller file size
    if (imageUrl) {
      try {
        console.log("Converting image to JPEG format...");
        const jpegImage = await convertToJpeg(imageUrl, 0.85);
        console.log("Image converted to JPEG successfully");
        return jpegImage;
      } catch (conversionError) {
        console.warn("Failed to convert image to JPEG, using original:", conversionError);
        return imageUrl;
      }
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating AI image:", error);
    return null;
  }
}
