# Sprouts App Complete Rebuild Plan

## Executive Summary

This plan outlines a complete rebuild of the Sprouts App demo for a partnership presentation. The focus is on:
1. **AI-Generated Images** via OpenRouter's Nano Banana Pro (Gemini 3 Pro Image Preview)
2. **Modern, Polished UI** with improved design system
3. **Deployment to GitHub Pages** for live demo access
4. **Consolidated, Clean Codebase**

---

## Phase 1: OpenRouter Image Generation Integration

### 1.1 Create OpenRouter Proxy Edge Function

**File:** `supabase/functions/openrouter-image/index.ts`

**Purpose:** Server-side proxy to call OpenRouter's Nano Banana Pro for recipe image generation

**API Details:**
- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Model ID:** `google/gemini-3-pro-image-preview`
- **Headers:**
  - `Authorization: Bearer {OPENROUTER_API_KEY}`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "model": "google/gemini-3-pro-image-preview",
  "messages": [{
    "role": "user",
    "content": "Generate a beautiful, appetizing photograph of [recipe name]. The dish should be plated professionally on a clean white plate with natural lighting. Show fresh ingredients, vibrant colors, and restaurant-quality presentation. Style: food photography, editorial, high resolution."
  }],
  "modalities": ["image", "text"],
  "image_config": {
    "aspect_ratio": "4:3"
  }
}
```
- **Response:** Base64-encoded image in `choices[0].message.images[0].image_url.url`

### 1.2 Add OpenRouter API Key to Environment

**File:** `supabase/.env.local`
- Add: `OPENROUTER_API_KEY=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`

### 1.3 Update Frontend Image Generation

**File:** `app/routes/home.tsx`

Replace Unsplash-based image fetching with OpenRouter call:
```typescript
const handleGenerateImage = async (recipeTitle: string) => {
  setIsGeneratingImage(true);
  try {
    const { data, error } = await supabase.functions.invoke('openrouter-image', {
      body: {
        recipeName: recipeTitle,
        ingredients: currentRecipe?.ingredients || []
      }
    });

    if (error) throw error;
    setRecipeImage(data.imageUrl); // Base64 data URL
  } catch (err) {
    // Fallback to Unsplash if OpenRouter fails
    await handleFallbackImage(recipeTitle);
  } finally {
    setIsGeneratingImage(false);
  }
};
```

---

## Phase 2: UI/UX Improvements

### 2.1 Color Palette Refinement

Update `app/app.css` with enhanced color system:
```css
:root {
  --primary-green: #2e7d32;
  --primary-green-light: #4caf50;
  --primary-green-dark: #1b5e20;
  --secondary-lime: #8bc34a;
  --accent-amber: #ff8f00;
  --background-cream: #faf8f5;
  --background-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-light: #e0e0e0;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.16);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

### 2.2 Header Component Redesign

**File:** `app/components/Header.tsx`

- Modern hero section with gradient background
- Animated logo/branding
- Clean navigation (if needed)
- Partnership badge/branding area

### 2.3 RecipeCard Component Overhaul

**File:** `app/components/RecipeCard.tsx`

Key improvements:
- Hero image with overlay gradient for title
- Card elevation and hover effects
- Better typography hierarchy
- Pill-style tags for dietary info
- Animated step numbers in instructions
- Sticky action bar at bottom
- Loading skeleton states

### 2.4 RecipeGeneratorForm Enhancement

**File:** `app/components/RecipeGeneratorForm.tsx`

- Floating labels for inputs
- Better dropdown styling
- Ingredient chip/tag input
- Visual serving size selector
- Animated submit button with loading state
- Form validation feedback

### 2.5 Home Page Layout

**File:** `app/routes/home.tsx`

- Clean section separation
- Responsive grid for saved recipes
- Empty states with illustrations
- Better spacing and visual hierarchy

### 2.6 Global Styles Update

**File:** `app/app.css`

- Smooth transitions throughout
- Consistent button styles
- Form element styling
- Better responsive breakpoints
- Print-friendly styles for PDF
- Loading skeleton animations

---

## Phase 3: Code Consolidation & Cleanup

### 3.1 Type Definitions

**Create:** `app/types/index.ts`

Centralize all TypeScript interfaces:
```typescript
export interface Recipe {
  id?: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  nutritionalNotes?: string[];
  cookingTips?: string[];
  imageUrl?: string;
  category?: string;
}

export interface Note { ... }
export interface Review { ... }
```

### 3.2 Remove Hardcoded API Keys

**File:** `app/lib/api/recipeGenerator.ts`

- Remove direct API key from client code
- All API calls should go through Supabase Edge Functions only

### 3.3 Environment Variables

**File:** `.env.local` (frontend)
```
VITE_SUPABASE_URL=<production-url>
VITE_SUPABASE_ANON_KEY=<production-key>
```

**File:** `supabase/.env.local` (backend)
```
DEEPSEEK_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...
ELEVENLABS_API_KEY=sk_...
GEMINI_API_KEY=AIza...
```

### 3.4 Service Worker Update

**File:** `public/sw.js`

Update cache list dynamically based on build output.

---

## Phase 4: GitHub Pages Deployment

### 4.1 Build Configuration

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  base: '/sprouts-app/', // GitHub Pages path
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  plugins: [react(), tailwindcss(), tsconfigPaths()],
});
```

### 4.2 GitHub Actions Workflow

**Create:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 4.3 Repository Setup

1. Initialize/push to GitHub
2. Enable GitHub Pages in repository settings
3. Add secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy Supabase Edge Functions to production

### 4.4 Supabase Production Setup

1. Create production Supabase project (if not exists)
2. Deploy Edge Functions:
   ```bash
   cd supabase
   supabase functions deploy openrouter-image --no-verify-jwt
   supabase functions deploy deepseek-proxy --no-verify-jwt
   ```
3. Set secrets in Supabase dashboard

---

## Phase 5: Final Polish & Testing

### 5.1 Image Generation Testing

- Test with various recipe types
- Verify base64 image display
- Test fallback to Unsplash
- Check image quality and relevance

### 5.2 UI Testing

- Mobile responsiveness (375px, 768px, 1024px+)
- Dark mode compatibility
- Button hover/focus states
- Form validation
- Loading states

### 5.3 Performance

- Lighthouse audit
- Bundle size check
- Image optimization
- Cache headers

### 5.4 Demo Preparation

- Pre-generate a few sample recipes with images
- Test full flow: generate recipe → generate image → save → share
- Prepare demo script for partnership presentation

---

## Implementation Order

1. **Phase 1** - OpenRouter Integration (Critical for demo)
   - Create Edge Function
   - Add API key
   - Update frontend

2. **Phase 2** - UI Improvements (High priority for demo)
   - Update color palette
   - Redesign RecipeCard
   - Polish forms and buttons

3. **Phase 3** - Code Cleanup (Medium priority)
   - Consolidate types
   - Remove security issues
   - Clean up unused code

4. **Phase 4** - Deployment (Required for demo)
   - Configure build
   - Set up GitHub Actions
   - Deploy to Pages

5. **Phase 5** - Testing & Polish (Final steps)
   - End-to-end testing
   - Performance optimization
   - Demo preparation

---

## Technical Notes

### OpenRouter API Details

- **Model:** `google/gemini-3-pro-image-preview` (Nano Banana Pro)
- **Pricing:** $0.00012 per image (~$2/million input tokens, $12/million output tokens)
- **Features:** High-fidelity synthesis, text rendering, 2K/4K support
- **Response:** Base64-encoded PNG in `choices[0].message.images[0].image_url.url`

### Image Prompt Best Practices

For food photography quality:
```
Generate a beautiful, appetizing photograph of [RECIPE_NAME].
The dish should feature:
- Professional plating on a clean ceramic plate
- Natural soft lighting from the side
- Fresh, vibrant ingredients visible
- Shallow depth of field for artistic effect
- Restaurant-quality presentation
- Garnish appropriate to the cuisine
Style: editorial food photography, high resolution, warm tones
```

### Fallback Strategy

1. Try OpenRouter Nano Banana Pro
2. If fails → Try Unsplash with enhanced query
3. If fails → Use food category query
4. If fails → Use app icon placeholder

---

## Success Criteria

- [ ] AI-generated recipe images display correctly
- [ ] Images are high quality and appetizing
- [ ] UI looks modern and professional
- [ ] App is deployed and accessible online
- [ ] Demo flow works smoothly end-to-end
- [ ] No console errors or warnings
- [ ] Mobile responsive design works
- [ ] Loading states are smooth and informative
