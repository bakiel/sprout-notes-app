# Sprout Notes - Implementation Tasks

This document outlines the specific tasks required to implement the Sprout Notes application. Tasks are organized by feature area and development phase, with priority levels and estimated effort.

## Priority Levels
- **P0**: Critical - Must have for MVP
- **P1**: High - Important for initial release
- **P2**: Medium - Planned for Phase 2
- **P3**: Low - Nice to have, future enhancement

## Effort Estimate
- **S**: Small (1-2 hours)
- **M**: Medium (half-day to full-day)
- **L**: Large (multiple days)
- **XL**: Extra Large (1+ week)

---

## Phase 1: Project Setup & Core Infrastructure

### Project Structure Setup (React + Vite + Supabase)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Initialize Git repository | P0 | S | DONE | Cline |
| Create remote GitHub repository | P0 | S | DONE | User |
| Connect local repo to remote | P0 | S | DONE | Cline |
| Push initial files to GitHub | P0 | M | DONE | Cline |
| Scaffold React project using Vite (`npm create vite@latest`) | P0 | S | DONE | User/Cline |
| Install frontend dependencies (`npm install`) | P0 | S | DONE | User/Cline |
| Install react-icons (`npm install react-icons --save`) | P0 | S | DONE | Cline |
| Add Google Fonts (Poppins, Montserrat) to `index.html` or CSS | P0 | S | DONE | Cline |
| Clean up default Vite files/structure | P0 | S | DONE | Cline |
| Set up basic CSS/styling approach (e.g., `index.css`, apply fonts) | P0 | M | DONE | Cline |
| Configure Vite for Supabase env vars (e.g., using `import.meta.env`) | P0 | M | DONE | Cline |
| Initialize Supabase project (`supabase init`) | P0 | S | DONE | Cline |
| Link Supabase project (`supabase link`) | P0 | S | DONE | Cline |
| Configure Supabase local env vars (`supabase/.env.local`) | P0 | S | DONE | Cline |
| Set up Supabase local dev (`supabase start`) | P0 | M | DONE | Cline |

### Core UI Implementation (React Components)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create main `App.jsx` component structure | P0 | M | DONE | Cline |
| Create `Header` component | P0 | M | DONE | Cline |
| Create `Footer` component | P1 | S | DONE | Cline |
| Implement basic routing (if needed for MVP views) | P1 | M | DONE | Template |
| Create `LoadingIndicator` component | P1 | S | DONE | Cline |
| Create `Notification` component/system | P1 | M | DONE | Cline |
| Implement responsive layout using CSS | P0 | M | DONE | Cline |
| Implement dark/light mode toggle | P3 | M | TODO | |

### Authentication & User Data (Post-MVP - Requires Supabase Auth/DB)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Design Supabase DB schema (users, recipes, notes) | P2 | M | DONE | Cline |
| Implement Supabase DB migrations | P2 | M | DONE | Cline |
| Set up Supabase RLS policies | P2 | L | DONE | Cline |
| Implement Supabase Auth UI (login/signup) | P2 | M | TODO | |
| Configure Supabase Auth providers | P2 | S | TODO | |
| Implement user profile UI (linked to Supabase) | P2 | M | TODO | |
| Implement data sync between LocalStorage and Supabase DB | P2 | L | TODO | |
*Note: MVP uses LocalStorage only.*
| Implement local storage for user data (MVP) | P0 | M | DONE | Cline |
| Set up user preferences storage (LocalStorage - MVP) | P0 | S | DONE | Cline |

---

## Phase 2: Recipe Generation Feature

### DeepSeek API Integration (React Frontend + Supabase Function)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Verify/Implement Supabase Edge Function: `deepseek-proxy` | P0 | M | DONE | Cline |
| Create React hook/service (`useRecipeGenerator` or `RecipeService.js`) | P0 | M | DONE | Cline |
| Implement API call logic within hook/service (using Supabase client) | P0 | M | DONE | Cline |
| Implement request formatting (in hook/service) | P0 | M | DONE | Cline |
| Implement response parsing (in hook/service) | P0 | M | DONE | Cline |
| Add error handling and loading state management (in hook/service) | P0 | M | DONE | Cline |
| Implement direct API fallback for when Supabase functions are unavailable | P0 | M | DONE | Cline |
| Implement caching for Supabase function results (optional) | P1 | M | DONE | Cline |
| Add DeepSeek 'describe' action for improved image searching | P1 | M | DONE | Cline |

