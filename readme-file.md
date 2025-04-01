# Sprout Notes 🌱

<p align="center">
  <img src="assets/images/Logo Light Bg.png" alt="Sprout Notes Logo" width="200">
  <br>
  <em>Ideas That Grow</em>
</p>

## What is Sprout Notes?

Sprout Notes is an AI-powered vegan recipe and note-taking application that helps you discover new plant-based recipes, organize your culinary ideas, and make the most of the ingredients you have on hand.

### Key Features

- 🧠 **AI Recipe Generation**: Create custom vegan recipes based on your available ingredients, dietary needs, and preferences, with rating and review capabilities
- 📷 **Image Recognition**: Identify ingredients from photos to get instant recipe suggestions
- 🔊 **Voice Narration**: Listen to recipes being read aloud while you cook
- 📝 **Smart Note Organization**: Keep your cooking ideas organized with AI-categorized notes
- 👥 **Community Sharing**: Share recipes and discover dishes from other plant-based food lovers

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (v14.0.0 or higher) and npm for frontend development
- Supabase CLI (for backend development/deployment)
- API keys for DeepSeek, ElevenLabs, and Google Gemini
- Supabase Project URL and Anon Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bakiel/sprout-notes-app.git
    cd sprout-notes-app 
    ```
    *(Note: The project will likely be scaffolded directly in the `Sprouts App` directory, so cloning might not be the first step if starting fresh)*

2.  **Set up Frontend (React + Vite):**
    *   If not already done, scaffold the project using Vite:
        ```bash
        # Run this in the desired parent directory (e.g., /Users/mac/Downloads)
        npm create vite@latest "Sprouts App" --template react 
        cd "Sprouts App"
        ```
    *   Install frontend dependencies (including react-icons):
        ```bash
        npm install
        npm install react-icons --save
        ```
    *   Include Google Fonts (Poppins & Montserrat): Add links to the main `index.html` file in the `<head>` section, or import them in your main CSS file (`src/index.css`). Example for `index.html`:
        ```html
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Poppins:wght@400&display=swap" rel="stylesheet">
        ```

3.  **Set up Backend (Supabase):**
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
   *Note: For deployment, these variables should be set in the Supabase project dashboard.*

4. Start the Supabase local development environment:
   ```bash
   cd supabase
   supabase start
   ```
   *(This command also deploys the Edge Functions locally)*

5. Start the frontend development server (in the root directory):
   ```bash
   npm run dev 
   ```
   *(Ensure your frontend code points to the local Supabase URL provided by `supabase start` - typically managed via environment variables in Vite)*

6.  **Start Frontend Development Server:**
    ```bash
    # In the project root directory (/Users/mac/Downloads/Sprouts App)
    npm run dev 
    ```

7.  **Build Frontend for Production:**
    ```bash
    npm run build 
    ```
    *(This will create optimized static files, usually in a `dist/` folder)*

8.  **Deploy Supabase Functions:**
   ```bash
   cd supabase
   supabase functions deploy --no-verify-jwt
   ```

## Project Structure (React + Vite + Supabase)

```
sprout-notes-app/ (or Sprouts App/)
├── public/                    # Static assets served directly
├── src/                       # React source code
│   ├── assets/                # Frontend assets (images, etc.) processed by Vite
│   ├── components/            # Reusable React UI components
│   │   ├── RecipeCard.tsx     # Recipe display component
│   │   ├── RecipeReview.tsx   # Recipe rating and review component
│   │   ├── RecipeGeneratorForm.tsx # Recipe input form
│   │   ├── Header.tsx         # Application header
│   │   ├── Footer.tsx         # Application footer
│   │   ├── NoteEditor.tsx     # Note editing component
│   │   ├── NoteList.tsx       # Note listing component
│   │   └── LoadingIndicator.tsx # Loading animation component
│   ├── services/              # Frontend services interacting with Supabase
│   ├── App.css                # Main App component styles
│   ├── App.jsx                # Main React App component
│   ├── index.css              # Global styles
│   └── main.jsx               # Entry point for React application
├── supabase/                  # Supabase backend configuration and functions
│   ├── config.toml            # Supabase project configuration
│   ├── functions/             # Supabase Edge Functions (API Proxies)
│   │   ├── _shared/
│   │   ├── deepseek-proxy/
│   │   ├── elevenlabs-proxy/
│   │   └── gemini-proxy/
│   └── migrations/            # Database migrations (if using Supabase DB)
├── .env.local                 # Local frontend environment variables (optional, gitignored)
├── .gitignore                 # Git ignore file
├── index.html                 # HTML template entry point (managed by Vite)
├── package.json               # Project dependencies and scripts
├── vite.config.js             # Vite configuration file
└── readme-file.md             # This file
```

## Feature Documentation

### Recipe Generation

Sprout Notes uses the DeepSeek API via a Supabase Edge Function to generate custom vegan recipes. Users can:

- Enter ingredients they have available
- Select dietary restrictions (gluten-free, oil-free, nut-free, soy-free)
- Choose cuisine preferences
- Specify meal type and serving size
- Rate and review recipes with a 5-star rating system and comments
- Edit generated recipes with AI assistance to customize them further

### Image Recognition

The Google Gemini API, accessed through a Supabase Edge Function, powers our image recognition feature, allowing users to:

- Take photos of ingredients using their device camera
- Upload existing photos from their gallery
- Get AI-identified ingredients list
- Generate recipe suggestions based on identified ingredients

### Voice Features

Using ElevenLabs' text-to-speech technology via a Supabase Edge Function, Sprout Notes offers:

- Hands-free recipe narration
- Section-by-section reading (ingredients, instructions, etc.)
- Multiple voice options
- Playback controls (play, pause, stop)

### Note Organization

Notes are intelligently organized using the Google Gemini API via a Supabase Edge Function:

- Automatic categorization based on content
- Smart tagging
- Recipe linking
- Full-text search capabilities

## Security Considerations

Sprout Notes uses Supabase Edge Functions as secure server-side proxies. API keys are stored securely as environment variables within the Supabase project, not exposed to the client-side. If using the Supabase database, Row Level Security (RLS) should be implemented.

## Deployment

The frontend is deployed using **GitHub Pages**, directly from the `master` branch of the `bakiel/sprout-notes-app` repository. Pushing changes to the `master` branch will automatically trigger a deployment (or will once a build workflow is added).

The backend (Edge Functions, optional Database/Auth) is deployed separately using the Supabase CLI:
```bash
# Deploy Supabase Edge Functions
cd supabase
supabase functions deploy --no-verify-jwt

