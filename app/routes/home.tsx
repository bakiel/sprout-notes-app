// Removed unused imports
// import type { Route } from "./+types/home";
// import { Welcome } from "../welcome/welcome";

import React, { useState } from 'react'; 
import RecipeGeneratorForm from '../components/RecipeGeneratorForm'; 
import RecipeCard from '../components/RecipeCard'; 
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

// Define Recipe type (should match RecipeCard's type)
interface Recipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
}

// Updated meta function (using generic type for args)
export function meta(args: any) {
  return [
    { title: "Sprout Notes 🌱 - AI Vegan Recipes & Notes" },
    { name: "description", content: "Generate vegan recipes and organize your cooking notes with AI." },
  ];
}

export default function Home() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // To handle potential errors

  // Placeholder function to simulate API call
  const handleGenerateRecipe = async (ingredients: string, restrictions: string[]) => {
    console.log("Generating recipe with:", { ingredients, restrictions });
    setIsLoading(true);
    setError(null);
    setRecipe(null); 

    try {
      // --- Actual Supabase Function Call ---
      const { data, error: functionError } = await supabase.functions.invoke('deepseek-proxy', {
        body: { 
          ingredients: ingredients.split(',').map(s => s.trim()).filter(Boolean), // Basic parsing
          restrictions: restrictions 
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (!data || typeof data !== 'object' || !data.recipe) {
         throw new Error("Invalid response format from recipe generator.");
      }
      
      // TODO: Validate the structure of data.recipe more thoroughly
      // Assuming data.recipe matches our Recipe interface for now
      setRecipe(data.recipe as Recipe); 
      // --- End Function Call ---

    } catch (err: any) {
       console.error("Error calling Supabase function:", err);
       setError(`Failed to generate recipe: ${err.message || 'Unknown error'}. Using mock data.`);
       
       // --- Fallback to Mock Data on Error ---
       await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for fallback
       const mockRecipe: Recipe = {
         title: "Mock Tofu Scramble (Fallback)",
         description: "Could not reach the AI chef! Here's a basic scramble.",
         ingredients: ["1 block firm tofu, pressed", "1 tbsp nutritional yeast", "1/2 tsp turmeric", "Salt and pepper", `Your ingredients: ${ingredients}`],
         instructions: ["Crumble tofu.", "Sauté with spices.", "Serve hot."],
       };
       setRecipe(mockRecipe);
       // --- End Fallback ---

    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}> {/* Basic padding & centering */}
      <section id="recipe-generator" style={{ marginBottom: '2rem' }}>
        <h2>Generate a Recipe</h2>
        {/* Pass handleGenerateRecipe to the form component */}
        {/* We'll need to modify RecipeGeneratorForm to accept this prop */}
        <RecipeGeneratorForm onGenerate={handleGenerateRecipe} /> 
        {/* Display error message if any */}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>}
      </section>

      <section id="recipe-display" style={{ marginBottom: '2rem' }}>
        <h2>Generated Recipe</h2>
        <div id="recipe-content">
           {/* Pass recipe data and loading state to the card */}
          <RecipeCard recipe={recipe} isLoading={isLoading} />
        </div>
      </section>

      <section id="notes-section" style={{ marginTop: '3rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
        <h2>My Notes</h2>
        {/* Placeholder for Notes components */}
        <p>Note-taking features will go here.</p>
      </section>
    </main>
  );
}