### Recipe Generation UI (React Components)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create `RecipeGeneratorForm` component | P0 | M | DONE | Cline |
| Implement ingredient input field (controlled component) | P0 | M | DONE | Cline |
| Create dietary restriction toggles/checkboxes | P0 | S | DONE | Cline |
| Implement cuisine type selector | P0 | S | DONE | Cline |
| Create serving size adjuster | P1 | S | DONE | Cline |
| Implement form state management (e.g., `useState`) | P0 | M | DONE | Cline |
| Implement form submission logic (calls hook/service) | P0 | M | DONE | Cline |
| Implement form validation | P1 | M | DONE | Cline |
| Add Meal Type filter | P1 | S | DONE | Cline |

### Recipe Display (React Components)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create `RecipeCard` component | P0 | M | DONE | Cline |
| Create `RecipeReview` component | P0 | M | DONE | Cline |
| Implement recipe display logic within `RecipeCard` | P0 | M | DONE | Cline |
| Create ingredients list display | P0 | M | DONE | Cline |
| Implement step-by-step instructions display | P0 | M | DONE | Cline |
| Add nutritional notes section display | P1 | S | DONE | Cline |
| Create cooking tips display | P1 | S | DONE | Cline |
| Implement recipe sharing functionality | P1 | M | DONE | Cline |
| Add print recipe feature | P1 | S | DONE | Cline |

### Recipe Management

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Implement recipe saving (LocalStorage MVP) | P0 | M | DONE | Cline |
| Create saved recipes view | P0 | M | DONE | Cline |
| Add "New Recipe" button to reset form | P1 | S | DONE | Cline |
| Implement AI-assisted recipe editing | P0 | M | DONE | Cline |
| Create recipe deletion feature | P1 | S | DONE | Cline |
| Implement recipe categories | P1 | M | DONE | Cline |
| Add recipe rating system | P2 | M | DONE | Cline |
| Create recipe export functionality | P1 | S | DONE | Cline |
| Implement PDF download with nice formatting | P1 | M | DONE | Cline |
| Implement recipe history tracking | P2 | M | TODO | |

### Recipe Archive & Pantry List

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| **Backend (Supabase Function)** |  |  |  |  |
| Modify `deepseek-proxy` to handle `generatePantryList` action | P2 | M | DONE | Cline |
| Define request/response interfaces for pantry list | P2 | S | DONE | Cline |
| Craft DeepSeek prompt for categorized shopping list | P2 | S | DONE | Cline |
| Implement JSON parsing and error handling for pantry list response | P2 | S | DONE | Cline |
| Add `country` parameter support to `deepseek-proxy` for localization | P2 | S | DONE | Cline |
| **Frontend (Archive Page)** |  |  |  |  |
| Create route `app/routes/archive.tsx` | P2 | S | DONE | Cline |
| Fetch recipes from `recipes` table in `archive.tsx` | P2 | M | DONE | Cline |
| Implement state management for recipes, viewMode, filters | P2 | M | DONE | Cline |
| Add UI controls: Search input, Filter toggle, View toggle buttons | P2 | M | DONE | Cline |
| Create expanded filter panel UI (Sort, Ingredient, Time, Dietary) | P2 | M | DONE | Cline |
| Implement filtering logic (Search, Ingredient, Time, Dietary) | P2 | M | DONE | Cline |
| Implement sorting logic (Date, Title, Prep Time, Cook Time) | P2 | M | DONE | Cline |
| Create `app/components/RecipeArchiveItem.tsx` component | P2 | M | DONE | Cline |
| Implement Grid view layout in `RecipeArchiveItem` | P2 | M | DONE | Cline |
| Implement List view layout in `RecipeArchiveItem` | P2 | M | DONE | Cline |
| Display recipe image (`imageUrl` or placeholder) | P2 | S | DONE | Cline |
| **Frontend (Sharing & Shopping List)** |  |  |  |  |
| Create `app/components/SocialShareButtons.tsx` component | P2 | M | DONE | Cline |
| Implement share logic (Web Share, Facebook, Twitter, Pinterest, WhatsApp) | P2 | M | DONE | Cline |
| Create `app/components/ShoppingListGenerator.tsx` component | P2 | M | DONE | Cline |
| Add country selector dropdown to `ShoppingListGenerator` | P2 | S | DONE | Cline |
| Implement DeepSeek API call in `ShoppingListGenerator` (with country) | P2 | M | DONE | Cline |
| Implement UI to display generated shopping list in modal | P2 | M | DONE | Cline |
| Add loading/error states for shopping list generation | P2 | S | DONE | Cline |
| Implement WhatsApp formatting logic in `SocialShareButtons` | P2 | S | DONE | Cline |
| Integrate `SocialShareButtons` into `RecipeArchiveItem` | P2 | S | DONE | Cline |
| Integrate `ShoppingListGenerator` modal into `RecipeArchiveItem` | P2 | M | DONE | Cline |
| **Styling** |  |  |  |  |
| Add CSS classes for archive page and components in `app.css` | P2 | M | DONE | Cline |
| Add CSS for `SocialShareButtons` | P2 | S | DONE | Cline |
| Add CSS for `ShoppingListGenerator` modal | P2 | M | DONE | Cline |

