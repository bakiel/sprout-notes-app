import React from 'react';
import RecipeReview from './RecipeReview';
import type { Review } from './RecipeReview';

// Define a type for the recipe data (adjust as needed based on API response)
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

interface RecipeCardProps {
  recipe: Recipe | null; // Allow null when no recipe is generated yet
  isLoading: boolean;
  onSave?: (recipe: Recipe) => void; // Optional save handler
  onNewRecipe?: () => void; // Optional handler for creating a new recipe
  onEdit?: (recipe: Recipe) => void; // Optional handler for editing a recipe
  reviews?: Review[]; // Array of reviews for this recipe
  onSubmitReview?: (rating: number, comment: string) => void; // Handler for submitting a review
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  isLoading, 
  onSave, 
  onNewRecipe, 
  onEdit,
  reviews = [], 
  onSubmitReview 
}) => {
  if (isLoading) {
    return <div style={styles.loading}>Loading recipe...</div>;
  }

  if (!recipe) {
    return <div style={styles.placeholder}>Enter ingredients above to generate a recipe.</div>;
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{recipe.title}</h3>
      {recipe.description && <p style={styles.description}>{recipe.description}</p>}
      
      {/* Add prepTime, cookTime, servings display if available */}

      <h4 style={styles.subheading}>Ingredients</h4>
      <ul style={styles.list}>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index} style={styles.listItem}>{ingredient}</li>
        ))}
      </ul>

      <h4 style={styles.subheading}>Instructions</h4>
      {/* Ensure instructions exist and have items before mapping */}
      {recipe.instructions && recipe.instructions.length > 0 ? (
        <div style={styles.instructionsContainer}>
          {recipe.instructions.map((step, index) => (
            <div key={index} style={styles.instructionStep}>
              <div style={styles.stepNumber}>{index + 1}</div>
              <div style={styles.stepContent}>
                <p style={styles.stepText}>{step}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.placeholder}>No instructions provided.</p>
      )}
      
      {/* Optional timing information */}
      {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
        <div style={styles.cookingInfo}>
          {recipe.prepTime && (
            <div style={styles.cookingInfoItem}>
              <strong>Prep Time:</strong> {recipe.prepTime}
            </div>
          )}
          {recipe.cookTime && (
            <div style={styles.cookingInfoItem}>
              <strong>Cook Time:</strong> {recipe.cookTime}
            </div>
          )}
          {recipe.servings && (
            <div style={styles.cookingInfoItem}>
              <strong>Servings:</strong> {recipe.servings}
            </div>
          )}
        </div>
      )}
      
      {/* Nutritional Notes Section */}
      {recipe.nutritionalNotes && recipe.nutritionalNotes.length > 0 && (
        <>
          <h4 style={styles.subheading}>Nutritional Information</h4>
          <ul style={styles.list}>
            {recipe.nutritionalNotes.map((note, index) => (
              <li key={index} style={styles.listItem}>{note}</li>
            ))}
          </ul>
        </>
      )}
      
      {/* Cooking Tips Section */}
      {recipe.cookingTips && recipe.cookingTips.length > 0 && (
        <>
          <h4 style={styles.subheading}>Cooking Tips</h4>
          <ul style={styles.list}>
            {recipe.cookingTips.map((tip, index) => (
              <li key={index} style={styles.listItem}>{tip}</li>
            ))}
          </ul>
        </>
      )}
      
      {/* Action Buttons */}
      <div style={styles.actionButtonsContainer}>
        {onSave && (
          <button 
            onClick={() => onSave(recipe)} 
            style={styles.saveButton}
          >
            Save Recipe
          </button>
        )}
        
        {onEdit && (
          <button 
            onClick={() => onEdit(recipe)} 
            style={styles.editButton}
          >
            Edit Recipe
          </button>
        )}
        
        {onNewRecipe && (
          <button 
            onClick={onNewRecipe} 
            style={styles.newRecipeButton}
          >
            New Recipe
          </button>
        )}
      </div>
      
      {/* Recipe Reviews Section - only show for non-null recipes */}
      {recipe && onSubmitReview && (
        <RecipeReview 
          existingReviews={reviews}
          onSubmitReview={onSubmitReview}
        />
      )}
    </div>
  );
};

// Basic inline styles
const styles = {
  card: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  cookingInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  } as React.CSSProperties,
  cookingInfoItem: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  title: {
    fontFamily: "'Montserrat', sans-serif",
    color: '#1b5e20', // Dark Green
    marginBottom: '1rem',
    borderBottom: '2px solid #8bc34a', // Light Green
    paddingBottom: '0.5rem',
  } as React.CSSProperties,
  description: {
    marginBottom: '1rem',
    fontStyle: 'italic',
    color: '#555',
  } as React.CSSProperties,
  subheading: {
    fontFamily: "'Montserrat', sans-serif",
    color: '#2e7d32', // Primary Green
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  list: {
    paddingLeft: '1.5rem', // Indent list items
    marginBottom: '1rem',
  } as React.CSSProperties,
  listItem: {
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  } as React.CSSProperties,
  instructionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  instructionStep: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  stepNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    backgroundColor: '#2e7d32',
    color: 'white',
    borderRadius: '50%',
    fontWeight: 'bold',
    flexShrink: 0,
  } as React.CSSProperties,
  stepContent: {
    flex: 1,
  } as React.CSSProperties,
  stepText: {
    margin: 0,
    lineHeight: '1.6',
  } as React.CSSProperties,
  placeholder: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    fontStyle: 'italic',
  } as React.CSSProperties,
  loading: {
     textAlign: 'center',
    padding: '2rem',
    color: '#2e7d32',
    fontWeight: 600,
  } as React.CSSProperties,
  actionButtonsContainer: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
  } as React.CSSProperties,
  saveButton: {
    backgroundColor: '#8bc34a', // Light Green
    color: '#1b5e20', // Dark Green text
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as React.CSSProperties,
  editButton: {
    backgroundColor: '#fff8e1', // Light Amber
    color: '#ff8f00', // Amber text
    padding: '0.6rem 1.2rem',
    border: '1px solid #ffca28',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  newRecipeButton: {
    backgroundColor: '#e8f5e9', // Very Light Green
    color: '#2e7d32', // Green text
    padding: '0.6rem 1.2rem',
    border: '1px solid #8bc34a',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
};

export default RecipeCard;
