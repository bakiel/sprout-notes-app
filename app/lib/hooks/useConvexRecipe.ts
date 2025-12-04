import { useState, useCallback } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isConvexConfigured } from "../convex";

// Define types
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
  imageUrl?: string;
}

interface GenerateRecipeParams {
  ingredients: string[];
  dietaryRestrictions?: string[];
  cuisineType?: string;
  mealType?: string;
  servingSize?: number;
}

interface UseConvexRecipeReturn {
  recipe: Recipe | null;
  isLoading: boolean;
  error: string | null;
  generateRecipe: (params: GenerateRecipeParams) => Promise<void>;
  generateImage: (recipeName: string, ingredients?: string[]) => Promise<string | null>;
  editRecipe: (recipe: Recipe, instructions: string) => Promise<Recipe | null>;
  saveRecipe: (recipe: Recipe) => Promise<string | null>;
}

export function useConvexRecipe(): UseConvexRecipeReturn {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convex actions - only call if Convex is configured
  const generateRecipeAction = isConvexConfigured()
    ? useAction(api.ai.generateRecipe)
    : null;
  const generateImageAction = isConvexConfigured()
    ? useAction(api.ai.generateImage)
    : null;
  const editRecipeAction = isConvexConfigured()
    ? useAction(api.ai.editRecipe)
    : null;
  const saveRecipeMutation = isConvexConfigured()
    ? useMutation(api.recipes.save)
    : null;

  const generateRecipe = useCallback(
    async (params: GenerateRecipeParams) => {
      if (!generateRecipeAction) {
        setError("Convex not configured");
        return;
      }

      setIsLoading(true);
      setError(null);
      setRecipe(null);

      try {
        const result = await generateRecipeAction({
          ingredients: params.ingredients,
          restrictions: params.dietaryRestrictions,
          cuisineType: params.cuisineType,
          mealType: params.mealType,
          servingSize: params.servingSize,
        });

        setRecipe(result as Recipe);
      } catch (err) {
        console.error("Recipe generation failed:", err);
        setError(err instanceof Error ? err.message : "Failed to generate recipe");
      } finally {
        setIsLoading(false);
      }
    },
    [generateRecipeAction]
  );

  const generateImage = useCallback(
    async (recipeName: string, ingredients?: string[]): Promise<string | null> => {
      if (!generateImageAction) {
        console.error("Convex not configured");
        return null;
      }

      try {
        const imageUrl = await generateImageAction({
          recipeName,
          ingredients,
        });
        return imageUrl;
      } catch (err) {
        console.error("Image generation failed:", err);
        return null;
      }
    },
    [generateImageAction]
  );

  const editRecipe = useCallback(
    async (recipeToEdit: Recipe, instructions: string): Promise<Recipe | null> => {
      if (!editRecipeAction) {
        console.error("Convex not configured");
        return null;
      }

      try {
        const result = await editRecipeAction({
          recipe: {
            title: recipeToEdit.title,
            description: recipeToEdit.description,
            ingredients: recipeToEdit.ingredients,
            instructions: recipeToEdit.instructions,
            prepTime: recipeToEdit.prepTime,
            cookTime: recipeToEdit.cookTime,
            servings: recipeToEdit.servings,
            nutritionalNotes: recipeToEdit.nutritionalNotes,
            cookingTips: recipeToEdit.cookingTips,
          },
          editInstructions: instructions,
        });

        const editedRecipe = result as Recipe;
        setRecipe(editedRecipe);
        return editedRecipe;
      } catch (err) {
        console.error("Recipe editing failed:", err);
        return null;
      }
    },
    [editRecipeAction]
  );

  const saveRecipe = useCallback(
    async (recipeToSave: Recipe): Promise<string | null> => {
      if (!saveRecipeMutation) {
        console.error("Convex not configured");
        return null;
      }

      try {
        const id = await saveRecipeMutation({
          title: recipeToSave.title,
          description: recipeToSave.description,
          ingredients: recipeToSave.ingredients,
          instructions: recipeToSave.instructions,
          prepTime: recipeToSave.prepTime,
          cookTime: recipeToSave.cookTime,
          servings: recipeToSave.servings,
          nutritionalNotes: recipeToSave.nutritionalNotes,
          cookingTips: recipeToSave.cookingTips,
          imageUrl: recipeToSave.imageUrl,
        });
        return id;
      } catch (err) {
        console.error("Recipe saving failed:", err);
        return null;
      }
    },
    [saveRecipeMutation]
  );

  return {
    recipe,
    isLoading,
    error,
    generateRecipe,
    generateImage,
    editRecipe,
    saveRecipe,
  };
}

// Hook to get all saved recipes
export function useRecipeList() {
  if (!isConvexConfigured()) {
    return { recipes: [], isLoading: false };
  }

  const recipes = useQuery(api.recipes.list);
  return {
    recipes: recipes ?? [],
    isLoading: recipes === undefined,
  };
}
