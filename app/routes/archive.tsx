import React, { useState, useEffect } from 'react'; // Import hooks
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Import supabase client
import LoadingIndicator from '../components/LoadingIndicator'; // Import LoadingIndicator

// TODO: Define Recipe type centrally (e.g., in app/types.ts) and import it
interface Recipe {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  nutritionalNotes?: string[];
  cookingTips?: string[];
  imageUrl?: string | null;
}

// Basic placeholder component for the archive route
const RecipeArchive: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }
        console.log('Archive fetch successful. Data:', data);
        setRecipes(data as Recipe[]);
      } catch (err) {
        console.error('Detailed error fetching archive recipes:', err);
        let errorMessage = 'Failed to fetch recipes.';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
          errorMessage = (err as any).message || errorMessage;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="recipe-archive-page">
      <header className="archive-header">
        <Link to="/" className="back-to-home-link">← Back to Home</Link>
        <h1 className="archive-title">Recipe Archive</h1>
        <p className="archive-subtitle">Browse and discover all your favorite plant-based recipes</p>
      </header>
      <div className="recipes-container">
        {isLoading ? (
          <LoadingIndicator message="Loading recipes..." />
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            {/* Optionally add a retry button */}
          </div>
        ) : recipes.length === 0 ? (
          <p className="no-recipes-message">No recipes found in the archive yet.</p>
        ) : (
          <div>
            {/* Placeholder: We'll add recipe rendering logic next */}
            <p>{recipes.length} recipe(s) loaded.</p> 
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeArchive;