---

## Phase 3: Note-Taking Feature

### Note Editor (React Components)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create `NoteEditor` component | P0 | M | DONE | Cline |
| Implement basic text editing (controlled textarea) | P0 | M | DONE | Cline |
| Create note saving functionality (LocalStorage MVP) | P0 | M | DONE | Cline |
| Implement note title handling | P0 | S | DONE | Cline |
| Add rich text formatting options | P1 | L | DONE (Basic - Lexical) | Cline |
| Implement image insertion in notes | P2 | M | TODO | |
| Create note templates | P2 | M | TODO | |
| Add spell-checking | P3 | M | TODO | |

### Note Organization (React Components)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create `NoteList` component | P0 | M | DONE | Cline |
| Create `NoteSearch` component | P1 | M | DONE | Cline |
| Implement manual tagging system (UI + LocalStorage) | P1 | M | DONE | Cline |
| Add note sorting options (UI) | P1 | S | DONE | Cline |
| Implement note categories (UI + LocalStorage) | P1 | M | DONE | Cline |
| Create note linking with recipes (UI + LocalStorage) | P1 | M | DONE | Cline |
| Implement note import/export | P2 | M | TODO | |
| Add note sharing functionality | P3 | M | TODO | |

### Gemini Integration for Notes (via Supabase Function)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Verify/Implement Supabase Edge Function: `gemini-proxy` (for text) | P2 | M | DONE | Cline |
| Create frontend NoteAnalysisService (calls Supabase func) | P2 | M | TODO | |
| Implement note analysis functionality (in frontend service) | P2 | M | TODO | |
| Implement auto-tagging from content (using service) | P2 | M | TODO | |
| Add AI-powered note categorization (using service) | P2 | M | TODO | |
| Implement related recipe suggestions (using service) | P2 | M | TODO | |
| Add semantic search capabilities (potentially requires DB) | P3 | L | TODO | |

---

## Phase 4: Voice & Audio Features

### ElevenLabs Integration (via Supabase Function)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Verify/Implement Supabase Edge Function: `elevenlabs-proxy` | P2 | M | DONE | Cline |
| Create frontend AudioService class (calls Supabase func) | P2 | M | TODO | |
| Implement text-to-speech conversion (in frontend service) | P2 | M | TODO | |
| Implement audio playback (frontend) | P2 | M | TODO | |
| Add voice selection options (frontend) | P2 | S | TODO | |
| Implement speech rate control (frontend) | P2 | S | TODO | |
| Create audio caching for performance (frontend/Supabase) | P2 | M | TODO | |
| Add error handling for audio generation (frontend/Supabase) | P2 | M | TODO | |

### Voice UI Implementation

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Design audio control UI | P2 | M | TODO | |
| Implement play/pause/stop controls | P2 | M | TODO | |
| Create progress indicator | P2 | S | TODO | |
| Implement section-based playback | P2 | M | TODO | |
| Add floating audio controls for mobile | P2 | M | TODO | |
| Create voice preferences UI | P2 | S | TODO | |
| Implement automated reading of recipe steps | P3 | M | TODO | |
| Add hands-free voice commands (if applicable) | P3 | L | TODO | |

---

## Phase 5: Image Recognition Feature

### Camera & Image Upload

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Design image upload interface | P2 | M | TODO | |
| Implement file selection | P2 | S | TODO | |
| Add drag-and-drop functionality | P2 | M | TODO | |
| Create image preview component | P2 | S | TODO | |
| Implement mobile camera access | P2 | M | TODO | |
| Add image editing/cropping tools | P3 | L | TODO | |
| Implement multi-image upload | P3 | M | TODO | |

### Recipe Image Generation & Fallback System

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Implement recipe image search from Unsplash | P2 | M | DONE | Cline |
| Create multi-tier image fallback system | P1 | M | DONE | Cline |
| Implement food-specific queries for relevant images | P1 | S | DONE | Cline |
| Add branded PDF export with logo | P1 | S | DONE | Cline |
| Fix aspect ratio issues in PDF exports | P1 | S | DONE | Cline |

### Gemini Integration for Images (via Supabase Function)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Verify/Implement Supabase Edge Function: `gemini-proxy` (for images) | P2 | M | DONE | Cline |
| Create frontend VisionService class (calls Supabase func) | P2 | M | TODO | |
| Create image preprocessing (frontend) | P2 | M | TODO | |
| Implement ingredient recognition (using service) | P2 | L | TODO | |
| Create UI for recognized ingredients | P2 | M | TODO | |
| Implement "use ingredients" feature | P2 | M | TODO | |
| Add confidence scoring for recognition | P3 | M | TODO | |
| Create barcode scanning for packaged foods | P3 | L | TODO | |

