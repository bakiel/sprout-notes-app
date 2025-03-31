# Sprout Notes 🌱

<p align="center">
  <img src="assets/images/Logo Light Bg.png" alt="Sprout Notes Logo" width="200">
  <br>
  <em>Ideas That Grow</em>
</p>

## What is Sprout Notes?

Sprout Notes is an AI-powered vegan recipe and note-taking application that helps you discover new plant-based recipes, organize your culinary ideas, and make the most of the ingredients you have on hand.

### Key Features

- 🧠 **AI Recipe Generation**: Create custom vegan recipes based on your available ingredients, dietary needs, and preferences
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

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/sprout-notes.git
   cd sprout-notes
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Supabase environment variables locally. Create a file `.env.local` in the `supabase/` directory (this file is ignored by git):
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
   *(Ensure your frontend code points to the local Supabase URL provided by `supabase start`)*

6. Build frontend for production:
   ```bash
   npm run build
   ```

7. Deploy Supabase functions:
   ```bash
   cd supabase
   supabase functions deploy --no-verify-jwt
   ```

## Project Structure

```
sprout-notes/
├── index.html                 # Main entry point
├── css/                       # Stylesheets
│   ├── styles.css             # Main styles
│   └── normalize.css          # CSS reset
├── js/                        # Frontend JavaScript files
│   ├── app.js                 # Main application logic
│   ├── services/              # Frontend service interactions (calling Supabase functions)
│   │   ├── RecipeService.js   # Handles recipe generation calls
│   │   ├── AudioService.js    # Handles text-to-speech calls
│   │   └── VisionService.js   # Handles image recognition calls
│   └── utils/                 # Utility functions
├── assets/                    # Static assets (images, icons)
│   ├── images/
│   └── icons/
├── supabase/                  # Supabase backend configuration and functions
│   ├── config.toml            # Supabase project configuration
│   ├── functions/             # Supabase Edge Functions (API Proxies)
│   │   ├── _shared/           # Shared code for functions (e.g., CORS)
│   │   ├── deepseek-proxy/    # DeepSeek API proxy function
│   │   ├── elevenlabs-proxy/  # ElevenLabs API proxy function
│   │   └── gemini-proxy/      # Gemini API proxy function
│   └── migrations/            # Database migrations (if using Supabase DB)
└── docs/                      # Documentation files
    ├── planning-file.md       # Project planning document (updated)
    └── tasks-file.md          # Task management (needs update)
```

## Feature Documentation

### Recipe Generation

Sprout Notes uses the DeepSeek API via a Supabase Edge Function to generate custom vegan recipes. Users can:

- Enter ingredients they have available
- Select dietary restrictions (gluten-free, oil-free, nut-free, soy-free)
- Choose cuisine preferences
- Specify meal type and serving size

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

The frontend can be deployed to any static hosting provider (e.g., Vercel, Netlify, GitHub Pages). The backend (Edge Functions, optional Database/Auth) is deployed using the Supabase CLI:
```bash
# Deploy Edge Functions
cd supabase
supabase functions deploy --no-verify-jwt

# Deploy Database changes (if applicable)
supabase db push 
```
Ensure production environment variables (API keys, etc.) are set in the Supabase project dashboard.

## Progressive Web App (PWA)

Sprout Notes is implemented as a Progressive Web App, providing:

- Offline capabilities
- Home screen installation
- App-like experience
- Push notifications (where supported)

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