# Deploy Supabase Database changes (if applicable)
supabase db push 
```
Ensure production environment variables (API keys, Supabase URL/Key) are set correctly in both the Supabase project dashboard (for backend functions) and potentially in the GitHub repository settings/Actions secrets if needed for frontend builds later. Custom domain configuration is done via the GitHub repository settings under "Pages".

## Progressive Web App (PWA)

Sprout Notes is implemented as a Progressive Web App, providing:

- Offline capabilities via service worker caching
- Home screen installation on mobile and desktop
- App-like experience with full-screen mode
- Complete branding with custom icons for all platforms
- Push notifications (future enhancement)

### PWA Installation

Sprout Notes can be installed on various devices for an app-like experience:

**On Mobile (iOS/Android):**
1. Open Sprout Notes in your browser (Safari on iOS, Chrome on Android)
2. On iOS: Tap the Share button, then "Add to Home Screen"
3. On Android: Tap the three-dot menu, then "Install app" or "Add to Home Screen"

**On Desktop (Windows/macOS/Linux):**
1. Open Sprout Notes in a compatible browser (Chrome, Edge, etc.)
2. Look for the install icon in the address bar, or use the browser menu
3. Click "Install" to add the app to your desktop

### Icon System

Sprout Notes uses a comprehensive set of icons to ensure proper display across all platforms:

- **Favicon Icons**: Multiple sizes (16×16 to 48×48) for browser tabs and bookmarks
- **Apple Touch Icons**: Specially formatted icons for iOS home screens
- **Android Icons**: Maskable icons in various sizes (48×48 to 512×512) for Android devices
- **Windows Tiles**: Support for Windows OS tiles and start menu

All icons are stored in the `/public/icons/` directory and are referenced in both the `manifest.json` and HTML metadata.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Supabase for backend infrastructure and API proxies
- DeepSeek API for recipe generation
- ElevenLabs API for voice synthesis
- Google Gemini API for image recognition and text analysis
- All the open-source libraries and tools used in this project

---

<p align="center">Made with 💚 for plant-based food lovers</p>
