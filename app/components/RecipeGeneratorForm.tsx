import React, { useState, useEffect, useRef } from 'react';
import useRecipeGenerator from '../lib/hooks/useRecipeGenerator';
import type { GenerateRecipeParams, Recipe } from '../lib/hooks/useRecipeGenerator';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for voice support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognitionAPI);
  }, []);

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

  // Voice input handler
  const toggleVoiceInput = () => {
    if (!voiceSupported) return;

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Start listening
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        // Add to existing ingredients, separated by comma
        setIngredients(prev => {
          const trimmedPrev = prev.trim();
          if (trimmedPrev && !trimmedPrev.endsWith(',')) {
            return `${trimmedPrev}, ${finalTranscript.trim()}`;
          }
          return trimmedPrev + finalTranscript.trim();
        });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
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
        <div className="textarea-with-voice">
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
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`voice-input-btn ${isListening ? 'voice-input-btn--active' : ''}`}
              title={isListening ? 'Stop listening' : 'Speak ingredients'}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>
          )}
        </div>
        {isListening && (
          <div className="voice-listening-indicator">
            <span className="voice-pulse"></span>
            Listening... speak your ingredients
          </div>
        )}
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
