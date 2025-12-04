import React, { useRef } from 'react';
import { generateRecipePDF, shareRecipe } from '../lib/pdfUtils';
import RecipeReview from './RecipeReview';
import LoadingIndicator from './LoadingIndicator';
import type { Review } from './RecipeReview';

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
}

interface RecipeCardProps {
  recipe: Recipe | null;
  isLoading: boolean;
  onSave?: (recipe: Recipe) => void;
  onNewRecipe?: () => void;
  onEdit?: (recipe: Recipe) => void;
  reviews?: Review[];
  onSubmitReview?: (rating: number, comment: string) => void;
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
  const showLoading = isLoading || isGeneratingImage;

  if (showLoading && !recipe) {
    return <div className="recipe-card__loading">Loading recipe...</div>;
  }

  const recipeCardRef = useRef<HTMLDivElement>(null);

  if (!recipe) {
    return (
      <div className="recipe-card__placeholder">
        Enter ingredients above to generate a recipe.
      </div>
    );
  }

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
    <div ref={recipeCardRef} className="recipe-card">
      {/* Image Section */}
      <div className="recipe-card__image-container">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="recipe-card__image" />
        ) : isGeneratingImage ? (
          <LoadingIndicator message="Generating AI Image..." />
        ) : (
          <div className="recipe-card__image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Recipe Image</span>
          </div>
        )}
      </div>

      {/* Generate Image Button */}
      {recipe && onGenerateImage && !imageUrl && (
        <button
          id="generate-image-button"
          onClick={() => onGenerateImage(recipe.title)}
          className="btn btn--accent recipe-card__generate-btn"
          disabled={isGeneratingImage}
        >
          {isGeneratingImage ? 'Generating...' : 'Generate AI Image'}
        </button>
      )}

      {/* Main Content */}
      <div className="recipe-card__content">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        {recipe.description && (
          <p className="recipe-card__description">{recipe.description}</p>
        )}

        {/* Cooking Info Pills */}
        {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
          <div className="recipe-card__meta">
            {recipe.prepTime && (
              <span className="recipe-card__meta-item">
                <strong>Prep:</strong> {recipe.prepTime}
              </span>
            )}
            {recipe.cookTime && (
              <span className="recipe-card__meta-item">
                <strong>Cook:</strong> {recipe.cookTime}
              </span>
            )}
            {recipe.servings && (
              <span className="recipe-card__meta-item">
                <strong>Serves:</strong> {recipe.servings}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="recipe-card__columns">
        {/* Ingredients */}
        <div className="recipe-card__column">
          <h4 className="recipe-card__section-title">Ingredients</h4>
          <ul className="recipe-card__list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="recipe-card__list-item">{ingredient}</li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="recipe-card__column">
          <h4 className="recipe-card__section-title">Instructions</h4>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <div className="recipe-card__steps">
              {recipe.instructions.map((step, index) => (
                <div key={index} className="recipe-card__step">
                  <span className="recipe-card__step-number">{index + 1}</span>
                  <p className="recipe-card__step-text">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="recipe-card__empty">No instructions provided.</p>
          )}
        </div>
      </div>

      {/* Nutritional Notes */}
      {recipe.nutritionalNotes && recipe.nutritionalNotes.length > 0 && (
        <div className="recipe-card__section">
          <h4 className="recipe-card__section-title">Nutritional Information</h4>
          <ul className="recipe-card__list recipe-card__list--horizontal">
            {recipe.nutritionalNotes.map((note, index) => (
              <li key={index} className="recipe-card__nutrition-item">{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cooking Tips */}
      {recipe.cookingTips && recipe.cookingTips.length > 0 && (
        <div className="recipe-card__section">
          <h4 className="recipe-card__section-title">Cooking Tips</h4>
          <ul className="recipe-card__list">
            {recipe.cookingTips.map((tip, index) => (
              <li key={index} className="recipe-card__tip">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div id="action-buttons-container" className="recipe-card__actions">
        <div className="recipe-card__actions-left">
          <button onClick={handleDownloadPDF} className="btn btn--secondary" title="Download as PDF">
            Download PDF
          </button>
          <button onClick={handleShareRecipe} className="btn btn--secondary" title="Share Recipe">
            Share
          </button>
        </div>
        <div className="recipe-card__actions-right">
          {onSave && (
            <button onClick={() => onSave(recipe)} className="btn btn--primary">
              Save Recipe
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(recipe)} className="btn btn--accent">
              Edit Recipe
            </button>
          )}
          {onNewRecipe && (
            <button onClick={onNewRecipe} className="btn btn--secondary">
              New Recipe
            </button>
          )}
        </div>
      </div>

      {/* Recipe Reviews */}
      {recipe && onSubmitReview && (
        <RecipeReview
          existingReviews={reviews}
          onSubmitReview={onSubmitReview}
        />
      )}
    </div>
  );
};

export default RecipeCard;
