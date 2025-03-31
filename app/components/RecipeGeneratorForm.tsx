import React, { useState } from 'react';
// Import icons if needed, e.g.:
// import { FaSeedling } from 'react-icons/fa';

// Define props interface
interface RecipeGeneratorFormProps {
  onGenerate: (ingredients: string, restrictions: string[]) => void; // Function prop
}

const RecipeGeneratorForm: React.FC<RecipeGeneratorFormProps> = ({ onGenerate }) => {
  const [ingredients, setIngredients] = useState('');
  // TODO: Add state for dietary restrictions (e.g., using an object or Set)
  const [restrictions, setRestrictions] = useState<string[]>([]); 

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setRestrictions(prev => 
      checked ? [...prev, name] : prev.filter(r => r !== name)
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Call the onGenerate prop passed from the parent component
    onGenerate(ingredients, restrictions); 
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
        onChange={(e) => setIngredients(e.target.value)}
        required
        style={styles.textarea}
        placeholder="e.g., tofu, broccoli, soy sauce, rice vinegar, ginger..."
      />

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

      <button type="submit" style={styles.button}>
        {/* <FaSeedling style={{ marginRight: '8px' }} /> */}
        Generate Recipe
      </button>
    </form>
  );
};

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
    transition: 'background-color 0.2s ease',
    // Add hover style later: '&:hover': { backgroundColor: '#1b5e20' }
  } as React.CSSProperties,
};

export default RecipeGeneratorForm;