---

## Phase 6: Progressive Web App Features

### Offline Capabilities

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create service worker | P1 | L | DONE (Basic) | Cline |
| Implement resource caching | P1 | M | DONE (App Shell) | Cline |
| Create offline recipe access | P1 | M | DONE | Cline |
| Implement sync mechanism | P2 | L | TODO | |
| Add offline mode indicator | P2 | S | TODO | |
| Create offline data storage strategy | P2 | M | DONE | Cline |

### PWA Integration

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create manifest.json | P1 | S | DONE | Cline |
| Generate app icons in all sizes | P1 | S | DONE | Cline |
| Implement install prompts | P1 | S | DONE (Basic UI) | Cline |
| Add theme color metadata | P1 | S | DONE | Cline |
| Create splash screens | P2 | M | TODO | |
| Implement push notifications | P3 | L | TODO | |

---

## Phase 7: Testing & Optimization

### Testing

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create unit tests for services | P1 | L | TODO | |
| Implement integration tests | P1 | L | TODO | |
| Set up cross-browser testing | P1 | M | TODO | |
| Perform mobile device testing | P1 | M | TODO | |
| Implement accessibility testing | P1 | M | TODO | |
| Create performance tests | P2 | M | TODO | |
| Set up automated testing pipeline | P2 | L | TODO | |

### Performance Optimization

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Optimize image loading | P1 | M | TODO | |
| Implement lazy loading | P1 | M | TODO | |
| Minify CSS and JavaScript | P1 | S | TODO | |
| Optimize API request caching | P1 | M | TODO | |
| Implement code splitting | P2 | M | TODO | |
| Create performance monitoring | P2 | M | TODO | |
| Optimize animations for performance | P2 | S | TODO | |

### Security Implementation

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Configure Supabase secrets/env variables | P0 | S | DONE | Cline |
| Configure CORS in Supabase Edge Functions | P0 | S | DONE | Cline |
| Add input sanitization (frontend/backend) | P0 | M | DONE | Cline |
| Implement Row Level Security (RLS) if using Supabase DB | P1 | L | DONE | Cline |
| Create Content Security Policy (frontend) | P1 | M | TODO | |
| Implement rate limiting (Supabase function level, optional) | P1 | M | TODO | |
| Add HTTPS enforcement (handled by Supabase/hosting) | P1 | S | DONE | |
| Perform security audit (focus on Supabase config/RLS) | P1 | L | TODO | |

---

## Phase 8: Deployment & Documentation

### Deployment (React + Vite + Supabase + GitHub Pages)

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Enable GitHub Pages in repository settings | P0 | S | DONE | User |
| Configure custom domain in GitHub Pages (optional, later) | P2 | S | TODO | |
| Verify Vite production build (`npm run build`) | P0 | S | TODO | |
| Configure Supabase production environment variables | P0 | M | TODO | |
| Configure Vite production env vars (if needed for Supabase keys) | P0 | S | TODO | |
| Deploy Supabase DB migrations (`supabase db push`) | P1 | M | TODO | |
| Deploy Supabase Edge Functions (`supabase functions deploy`) | P0 | M | TODO | |
| Set up GitHub Actions workflow for Vite build & deploy to Pages | P1 | L | TODO | |
| Set up CI/CD for Supabase function/migration deployment | P2 | L | TODO | |
| Implement monitoring (Supabase logs, frontend analytics) | P1 | M | TODO | |
| Set up analytics (frontend) | P2 | M | TODO | |

### Documentation

| Task | Priority | Effort | Status | Assigned To |
|------|----------|--------|--------|-------------|
| Create README.md | P0 | S | DONE | Cline |
| Write technical documentation | P0 | L | DONE | Cline |
| Create user guide | P1 | M | TODO | |
| Document frontend-Supabase function interaction | P1 | M | DONE | Cline |
| Document Supabase setup and architecture | P1 | M | DONE | Cline |
| Create developer onboarding guide | P2 | M | TODO | |
| Document known issues and workarounds | P2 | S | TODO | |
| Create FAQ | P2 | M | TODO | |

---

## Task Tracking Instructions

1. As tasks are assigned, update the "Assigned To" column with the team member's name
2. Update the "Status" column as tasks progress:
   - TODO: Not started
   - IN PROGRESS: Currently being worked on
   - REVIEW: Ready for review/testing
   - DONE: Completed and verified

3. For tracking complex tasks, create subtasks as needed with the format:
   - Parent task ID.Subtask number (e.g., REG-01.1, REG-01.2)

4. When updating task status, include:
   - Date of update
   - Brief progress note or blocker description
   - Any dependencies that have changed

---

*This is a living document that will be updated throughout the development process.*
