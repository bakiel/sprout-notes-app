import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient'; // Assuming supabase client is configured
import { generateRecipe as generateRecipeDirectly } from '../api/recipeGenerator'; // Direct API call utility (renamed import)

// Define the structure of the recipe object (adjust as needed)
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
  id?: string;
  category?: string; // Added category field
}

// Define the structure for generation parameters
interface GenerateRecipeParams {
  ingredients: string[];
  dietaryRestrictions?: string[];
  cuisineType?: string;
  servingSize?: number;
}

// Define the hook's return type
interface UseRecipeGeneratorReturn {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  generateRecipe: (params: GenerateRecipeParams) => Promise<void>;
}

// Cache configuration
const CACHE_PREFIX = 'recipeCache_';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface CachedRecipe {
  recipe: Recipe;
  timestamp: number;
}

// Helper function to create a consistent cache key
const createCacheKey = (params: GenerateRecipeParams): string => {
  const keyParts = [
    params.ingredients.slice().sort().join(','), // Sort ingredients for consistency
    params.dietaryRestrictions?.slice().sort().join(',') || '',
    params.cuisineType || '',
    params.servingSize?.toString() || '',
  ];
  // Simple hash function (djb2) - not cryptographically secure, but fine for cache keys
  const hash = keyParts.join('|').split('').reduce((acc, char) => {
    acc = ((acc << 5) - acc) + char.charCodeAt(0);
    return acc & acc; 
  }, 0);
  return `${CACHE_PREFIX}${hash}`;
};


const useRecipeGenerator = (): UseRecipeGeneratorReturn => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = useCallback(async (params: GenerateRecipeParams) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null); // Clear previous recipe

    const cacheKey = createCacheKey(params);
    
    // 1. Check cache
    try {
      const cachedItem = sessionStorage.getItem(cacheKey);
      if (cachedItem) {
        const { recipe: cachedRecipe, timestamp }: CachedRecipe = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          console.log("Using cached recipe for key:", cacheKey);
          setRecipe(cachedRecipe);
          setIsLoading(false);
          return; // Exit early if valid cache hit
        } else {
          console.log("Cache expired for key:", cacheKey);
          sessionStorage.removeItem(cacheKey); // Remove expired item
        }
      }
    } catch (e) {
      console.error("Error reading from recipe cache:", e);
      sessionStorage.removeItem(cacheKey); // Clear potentially corrupted cache item
    }

    // 2. If no valid cache, proceed with API call
    try {
      let generatedRecipe: Recipe | null = null;

      // Option 1: Try calling the Supabase Edge Function first
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'deepseek-proxy', // Ensure this matches your function name
        {
          body: {
            ingredients: params.ingredients,
            dietary_restrictions: params.dietaryRestrictions,
            cuisine_type: params.cuisineType,
            serving_size: params.servingSize,
          },
        }
      );

      if (functionError) {
          throw functionError; // Rethrow to be caught by the outer catch block for fallback
        }

        // Parse function data (handle string or object response)
        if (typeof functionData === 'string') {
          try {
            const parsedData = JSON.parse(functionData);
            if (parsedData && parsedData.title && parsedData.ingredients && parsedData.instructions) {
              generatedRecipe = parsedData as Recipe;
            } else { throw new Error('Invalid recipe structure in function response string.'); }
          } catch (parseError) { throw new Error(`Failed to parse function response: ${parseError}`); }
        } else if (typeof functionData === 'object' && functionData !== null && functionData.title && functionData.ingredients && functionData.instructions) {
          generatedRecipe = functionData as Recipe;
        } else {
          throw new Error('Unexpected data format from Supabase function.');
        }
        console.log("Recipe generated via Supabase function.");

      } catch (functionError: any) {
        console.warn('Supabase function call failed, falling back to direct API call:', functionError.message);
        
        // Option 2: Fallback to direct API call
        const directApiParams = {
          ingredients: params.ingredients,
          restrictions: params.dietaryRestrictions || [],
          cuisineType: params.cuisineType,
          servingSize: params.servingSize,
        };
        generatedRecipe = await generateRecipeDirectly(directApiParams);
        if (!generatedRecipe) {
          throw new Error('Direct API call failed to return a recipe.');
        }
        console.log("Recipe generated via direct API call.");
      }

      // 3. Update state and cache
      if (generatedRecipe) {
        setRecipe(generatedRecipe);
        // Cache the successful result
        try {
          const cacheItem: CachedRecipe = { recipe: generatedRecipe, timestamp: Date.now() };
          sessionStorage.setItem(cacheKey, JSON.stringify(cacheItem));
          console.log("Recipe cached with key:", cacheKey);
        } catch (e) {
          console.error("Error writing to recipe cache:", e);
          // Decide if we need to clear cache due to storage limits, etc.
        }
      } else {
        // This case should ideally not be reached if errors are thrown correctly
         throw new Error('Recipe generation resulted in null.');
      }

    } catch (err: any) {
      // 4. Handle errors
      console.error('Recipe generation failed:', err);
      setError(err.message || 'An unknown error occurred during recipe generation.');
      setRecipe(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // Add useCallback dependency array

  return { recipe, isLoading, error, generateRecipe };
};

export default useRecipeGenerator;
export type { Recipe, GenerateRecipeParams }; // Export types for use in components
