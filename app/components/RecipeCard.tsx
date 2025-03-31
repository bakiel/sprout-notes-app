import React from 'react';

// Define a type for the recipe data (adjust as needed based on API response)
interface Recipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
}

interface RecipeCardProps {
  recipe: Recipe | null; // Allow null when no recipe is generated yet
  isLoading: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isLoading }) => {
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
        <ol style={styles.list}>
          {recipe.instructions.map((step, index) => (
            // Add numbering and ensure proper formatting
            <li key={index} style={styles.listItem}>
              <strong>Step {index + 1}:</strong> {step}
            </li>
          ))}
        </ol>
      ) : (
        <p style={styles.placeholder}>No instructions provided.</p>
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
};

export default RecipeCard;
