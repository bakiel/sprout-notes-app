import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import LoadingIndicator from './LoadingIndicator';
import SocialShareButtons from './SocialShareButtons';

interface ShoppingListGeneratorProps {
  ingredients: string[];
  recipeName: string;
  onClose: () => void;
}

// Type for the pantry list data
interface PantryList {
  [category: string]: string[];
}

// List of countries for localization
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MX', name: 'Mexico' },
];

const ShoppingListGenerator: React.FC<ShoppingListGeneratorProps> = ({
  ingredients,
  recipeName,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [country, setCountry] = useState<string>('');
  const [pantryList, setPantryList] = useState<PantryList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareButtons, setShowShareButtons] = useState<boolean>(false);

  // Get user's country from browser locale if available
  useEffect(() => {
    try {
      const userLocale = navigator.language || '';
      // Extract country code from locale (e.g., 'en-US' -> 'US')
      const localeCountry = userLocale.split('-')[1];
      if (localeCountry && countries.some(c => c.code === localeCountry)) {
        setCountry(localeCountry);
      } else {
        // Default to US if country not detected
        setCountry('US');
      }
    } catch (err) {
      console.error('Error detecting country:', err);
      setCountry('US'); // Default to US on error
    }
  }, []);

  const generatePantryList = async () => {
    setIsGenerating(true);
    setError(null);
    setPantryList(null);
    setShowShareButtons(false);

    try {
      if (!supabase) {
        throw new Error("Shopping list generation requires Supabase to be configured");
      }
      const { data, error: fnError } = await supabase.functions.invoke('deepseek-proxy', {
        body: {
          action: 'generatePantryList',
          ingredients: ingredients,
          country: country, // Add country for localization
        },
      });

      if (fnError) {
        throw new Error(`Function error: ${fnError.message}`);
      }

      if (data?.error) {
        throw new Error(`API error: ${data.error}`);
      }

      // Assuming the function returns { pantryList: { category: [...] } }
      if (data?.pantryList) {
        setPantryList(data.pantryList);
        setShowShareButtons(true); // Show share buttons after successful generation
      } else {
        throw new Error('Invalid response format from pantry list generator.');
      }
    } catch (err) {
      console.error('Error generating pantry list:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate pantry list.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on first render if we have ingredients and country
  useEffect(() => {
    if (ingredients.length > 0 && country && !pantryList && !isGenerating && !error) {
      generatePantryList();
    }
  }, [country]);

  return (
    <div className="shopping-list-generator">
      <div className="shopping-list-header">
        <h3>Shopping List for {recipeName}</h3>
        <button onClick={onClose} className="close-btn" aria-label="Close">
          &times;
        </button>
      </div>

      <div className="country-selector">
        <label htmlFor="country-select">Localize ingredients for:</label>
        <select
          id="country-select"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          disabled={isGenerating}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <button 
          onClick={generatePantryList} 
          disabled={isGenerating || !country}
          className="regenerate-btn"
        >
          {pantryList ? 'Regenerate List' : 'Generate List'}
        </button>
      </div>

      <div className="shopping-list-content">
        {isGenerating ? (
          <LoadingIndicator message="Preparing your shopping list..." />
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <button onClick={generatePantryList} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : pantryList ? (
          <>
            <div className="pantry-list">
              {Object.entries(pantryList).map(([category, items]) => (
                <div key={category} className="pantry-category">
                  <h4>{category}</h4>
                  <ul>
                    {items.map((item, index) => (
                      <li key={index} className="pantry-item">
                        <input type="checkbox" id={`item-${category}-${index}`} />
                        <label htmlFor={`item-${category}-${index}`}>{item}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {showShareButtons && (
              <div className="share-section">
                <h4>Share Your Shopping List</h4>
                <SocialShareButtons
                  url={window.location.href}
                  title={`Shopping List for ${recipeName}`}
                  description={`A shopping list for ${recipeName} from Sprout Notes`}
                  shoppingList={pantryList}
                />
              </div>
            )}
          </>
        ) : (
          <p className="no-list-message">
            Select your country and click "Generate List" to create a shopping list.
          </p>
        )}
      </div>
    </div>
  );
};

export default ShoppingListGenerator;
