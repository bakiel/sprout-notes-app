import React, { useState, useEffect } from 'react';
import useRecipeGenerator from '../lib/hooks/useRecipeGenerator';
import type { GenerateRecipeParams, Recipe } from '../lib/hooks/useRecipeGenerator';

interface RecipeGeneratorFormProps {
  onRecipeGenerated: (recipe: Recipe | null) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onError: (error: string | null) => void;
  onGenerationStart?: () => void;
  resetKey?: number;
}

const MEAL_TYPES = ["Any", "Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Side Dish", "Main Course"];

const RecipeGeneratorForm: React.FC<RecipeGeneratorFormProps> = ({
  onRecipeGenerated,
  onLoadingChange,
  onError,
  onGenerationStart,
  resetKey = 0
}) => {
  const { recipe, isLoading, error, generateRecipe } = useRecipeGenerator();

  const [ingredients, setIngredients] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [cuisineType, setCuisineType] = useState('');
  const [mealType, setMealType] = useState<string>('');
  const [servingSize, setServingSize] = useState<number>(2);
  const [isValid, setIsValid] = useState(false);

  const checkFormValidity = () => {
    const valid = ingredients.trim().length >= 3;
    setIsValid(valid);
    return valid;
  };

  useEffect(() => {
    checkFormValidity();
  }, [ingredients]);

  useEffect(() => {
    onRecipeGenerated(recipe);
  }, [recipe, onRecipeGenerated]);

  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    onError(error);
  }, [error, onError]);

  useEffect(() => {
    if (resetKey > 0) {
      setIngredients('');
      setRestrictions([]);
      setCuisineType('');
      setMealType('');
      setServingSize(2);
      setIsValid(false);
    }
  }, [resetKey]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setRestrictions(prev =>
      checked ? [...prev, name] : prev.filter(r => r !== name)
    );
  };

  const handleServingSizeChange = (newSize: number) => {
    const validSize = Math.max(1, Math.min(10, newSize));
    setServingSize(validSize);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!checkFormValidity()) {
      return;
    }

    const params: GenerateRecipeParams = {
      ingredients: ingredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0),
      dietaryRestrictions: restrictions,
      cuisineType: cuisineType || undefined,
      mealType: mealType && mealType !== "Any" ? mealType : undefined,
      servingSize: servingSize,
    };

    if (onGenerationStart) {
      onGenerationStart();
    }

    generateRecipe(params);
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-form card">
      <div className="form-group">
        <label htmlFor="ingredients">Enter Ingredients (comma-separated):</label>
        <textarea
          id="ingredients"
          name="ingredients"
          rows={4}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
          className={`form-textarea ${!isValid && ingredients.trim().length > 0 ? 'form-textarea--error' : ''}`}
          placeholder="e.g., tofu, broccoli, soy sauce, rice vinegar, ginger..."
        />
        {!isValid && ingredients.trim().length > 0 && (
          <div className="form-error">Please enter at least one valid ingredient (minimum 3 characters)</div>
        )}
      </div>

      <fieldset className="form-fieldset">
        <legend>Dietary Restrictions (Optional):</legend>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="gluten-free"
              checked={restrictions.includes('gluten-free')}
              onChange={handleCheckboxChange}
            />
            <span>Gluten-Free</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="oil-free"
              checked={restrictions.includes('oil-free')}
              onChange={handleCheckboxChange}
            />
            <span>Oil-Free</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="nut-free"
              checked={restrictions.includes('nut-free')}
              onChange={handleCheckboxChange}
            />
            <span>Nut-Free</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="soy-free"
              checked={restrictions.includes('soy-free')}
              onChange={handleCheckboxChange}
            />
            <span>Soy-Free</span>
          </label>
        </div>
      </fieldset>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cuisineType">Cuisine Type (Optional):</label>
          <select
            id="cuisineType"
            name="cuisineType"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
          >
            <option value="">Any Cuisine</option>
            <option value="african">African</option>
            <option value="american">American</option>
            <option value="asian">Asian</option>
            <option value="indian">Indian</option>
            <option value="italian">Italian</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="mexican">Mexican</option>
            <option value="middle-eastern">Middle Eastern</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mealType">Meal Type (Optional):</label>
          <select
            id="mealType"
            name="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            {MEAL_TYPES.map(type => (
              <option key={type} value={type === "Any" ? "" : type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="servingSize">Serving Size:</label>
        <div className="serving-size-control">
          <button
            type="button"
            onClick={() => handleServingSizeChange(servingSize - 1)}
            className="serving-btn"
            aria-label="Decrease serving size"
          >
            -
          </button>
          <input
            id="servingSize"
            type="number"
            min="1"
            max="10"
            value={servingSize}
            onChange={(e) => handleServingSizeChange(parseInt(e.target.value) || 1)}
            className="serving-input"
          />
          <button
            type="button"
            onClick={() => handleServingSizeChange(servingSize + 1)}
            className="serving-btn"
            aria-label="Increase serving size"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="submit"
        className={`btn btn--primary btn-lg submit-btn ${!isValid ? 'btn--disabled' : ''}`}
        disabled={!isValid}
      >
        {isLoading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </form>
  );
};

export default RecipeGeneratorForm;
