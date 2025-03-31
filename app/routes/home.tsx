import React, { useState, useEffect } from 'react';
import RecipeGeneratorForm from '../components/RecipeGeneratorForm'; 
import RecipeCard from '../components/RecipeCard';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import LoadingIndicator from '../components/LoadingIndicator';
import { supabase } from '../lib/supabaseClient';
import { generateRecipe } from '../lib/api/recipeGenerator'; // Import direct API client
import type { Review } from '../components/RecipeReview';

// Define types
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
  id?: string; // Unique identifier for the recipe
}

interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  relatedRecipeId?: string;
}

// Updated meta function (using generic type for args)
export function meta(args: any) {
  return [
    { title: "Sprout Notes 🌱 - AI Vegan Recipes & Notes" },
    { name: "description", content: "Generate vegan recipes and organize your cooking notes with AI." },
  ];
}

// LocalStorage keys
const CURRENT_RECIPE_STORAGE_KEY = 'sprout-notes-current-recipe';
const SAVED_RECIPES_STORAGE_KEY = 'sprout-notes-saved-recipes';
const NOTES_STORAGE_KEY = 'sprout-notes-saved-notes';
const REVIEWS_STORAGE_KEY = 'sprout-notes-recipe-reviews';

export default function Home() {
  // Recipe state
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formResetKey, setFormResetKey] = useState<number>(0); // Key to force form reset
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  
  // Reviews state
  const [recipeReviews, setRecipeReviews] = useState<{[recipeId: string]: Review[]}>({});

  // Load current recipe from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrentRecipe = localStorage.getItem(CURRENT_RECIPE_STORAGE_KEY);
      if (savedCurrentRecipe) {
        try {
          const parsedRecipe = JSON.parse(savedCurrentRecipe);
          // Ensure recipe has an ID
          if (!parsedRecipe.id) {
            parsedRecipe.id = `recipe-${Date.now()}`;
          }
          setCurrentRecipe(parsedRecipe);
        } catch (e) {
          console.error("Failed to parse current recipe from localStorage", e);
          localStorage.removeItem(CURRENT_RECIPE_STORAGE_KEY);
        }
      }
    }
  }, []);

  // Save current recipe to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentRecipe) {
        // Ensure recipe has an ID before saving
        if (!currentRecipe.id) {
          currentRecipe.id = `recipe-${Date.now()}`;
        }
        localStorage.setItem(CURRENT_RECIPE_STORAGE_KEY, JSON.stringify(currentRecipe));
      } else {
        localStorage.removeItem(CURRENT_RECIPE_STORAGE_KEY);
      }
    }
  }, [currentRecipe]);
  
  // Load saved recipes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRecipesData = localStorage.getItem(SAVED_RECIPES_STORAGE_KEY);
      if (savedRecipesData) {
        try {
          const parsedRecipes = JSON.parse(savedRecipesData);
          // Ensure all recipes have IDs
          const recipesWithIds = parsedRecipes.map((recipe: Recipe) => {
            if (!recipe.id) {
              recipe.id = `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }
            return recipe;
          });
          setSavedRecipes(recipesWithIds);
        } catch (e) {
          console.error("Failed to parse saved recipes from localStorage", e);
          localStorage.removeItem(SAVED_RECIPES_STORAGE_KEY);
        }
      }
    }
  }, []);
  
  // Save saved recipes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && savedRecipes.length > 0) {
      localStorage.setItem(SAVED_RECIPES_STORAGE_KEY, JSON.stringify(savedRecipes));
    }
  }, [savedRecipes]);
  
  // Load reviews from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (savedReviews) {
        try {
          setRecipeReviews(JSON.parse(savedReviews));
        } catch (e) {
          console.error("Failed to parse saved reviews from localStorage", e);
          localStorage.removeItem(REVIEWS_STORAGE_KEY);
        }
      }
    }
  }, []);
  
  // Save reviews to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(recipeReviews).length > 0) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(recipeReviews));
    }
  }, [recipeReviews]);
  
  // Load notes from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error("Failed to parse saved notes from localStorage", e);
          localStorage.removeItem(NOTES_STORAGE_KEY);
        }
      }
    }
  }, []);
  
  // Save notes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && notes.length > 0) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  // Function to handle creating a new recipe (reset form and clear current recipe)
  const handleNewRecipe = () => {
    // Clear current recipe
    setCurrentRecipe(null);
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_RECIPE_STORAGE_KEY);
    }
    // Increment reset key to trigger form reset
    setFormResetKey(prev => prev + 1);
    // Clear any errors
    setError(null);
  };

  // Function to handle recipe generation with fallback to direct API
  const handleGenerateRecipe = async (ingredients: string, restrictions: string[], cuisineType: string, servingSize: number) => {
    console.log("Generating recipe with:", { ingredients, restrictions, cuisineType, servingSize });
    setIsLoading(true);
    setError(null);
    setCurrentRecipe(null); // Clear current recipe before generating new one

    // Parse ingredients from comma-separated string to array
    const ingredientsArray = ingredients.split(',').map(s => s.trim()).filter(Boolean);

    try {
      // First try using Supabase Edge Function
      try {
        console.log("Attempting to use Supabase Edge Function...");
        const { data, error: functionError } = await supabase.functions.invoke('deepseek-proxy', {
          body: { 
            ingredients: ingredientsArray,
            restrictions: restrictions,
            cuisineType: cuisineType,
            servingSize: servingSize
          },
        });

        if (functionError) {
          throw functionError;
        }

        if (!data || typeof data !== 'object' || !data.recipe) {
          throw new Error("Invalid response format from recipe generator.");
        }
        
        // Add unique ID to recipe
        const recipeWithId = {
          ...data.recipe as Recipe,
          id: `recipe-${Date.now()}`
        };
        
        setCurrentRecipe(recipeWithId);
        console.log("Successfully generated recipe using Supabase Edge Function");
        
      } catch (supabaseError: any) {
        // If Supabase Edge Function fails, try direct API call
        console.error("Error calling Supabase function:", supabaseError);
        console.log("Falling back to direct API call...");
        
        // Call DeepSeek API directly as a fallback
        const recipeData = await generateRecipe({
          ingredients: ingredientsArray,
          restrictions: restrictions,
          cuisineType: cuisineType,
          servingSize: servingSize
        });
        
        // Add unique ID to recipe
        const recipeWithId = {
          ...recipeData,
          id: `recipe-${Date.now()}`
        };
        
        setCurrentRecipe(recipeWithId);
        console.log("Successfully generated recipe using direct API call");
      }
    } catch (err: any) {
      // If both methods fail, use mock data
      console.error("All recipe generation methods failed:", err);
      setError(`Failed to generate recipe: ${err.message || 'Unknown error'}. Using mock data.`);
      
      // Fallback to Mock Data
      await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for fallback
      const cuisinePrefix = cuisineType ? `${cuisineType.charAt(0).toUpperCase() + cuisineType.slice(1)} ` : '';
      const mockRecipe: Recipe = {
        title: `${cuisinePrefix}Mock Tofu Scramble (Fallback)`,
        description: `Could not reach the AI chef! Here's a basic ${cuisineType || 'vegan'} scramble.`,
        ingredients: ["1 block firm tofu, pressed", "1 tbsp nutritional yeast", "1/2 tsp turmeric", "Salt and pepper", `Your ingredients: ${ingredients}`],
        instructions: ["Crumble tofu.", "Sauté with spices.", "Serve hot."],
        servings: servingSize ? `${servingSize}` : "2",
        id: `recipe-${Date.now()}`
      };
      setCurrentRecipe(mockRecipe);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving the currently displayed recipe
  const handleSaveRecipe = (recipeToSave: Recipe) => {
    // Ensure recipe has an ID
    if (!recipeToSave.id) {
      recipeToSave.id = `recipe-${Date.now()}`;
    }
    
    // Check if recipe already exists (check by ID if available, otherwise by title)
    if (!savedRecipes.some(r => (r.id && recipeToSave.id && r.id === recipeToSave.id) || r.title === recipeToSave.title)) {
      setSavedRecipes(prev => [...prev, recipeToSave]);
      // Optionally provide user feedback (e.g., using a notification system)
      console.log("Recipe saved:", recipeToSave.title);
    } else {
      console.log("Recipe already saved:", recipeToSave.title);
      // Optionally provide feedback that it's already saved
    }
  };
  
  // Handle submitting a review for the current recipe
  const handleSubmitReview = (rating: number, comment: string) => {
    if (!currentRecipe || !currentRecipe.id) return;
    
    const recipeId = currentRecipe.id;
    const newReview: Review = {
      id: `review-${Date.now()}`,
      rating,
      comment,
      date: new Date().toLocaleDateString()
    };
    
    setRecipeReviews(prev => {
      const updatedReviews = { ...prev };
      if (!updatedReviews[recipeId]) {
        updatedReviews[recipeId] = [];
      }
      updatedReviews[recipeId] = [newReview, ...updatedReviews[recipeId]];
      return updatedReviews;
    });
    
    console.log(`Review submitted for recipe ${recipeId}: ${rating} stars`);
  };

  // Handle saving a note
  const handleSaveNote = (note: Note) => {
    // If note has an id, it's an edit - otherwise it's a new note
    if (note.id) {
      setNotes(prevNotes => 
        prevNotes.map(n => n.id === note.id ? note : n)
      );
    } else {
      // Create a new note with a unique ID
      const newNote = {
        ...note,
        id: Date.now().toString(), // Simple ID generation
      };
      setNotes(prevNotes => [...prevNotes, newNote]);
    }
    
    setSelectedNote(null);
    setIsEditingNote(false);
  };
  
  // Handle deleting a note
  const handleDeleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };
  
  // Handle note selection
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditingNote(true);
  };
  
  // Handle creating a new note
  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEditingNote(true);
  };
  
  // Handle canceling note edit
  const handleCancelEdit = () => {
    setSelectedNote(null);
    setIsEditingNote(false);
  };

  return (
    // Removed inline style, relying on .app-container from root.tsx
    <main> 
      <section id="recipe-generator" style={styles.section}>
        <h2>Generate a Recipe</h2>
        {/* Pass handleGenerateRecipe and resetKey to the form component */}
        <RecipeGeneratorForm 
          onGenerate={handleGenerateRecipe} 
          resetKey={formResetKey}
        /> 
        {/* Display error message if any */}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>}
      </section>

      <section id="recipe-display" style={styles.section}>
        <h2>Generated Recipe</h2>
        <div id="recipe-content">
          {isLoading ? (
            <LoadingIndicator message="Generating your delicious recipe..." />
          ) : (
          <RecipeCard 
            recipe={currentRecipe} 
            isLoading={false} // isLoading is handled outside now
            onSave={handleSaveRecipe}
            onNewRecipe={handleNewRecipe}
            reviews={currentRecipe?.id ? recipeReviews[currentRecipe.id] || [] : []}
            onSubmitReview={handleSubmitReview}
          />
          )}
        </div>
      </section>
      
      {/* Section to display saved recipes */}
      <section id="saved-recipes" style={styles.section}>
        <h2>Saved Recipes</h2>
        {savedRecipes.length === 0 ? (
          <p>You haven't saved any recipes yet.</p>
        ) : (
          <div style={styles.savedRecipesList}>
            {savedRecipes.map((savedRecipe, index) => (
              <div key={savedRecipe.id || index} style={styles.savedRecipeItem}>
                <span>{savedRecipe.title}</span>
                <button 
                  onClick={() => setCurrentRecipe(savedRecipe)}
                  style={styles.viewRecipeButton}
                >
                  View Recipe
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="notes-section" style={styles.notesSection}>
        <div style={styles.notesHeader}>
          <h2>My Notes</h2>
          <button 
            onClick={handleCreateNote}
            style={styles.createNoteButton}
          >
            + New Note
          </button>
        </div>
        
        {isEditingNote ? (
          <NoteEditor 
            initialNote={selectedNote || undefined} // Pass undefined if null
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
          />
        ) : (
          <NoteList 
            notes={notes}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </section>
    </main>
  );
}

// Styles
const styles = {
  main: {
    padding: '1rem', 
    maxWidth: '900px', 
    margin: '0 auto',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  section: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  savedRecipesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as React.CSSProperties,
  savedRecipeItem: {
    padding: '0.75rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    border: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  viewRecipeButton: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #8bc34a',
    borderRadius: '4px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  notesSection: {
    marginTop: '3rem', 
    borderTop: '1px solid #ccc', 
    paddingTop: '2rem',
  } as React.CSSProperties,
  notesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  createNoteButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
};
