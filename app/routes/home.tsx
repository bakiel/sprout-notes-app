import React, { useState, useEffect } from 'react';
import RecipeGeneratorForm from '../components/RecipeGeneratorForm'; 
import RecipeCard from '../components/RecipeCard';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import LoadingIndicator from '../components/LoadingIndicator';
import Notification from '../components/Notification'; // Import Notification component
import { supabase } from '../lib/supabaseClient';
import { editRecipe, generateRecipeImage } from '../lib/api/recipeGenerator'; // Import API functions
import type { Review } from '../components/RecipeReview';
import type { Recipe } from '../lib/hooks/useRecipeGenerator'; // Import Recipe type from hook

// Define types
interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[]; // Added tags field
  category?: string; // Added category field
  relatedRecipeId?: string;
}

// Updated meta function (using generic type for args)
export function meta(args: any) {
  return [
    { title: "Sprout Notes 🌱 - AI Vegan Recipes & Notes" },
    { name: "description", content: "Generate vegan recipes and organise your cooking notes with AI." },
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
  const [isEditingRecipe, setIsEditingRecipe] = useState<boolean>(false);
  const [editInstructions, setEditInstructions] = useState<string>('');
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  // Reviews state
  const [recipeReviews, setRecipeReviews] = useState<{[recipeId: string]: Review[]}>({});
  
  // Image Generation State
  const [recipeImage, setRecipeImage] = useState<string | null>(null); // Store as data URI
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Clear potentially corrupted notes data on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("Attempting to clear potentially corrupted notes data from localStorage...");
      localStorage.removeItem(NOTES_STORAGE_KEY);
      console.log("Notes data cleared from localStorage.");
      // Reload the page to ensure clean state (optional, but can help)
      // window.location.reload(); 
    }
  }, []); // Empty dependency array ensures this runs only once on mount

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
    // Clear any errors and notifications
    setError(null);
    setNotification(null);
    setRecipeImage(null); // Clear image when starting new recipe
    setImageError(null);
  };

  // Handle deleting a saved recipe
  const handleDeleteRecipe = (recipeIdToDelete: string) => {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeIdToDelete));
    // Optionally, if the deleted recipe is the currently viewed one, clear it
    if (currentRecipe?.id === recipeIdToDelete) {
      setCurrentRecipe(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CURRENT_RECIPE_STORAGE_KEY);
      }
    }
    setNotification({ message: 'Recipe deleted successfully!', type: 'info' });
    console.log("Recipe deleted:", recipeIdToDelete);
    // Also clear image if the deleted recipe was the current one
    if (currentRecipe?.id === recipeIdToDelete) {
       setRecipeImage(null);
       setImageError(null);
    }
  };

  // Handle editing a recipe
  const handleEditRecipe = (recipe: Recipe) => {
    if (!recipe) return;
    setIsEditingRecipe(true);
    setEditInstructions('');
  };
  
  // Handle applying AI-assisted recipe edits
  const handleApplyRecipeEdit = async () => {
    if (!currentRecipe || !editInstructions.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First try using OpenRouter proxy Edge Function (only if Supabase is configured)
      try {
        if (!supabase) {
          throw new Error("Supabase not configured, using direct API");
        }
        console.log("Attempting to use OpenRouter proxy for recipe editing...");
        const { data, error: functionError } = await supabase.functions.invoke('openrouter-proxy', {
          body: {
            action: 'edit',
            recipe: currentRecipe,
            editInstructions: editInstructions,
          },
        });

        if (functionError) {
          throw functionError;
        }

        if (!data || typeof data !== 'object' || !data.recipe) {
          throw new Error("Invalid response format from recipe editor.");
        }

        // Ensure the recipe ID is preserved
        const editedRecipe = {
          ...data.recipe as Recipe,
          id: currentRecipe.id
        };

        setCurrentRecipe(editedRecipe);
        console.log("Successfully edited recipe using OpenRouter proxy (DeepSeek V3.2)");

      } catch (proxyError: any) {
        // If OpenRouter proxy Edge Function fails, try direct API call
        console.error("Error calling OpenRouter proxy for editing:", proxyError);
        console.log("Falling back to direct OpenRouter API call for recipe editing...");
        
        // Call OpenRouter API directly as a fallback
        const editedRecipe = await editRecipe({
          recipe: currentRecipe,
          editInstructions: editInstructions
        });

        // Ensure the recipe ID is preserved
        if (currentRecipe.id && !editedRecipe.id) {
          editedRecipe.id = currentRecipe.id;
        }

        setCurrentRecipe(editedRecipe);
        console.log("Successfully edited recipe using direct OpenRouter API (DeepSeek V3.2)");
      }
      setNotification({ message: 'Recipe edited successfully!', type: 'success' });
    } catch (err: any) {
      console.error("Recipe editing failed:", err);
      const errorMsg = `Failed to edit recipe: ${err.message || 'Unknown error'}`;
      setError(errorMsg);
      setNotification({ message: errorMsg, type: 'error' });
    } finally {
      setIsLoading(false);
      setIsEditingRecipe(false);
      setEditInstructions('');
    }
  };

  // Handle saving the currently displayed recipe
  const handleSaveRecipe = (recipeToSave: Recipe) => {
    // Ensure recipe has an ID
    if (!recipeToSave.id) {
      recipeToSave.id = `recipe-${Date.now()}`;
    }
    
    // Check if recipe already exists (check by ID if available, otherwise by title)
    const alreadyExists = savedRecipes.some(r => (r.id && recipeToSave.id && r.id === recipeToSave.id) || r.title === recipeToSave.title);
    
    if (!alreadyExists) {
      setSavedRecipes(prev => [...prev, recipeToSave]);
      setNotification({ message: 'Recipe saved successfully!', type: 'success' });
      console.log("Recipe saved:", recipeToSave.title);
    } else {
      setNotification({ message: 'Recipe is already saved.', type: 'info' });
      console.log("Recipe already saved:", recipeToSave.title);
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
    setNotification({ message: 'Review submitted!', type: 'success' });
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
    setNotification({ message: note.id ? 'Note updated!' : 'Note saved!', type: 'success' });
    setSelectedNote(null);
    setIsEditingNote(false);
  };
  
  // Handle deleting a note
  const handleDeleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    setNotification({ message: 'Note deleted.', type: 'info' });
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

  // Handle generating an AI image for the current recipe using OpenRouter
  const handleGenerateImage = async (recipeTitle: string) => {
    if (!recipeTitle) return;

    console.log(`Generating AI image for: ${recipeTitle}`);
    setIsGeneratingImage(true);
    setImageError(null);
    setRecipeImage(null); // Clear previous image
    setNotification({ message: 'Generating AI recipe image...', type: 'info' });

    try {
      // First try to use OpenRouter AI image generation (Nano Banana Pro)
      const ingredients = currentRecipe?.ingredients || [];
      const aiImageUrl = await generateRecipeImage(recipeTitle, ingredients);

      if (aiImageUrl) {
        setRecipeImage(aiImageUrl);
        setNotification({
          message: 'AI image generated successfully!',
          type: 'success'
        });
        return;
      }

      // Fallback to Unsplash if AI generation fails
      console.log("AI image generation failed, falling back to Unsplash...");
      const searchQuery = `vegan ${recipeTitle} food dish`;
      const encodedQuery = encodeURIComponent(searchQuery);

      try {
        const unsplashUrl = `https://source.unsplash.com/random/800x600/?${encodedQuery}`;
        const unsplashResponse = await fetch(unsplashUrl, { method: 'GET' });

        if (unsplashResponse.ok && unsplashResponse.url) {
          setRecipeImage(unsplashResponse.url);
          setNotification({
            message: 'Image fetched from Unsplash (AI generation unavailable)',
            type: 'info'
          });
          return;
        }
      } catch (unsplashError) {
        console.warn("Unsplash fallback failed:", unsplashError);
      }

      // Final fallback - use placeholder
      setRecipeImage("/icons/icon-192x192.png");
      setImageError("Could not generate or fetch image");
      setNotification({
        message: "Using placeholder image - please try again later",
        type: 'info'
      });
    } catch (err: any) {
      console.error("Image generation failed:", err);
      setRecipeImage("/icons/icon-192x192.png");
      setImageError(`Could not generate image: ${err.message || 'Unknown error'}`);
      setNotification({
        message: "Using placeholder image - please try again later",
        type: 'info'
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };


  return (
    // Removed inline style, relying on .app-container from root.tsx
    <main> 
      <section id="recipe-generator" style={styles.section}>
        <h2>Generate a Recipe</h2>
        {/* Use the new props for the form component */}
        <RecipeGeneratorForm 
          onRecipeGenerated={setCurrentRecipe} 
          onLoadingChange={setIsLoading}     
          onError={(errMsg) => {
            setError(errMsg);
            if (errMsg) {
              setNotification({ message: errMsg, type: 'error' });
            }
          }}
          // Clear image when generation starts
          onGenerationStart={() => {
            setRecipeImage(null); 
            setImageError(null);
          }}
          resetKey={formResetKey}
        />
        {/* Error display is now handled by the notification system */}
        {/* {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>} */}
      </section>

      <section id="recipe-display" style={styles.section}>
        <h2>Generated Recipe</h2>
        <div id="recipe-content">
          {isLoading ? (
            <LoadingIndicator message="Generating your delicious recipe..." />
          ) : (
            isEditingRecipe ? (
              <div style={styles.editRecipeContainer}>
                <h3 style={styles.editRecipeTitle}>Edit Recipe</h3>
                <p style={styles.editRecipeInstructions}>
                  Describe how you'd like to modify the recipe. For example: "Make it spicier", 
                  "Reduce the cooking time", "Add more protein", "Make it oil-free", etc.
                </p>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="Enter your editing instructions here..."
                  style={styles.editInstructionsTextarea}
                />
                <div style={styles.editButtonsContainer}>
                  <button 
                    onClick={handleApplyRecipeEdit}
                    disabled={!editInstructions.trim()}
                    style={{
                      ...styles.applyEditButton,
                      opacity: !editInstructions.trim() ? 0.5 : 1,
                      cursor: !editInstructions.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Apply Changes
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingRecipe(false);
                      setEditInstructions('');
                    }}
                    style={styles.cancelEditButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <RecipeCard 
                recipe={currentRecipe} 
                isLoading={false} // isLoading is handled outside now
                onSave={handleSaveRecipe}
                onNewRecipe={handleNewRecipe}
                onEdit={handleEditRecipe}
                reviews={currentRecipe?.id ? recipeReviews[currentRecipe.id] || [] : []}
                onSubmitReview={handleSubmitReview}
                // Pass image generation props
                imageUrl={recipeImage}
                isGeneratingImage={isGeneratingImage}
                onGenerateImage={handleGenerateImage}
              />
            )
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
                <span style={styles.savedRecipeTitle}>
                  {savedRecipe.title}
                  {savedRecipe.category && <span style={styles.categoryTag}>{savedRecipe.category}</span>}
                </span>
                <div style={styles.savedRecipeButtons}>
                  <button 
                    onClick={() => setCurrentRecipe(savedRecipe)}
                  style={styles.viewRecipeButton}
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteRecipe(savedRecipe.id!)} // Assuming ID always exists here
                  style={styles.deleteRecipeButton}
                  aria-label={`Delete ${savedRecipe.title}`}
                >
                    Delete
                  </button>
                </div>
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
            initialNote={selectedNote || undefined} 
            currentRecipeId={currentRecipe?.id} // Pass current recipe ID
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
      
      {/* Render Notification component */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
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
  savedRecipeTitle: {
    flexGrow: 1, // Allow title to take up available space
    marginRight: '1rem', // Add space between title and buttons
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  categoryTag: {
    backgroundColor: '#e0e0e0', // Grey background
    color: '#555',
    padding: '0.2rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: 500,
  } as React.CSSProperties,
  savedRecipeButtons: {
    display: 'flex',
    gap: '0.5rem', // Space between view and delete buttons
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
  deleteRecipeButton: {
    backgroundColor: '#ffebee', // Light Red
    color: '#c62828', // Red text
    border: '1px solid #ef9a9a',
    borderRadius: '4px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: '0.5rem', // Add some space between buttons
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
  // Recipe editing styles
  editRecipeContainer: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  editRecipeTitle: {
    fontFamily: "'Montserrat', sans-serif",
    color: '#ff8f00', // Amber color to match edit button
    marginBottom: '1rem',
    borderBottom: '2px solid #ffca28',
    paddingBottom: '0.5rem',
  } as React.CSSProperties,
  editRecipeInstructions: {
    marginBottom: '1rem',
    lineHeight: '1.5',
  } as React.CSSProperties,
  editInstructionsTextarea: {
    width: '100%',
    minHeight: '150px',
    padding: '0.8rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '0.95rem',
    marginBottom: '1rem',
    resize: 'vertical',
  } as React.CSSProperties,
  editButtonsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
  } as React.CSSProperties,
  applyEditButton: {
    backgroundColor: '#ff8f00', // Amber
    color: 'white',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  cancelEditButton: {
    backgroundColor: '#f5f5f5',
    color: '#555',
    padding: '0.6rem 1.2rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
};
