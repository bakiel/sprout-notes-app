import React, { useRef } from 'react';
import { generateRecipePDF, shareRecipe } from '../lib/pdfUtils';
import RecipeReview from './RecipeReview';
import LoadingIndicator from './LoadingIndicator'; // Import LoadingIndicator
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
  // Props for image generation
  imageUrl?: string | null;
  isGeneratingImage?: boolean;
  onGenerateImage?: (title: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  isLoading, 
  onSave, 
  onNewRecipe, 
  onEdit,
  reviews = [], 
  onSubmitReview,
  imageUrl = null,
  isGeneratingImage = false,
  onGenerateImage
}) => {
  // Combine recipe loading and image loading states for the main loading indicator
  const showLoading = isLoading || isGeneratingImage;

  if (showLoading && !recipe) { // Show full loading only if no recipe is displayed yet
    return <div style={styles.loading}>Loading recipe...</div>;
  }

  // Create a ref for the recipe card element for PDF generation
  const recipeCardRef = useRef<HTMLDivElement>(null);

  if (!recipe) {
    return <div style={styles.placeholder}>Enter ingredients above to generate a recipe.</div>;
  }

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (recipeCardRef.current && recipe) {
      try {
        await generateRecipePDF(recipeCardRef.current, recipe.title);
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        alert('Could not generate PDF. Please try again.');
      }
    }
  };

  // Handle recipe sharing
  const handleShareRecipe = async () => {
    if (recipe) {
      try {
        await shareRecipe({
          name: recipe.title,
          description: recipe.description
        });
      } catch (error) {
        console.error('Failed to share recipe:', error);
        alert('Could not share recipe. Please try again.');
      }
    }
  };

  return (
    <div ref={recipeCardRef} style={styles.card}>
      {/* Image Placeholder / Display */}
      <div style={styles.imagePlaceholder}>
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} style={styles.recipeImage} />
        ) : isGeneratingImage ? (
          <LoadingIndicator message="Generating Image..." />
        ) : (
          <span>Recipe Image Placeholder</span>
        )}
      </div>

       {/* Generate Image Button (only if recipe exists and handler provided) */}
       {recipe && onGenerateImage && !imageUrl && (
         <button
           id="generate-image-button" // Added ID
           onClick={() => onGenerateImage(recipe.title)} 
           style={styles.generateImageButton}
           disabled={isGeneratingImage}
         >
           {isGeneratingImage ? 'Generating...' : 'Generate Recipe Image'}
         </button>
       )}

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <h3 style={styles.title}>{recipe.title}</h3>
        {recipe.description && <p style={styles.description}>{recipe.description}</p>}

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
      </div>

      {/* Two-Column Layout for Ingredients & Instructions */}
      <div style={styles.columnsContainer}>
        {/* Left Column: Ingredients */}
        <div style={styles.column}>
          <h4 style={styles.subheading}>Ingredients</h4>
          <ul style={styles.list}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} style={styles.listItem}>{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* Right Column: Instructions */}
        <div style={styles.column}>
          <h4 style={styles.subheading}>Instructions</h4>
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
        </div>
      </div>

      {/* Nutritional Notes Section (Below Columns) */}
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
      <div id="action-buttons-container" style={styles.actionButtonsContainer}> {/* Added ID */}
        <div style={styles.leftButtons}>
          <button 
            onClick={handleDownloadPDF} 
            style={styles.pdfButton}
            title="Download as PDF"
          >
            Download PDF
          </button>
          
          <button 
            onClick={handleShareRecipe} 
            style={styles.shareButton}
            title="Share Recipe"
          >
            Share
          </button>
        </div>
        
        <div style={styles.rightButtons}>
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
    padding: '2rem', // Increased padding
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Slightly stronger shadow
    maxWidth: '900px', // Wider max-width for better layout
    margin: '2rem auto', // More margin
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  imagePlaceholder: {
    width: '100%',
    height: '250px', // Adjust height as needed
    backgroundColor: '#e0e0e0', // Light grey placeholder
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    fontSize: '1.2rem',
    fontStyle: 'italic',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  mainContent: {
    marginBottom: '1.5rem', // Space before columns
  } as React.CSSProperties,
  cookingInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #eee', // Subtle border
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
    textAlign: 'center', // Center title
    fontSize: '1.8rem', // Larger title
  } as React.CSSProperties,
  description: {
    marginBottom: '1rem',
    fontStyle: 'italic',
    color: '#555',
  } as React.CSSProperties,
  subheading: {
    fontFamily: "'Montserrat', sans-serif",
    // color: '#2e7d32', // Primary Green - REMOVED DUPLICATE
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    fontSize: '1.2rem', // Slightly larger subheading
    color: '#1b5e20', // Darker green for subheadings
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '0.3rem',
  } as React.CSSProperties,
  columnsContainer: {
    display: 'flex',
    gap: '2rem', // Space between columns
    marginBottom: '1.5rem',
    flexWrap: 'wrap', // Allow wrapping on smaller screens if needed
  } as React.CSSProperties,
  column: {
    flex: 1, // Each column takes equal space
    minWidth: '300px', // Minimum width before wrapping
  } as React.CSSProperties,
  list: {
    paddingLeft: '1.5rem', // Indent list items
    marginBottom: '1rem',
    listStylePosition: 'outside', // Ensure bullets/numbers are outside padding
  } as React.CSSProperties,
  listItem: {
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  } as React.CSSProperties,
  instructionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem', // Reduced gap for tighter steps
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
    // width: '2rem', // REMOVED DUPLICATE
    // height: '2rem', // REMOVED DUPLICATE
    backgroundColor: '#2e7d32',
    color: 'white',
    borderRadius: '50%',
    fontWeight: 'bold',
    flexShrink: 0,
    fontSize: '0.9rem', // Smaller number
    width: '1.8rem', // Adjust size
    height: '1.8rem', // Adjust size
  } as React.CSSProperties,
  stepContent: {
    flex: 1,
  } as React.CSSProperties,
  stepText: {
    margin: 0,
    lineHeight: '1.6',
    fontSize: '0.95rem', // Slightly smaller instruction text
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
    fontStyle: 'italic', // Italicize loading text
  } as React.CSSProperties,
  actionButtonsContainer: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties,
  leftButtons: {
    display: 'flex',
    gap: '0.5rem',
  } as React.CSSProperties,
  rightButtons: {
    display: 'flex',
    gap: '0.5rem',
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
  pdfButton: {
    backgroundColor: '#e3f2fd', // Light Blue
    color: '#1565c0', // Blue text
    padding: '0.6rem 1.2rem',
    border: '1px solid #90caf9',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  shareButton: {
    backgroundColor: '#f3e5f5', // Light Purple
    color: '#7b1fa2', // Purple text
    padding: '0.6rem 1.2rem',
    border: '1px solid #ce93d8',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
  recipeImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Cover the area without distortion
    borderRadius: '8px', // Match placeholder rounding
  } as React.CSSProperties,
  generateImageButton: {
    display: 'block', // Make it block level
    margin: '1rem auto 1.5rem auto', // Center it with margin
    padding: '0.6rem 1.2rem',
    backgroundColor: '#673ab7', // Deep Purple
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: 1, // Default opacity
    // Style for disabled state
    // In real CSS: '&:disabled': { opacity: 0.6, cursor: 'not-allowed' }
  } as React.CSSProperties,
};

export default RecipeCard;
