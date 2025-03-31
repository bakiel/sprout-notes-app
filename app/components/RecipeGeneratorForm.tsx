import React, { useState, useEffect } from 'react';
import useRecipeGenerator from '../lib/hooks/useRecipeGenerator'; // Import the hook
import type { GenerateRecipeParams, Recipe } from '../lib/hooks/useRecipeGenerator'; // Import types separately

// Define props interface
interface RecipeGeneratorFormProps {
  onRecipeGenerated: (recipe: Recipe | null) => void; // Callback for when a recipe is generated
  onLoadingChange: (isLoading: boolean) => void; // Callback for loading state changes
  onError: (error: string | null) => void; // Callback for errors
  resetKey?: number; // Optional key to force re-render and reset form
}

const RecipeGeneratorForm: React.FC<RecipeGeneratorFormProps> = ({ 
  onRecipeGenerated, 
  onLoadingChange, 
  onError, 
  resetKey = 0 
}) => {
  // Use the custom hook
  const { recipe, isLoading, error, generateRecipe } = useRecipeGenerator();

  const [ingredients, setIngredients] = useState('');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [cuisineType, setCuisineType] = useState('');
  const [servingSize, setServingSize] = useState<number>(2); // Default to 2 servings
  
  // Simple validation state
  const [isValid, setIsValid] = useState(false);

  // Check if form is valid
  const checkFormValidity = () => {
    // Form is valid if ingredients are not empty
    const valid = ingredients.trim().length >= 3;
    console.log("Form validity check:", valid);
    setIsValid(valid);
    return valid;
  };

  // Check validity whenever ingredients change
  useEffect(() => {
    checkFormValidity();
  }, [ingredients]);

  // Propagate state changes from the hook to the parent component
  useEffect(() => {
    onRecipeGenerated(recipe);
  }, [recipe, onRecipeGenerated]);

  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    onError(error);
  }, [error, onError]);

  // Reset form when resetKey changes
  useEffect(() => {
    if (resetKey > 0) {
      // Reset form to initial state
      setIngredients('');
      setRestrictions([]);
      setCuisineType('');
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

  // Function to handle serving size changes
  const handleServingSizeChange = (newSize: number) => {
    // Ensure serving size is between 1 and 10
    const validSize = Math.max(1, Math.min(10, newSize));
    setServingSize(validSize);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Check form validity
    if (!checkFormValidity()) {
      console.log("Form submission blocked - invalid form");
      return; // Don't submit if validation fails
    }
    
    console.log("Form submitted successfully");
    
    // Prepare parameters for the hook
    const params: GenerateRecipeParams = {
      // Split ingredients string into an array, trimming whitespace and filtering empty strings
      ingredients: ingredients.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0),
      dietaryRestrictions: restrictions,
      cuisineType: cuisineType || undefined, // Pass undefined if empty
      servingSize: servingSize,
    };
    
    // Call the generateRecipe function from the hook
    generateRecipe(params);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <label htmlFor="ingredients" style={styles.label}>
        Enter Ingredients (comma-separated):
      </label>
      <textarea
        id="ingredients"
        name="ingredients"
        rows={4}
        value={ingredients}
        onChange={(e) => {
          setIngredients(e.target.value);
        }}
        required
        style={{
          ...styles.textarea,
          border: !isValid && ingredients.trim().length > 0 ? '1px solid #d32f2f' : '1px solid #ccc',
        }}
        placeholder="e.g., tofu, broccoli, soy sauce, rice vinegar, ginger..."
      />
      {!isValid && ingredients.trim().length > 0 && (
        <div style={styles.errorText}>Please enter at least one valid ingredient (minimum 3 characters)</div>
      )}

      <fieldset style={styles.fieldset}>
        <legend style={styles.legend}>Dietary Restrictions (Optional):</legend>
        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="gluten-free" 
              checked={restrictions.includes('gluten-free')}
              onChange={handleCheckboxChange} 
            /> Gluten-Free
          </label>
          <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="oil-free" 
              checked={restrictions.includes('oil-free')}
              onChange={handleCheckboxChange} 
            /> Oil-Free
          </label>
          <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="nut-free" 
              checked={restrictions.includes('nut-free')}
              onChange={handleCheckboxChange} 
            /> Nut-Free
          </label>
           <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              name="soy-free" 
              checked={restrictions.includes('soy-free')}
              onChange={handleCheckboxChange} 
            /> Soy-Free
          </label>
        </div>
      </fieldset>
      
      <label htmlFor="cuisineType" style={styles.label}>
        Cuisine Type (Optional):
      </label>
      <select
        id="cuisineType"
        name="cuisineType"
        value={cuisineType}
        onChange={(e) => setCuisineType(e.target.value)}
        style={styles.select}
      >
        <option value="">Any Cuisine</option>
        <option value="asian">Asian</option>
        <option value="mediterranean">Mediterranean</option>
        <option value="mexican">Mexican</option>
        <option value="indian">Indian</option>
        <option value="italian">Italian</option>
        <option value="middle-eastern">Middle Eastern</option>
        <option value="american">American</option>
        <option value="african">African</option>
      </select>
      
      {/* Serving Size Adjuster */}
      <label htmlFor="servingSize" style={styles.label}>
        Serving Size:
      </label>
      <div style={styles.servingSizeContainer}>
        <button 
          type="button" 
          onClick={() => handleServingSizeChange(servingSize - 1)}
          style={styles.servingSizeButton}
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
          style={styles.servingSizeInput}
        />
        <button 
          type="button" 
          onClick={() => handleServingSizeChange(servingSize + 1)}
          style={styles.servingSizeButton}
          aria-label="Increase serving size"
        >
          +
        </button>
      </div>

      <button 
        type="submit" 
        style={{
          ...styles.button,
          opacity: !isValid ? 0.7 : 1,
          cursor: !isValid ? 'not-allowed' : 'pointer',
        }}
        disabled={!isValid}
        onClick={() => console.log("Button clicked, isValid:", isValid)}
      >
        {isLoading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </form>
  );
};

export default RecipeGeneratorForm;

// Basic inline styles
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,
  label: {
    fontWeight: 600,
    fontFamily: "'Montserrat', sans-serif",
    color: '#1b5e20', // Dark Green
  } as React.CSSProperties,
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
  } as React.CSSProperties,
  select: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  fieldset: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '1rem',
  } as React.CSSProperties,
  legend: {
    fontWeight: 600,
    fontFamily: "'Montserrat', sans-serif",
    color: '#1b5e20', // Dark Green
    padding: '0 0.5rem',
  } as React.CSSProperties,
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  } as React.CSSProperties,
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  // Serving size styles
  servingSizeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: '200px',
  } as React.CSSProperties,
  servingSizeButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #8bc34a',
    borderRadius: '4px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  } as React.CSSProperties,
  servingSizeInput: {
    width: '60px',
    padding: '0.5rem',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif",
  } as React.CSSProperties,
  errorText: {
    color: '#d32f2f',
    fontSize: '0.85rem',
    marginTop: '-0.5rem',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#2e7d32', // Primary Green
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease', // Include opacity transition
    // Add hover style later: '&:hover': { backgroundColor: '#1b5e20' }
  } as React.CSSProperties,
};
