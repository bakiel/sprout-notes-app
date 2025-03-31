# Sprout Notes 🌱

<p align="center">
  <em>Ideas That Grow</em>
</p>

## What is Sprout Notes?

Sprout Notes is an AI-powered vegan recipe and note-taking application that helps you discover new plant-based recipes, organize your culinary ideas, and make the most of the ingredients you have on hand.

### Key Features

- 🧠 **AI Recipe Generation**: Create custom vegan recipes based on your available ingredients, dietary needs, and cuisine preferences
- 📝 **Smart Note Organization**: Keep your cooking ideas organized with easy note creation and searching
- 🎨 **Modern UI Experience**: Clean, intuitive interface for recipe generation and note-taking
- 💾 **Offline Persistence**: Save recipes and notes locally for easy access, even without an internet connection
- 🔄 **Flexible API Integration**: Direct API fallback when Supabase Edge Functions aren't available

## Development Status

Sprout Notes is currently in active development with the following features implemented:

- ✅ Recipe generation with ingredient input, dietary restriction toggles, and cuisine type selection
- ✅ Visually appealing recipe display with step-by-step instructions
- ✅ Recipe rating and review system with star ratings and comments
- ✅ Basic note-taking functionality with draft auto-save
- ✅ Supabase Edge Functions for DeepSeek (recipe generation), ElevenLabs (text-to-speech), and Gemini (image/text analysis) APIs

Upcoming features:

- 🔜 Image recognition for ingredients
- 🔜 Voice narration for recipes
- 🔜 User authentication and cloud syncing
- 🔜 Community sharing features

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (v14.0.0 or higher) and npm for frontend development
- Supabase CLI (for backend development/deployment)
- API keys for DeepSeek, ElevenLabs, and Google Gemini
- Supabase Project URL and Anon Key
- Docker (optional - required only for Supabase Edge Functions)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/sprout-notes-app.git
   cd sprout-notes-app 
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the project root with:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Create a `supabase/.env.local` file with:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the Supabase local development environment (optional - requires Docker):**
   ```bash
   cd supabase
   supabase start
   ```

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   > **Note:** The application will work even if Docker is not running or Supabase Edge Functions are unavailable. It will automatically fall back to direct API calls when needed.

## Project Structure

```
Sprouts App/
├── app/                       # React application code
│   ├── components/            # Reusable UI components
│   │   ├── Header.tsx         # Application header
│   │   ├── Footer.tsx         # Application footer
│   │   ├── RecipeCard.tsx     # Recipe display component
│   │   ├── RecipeReview.tsx   # Recipe rating and review component
│   │   ├── RecipeGeneratorForm.tsx # Recipe input form
│   │   ├── NoteEditor.tsx     # Note editing component 
│   │   ├── NoteList.tsx       # Note listing/search component
│   │   └── LoadingIndicator.tsx # Loading animation component
│   ├── lib/                   # Utility functions and services
│   │   ├── supabaseClient.ts  # Supabase client configuration
│   │   └── api/               # Direct API clients
│   │       └── recipeGenerator.ts # DeepSeek API client
│   ├── routes/                # Application routes
│   │   └── home.tsx           # Main application page
│   ├── app.css                # Global application styles
│   └── root.tsx               # Root application component
├── supabase/                  # Supabase backend configuration
│   ├── config.toml            # Supabase configuration
│   ├── seed.sql               # Database schema definition
│   ├── functions/             # Edge Functions
│   │   ├── _shared/           # Shared utilities
│   │   ├── deepseek-proxy/    # Recipe generation API proxy
│   │   ├── elevenlabs-proxy/  # Text-to-speech API proxy
│   │   └── gemini-proxy/      # Image/text analysis API proxy
├── public/                    # Static assets
├── .env.local                 # Frontend environment variables
├── package.json               # Project dependencies and scripts
└── README.md                  # This file
```

## Feature Documentation

### Recipe Generation

The recipe generation feature uses the DeepSeek API to create custom vegan recipes based on user inputs:

- **Ingredient Input**: Enter the ingredients you have on hand
- **Dietary Restrictions**: Select from gluten-free, oil-free, nut-free, and soy-free options
- **Cuisine Type**: Choose from various cuisine styles (Asian, Mediterranean, Mexican, etc.)
- **Recipe Display**: View the generated recipe with ingredients list, step-by-step instructions, and cooking information
- **Recipe Reviews**: Rate and review recipes with a 5-star rating system and comments
- **Flexible API Access**: Uses Supabase Edge Functions when available, with fallback to direct API access when Docker/Supabase isn't running

### Note-Taking

The note-taking feature allows users to save cooking ideas, recipe modifications, and other culinary thoughts:

- **Create Notes**: Add titles and content for your cooking notes
- **Edit Notes**: Modify existing notes with automatic draft saving
- **Delete Notes**: Remove notes you no longer need
- **Search Notes**: Filter notes by title, content, or tags
- **Local Storage**: All notes are saved to browser localStorage for persistence

## Security and Architecture

- **API Key Protection**: All API keys are stored securely as environment variables in Supabase Edge Functions
- **CORS Handling**: Proper CORS protection for all API endpoints
- **TypeScript**: Type-safe code throughout the application
- **Component Architecture**: Clean separation of concerns with reusable components
- **Local Storage**: Client-side data persistence with localStorage
- **Fallback Mechanisms**: Graceful degradation when services are unavailable
- **Error Handling**: Comprehensive error handling with user-friendly fallbacks

## Next Steps

See the `tasks-file.md` in the project for a detailed breakdown of implemented and upcoming features.

## License

This project is licensed under the MIT License.

---

<p align="center">Made with 💚 for plant-based food lovers</p>
