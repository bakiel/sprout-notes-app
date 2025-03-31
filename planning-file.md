# Sprout Notes - Project Planning Document

## Project Vision

Sprout Notes aims to be the go-to application for vegan cooking enthusiasts, combining AI-powered recipe generation with smart note-taking capabilities. The app will help users discover new plant-based recipes based on available ingredients, organize culinary thoughts, and build a personalized collection of vegan dishes.

## Target Audience

- **Primary**: Vegan and plant-based eaters (ages 25-45)
- **Secondary**: People transitioning to plant-based diets
- **Tertiary**: Meal planners and food enthusiasts interested in reducing meat consumption

## User Personas

### Alex (Primary)
- 32-year-old experienced vegan
- Tech-savvy urban professional
- Cooks 4-5 times per week
- Struggles with recipe creativity and using leftover ingredients
- Wants to organize personal recipe modifications

### Jordan (Secondary)
- 28-year-old new to plant-based eating
- Health-focused and environmentally conscious
- Learning to cook vegan meals
- Needs guidance on ingredient substitutions
- Often searches "what can I make with X ingredients"

### Sam (Tertiary)
- 41-year-old parent who meal plans
- Reducing family meat consumption
- Cooks for multiple dietary preferences
- Needs efficient organization of weekly meals
- Values voice features for hands-free cooking

## Core Feature Set

### MVP (Minimum Viable Product)

1. **Recipe Generation**
   - Input ingredients to generate recipes
   - Basic dietary restriction filters
   - Save generated recipes
   - Recipe rating and review system

2. **Note-Taking**
   - Create and save cooking notes
   - Basic organization (tags, search)
   - Link notes to recipes

3. **User Interface**
   - Mobile-responsive design
   - Simple navigation
   - Recipe display with ingredients and instructions

### Phase 2 (Post-MVP)

4. **Image Recognition**
   - Identify ingredients from photos
   - Generate recipes from identified ingredients
   - Mobile camera integration

5. **Voice Features**
   - Text-to-speech for recipes
   - Basic playback controls
   - Voice selection

6. **Enhanced Organization**
   - AI-based categorization
   - Smart tagging
   - Advanced search and filters

### Phase 3 (Future Enhancements)

7. **Community Features**
   - Recipe sharing
   - Community collections
   - User profiles

8. **Advanced Personalization**
   - Learning from user preferences
   - Personalized recommendations
   - Dietary tracking

9. **Extended Capabilities**
   - Meal planning calendar
   - Grocery list generation
   - Nutritional analysis

## Technical Architecture

### Frontend

- **Framework**: React (using Vite for build tooling)
- **UI/Design**: Mobile-first approach using CSS (potentially CSS Modules or a UI library later)
- **Responsiveness**: CSS Flexbox and Grid
- **Assets**: Icons via `react-icons`, optimized images
- **PWA Features**: Service workers for offline capability
- **Hosting**: GitHub Pages

### Backend

- **Platform**: Supabase
- **API Proxies**: Supabase Edge Functions (TypeScript) for secure API access
- **Direct API Access**: Fallback mechanism when Supabase/Docker isn't available
- **Database**: Supabase PostgreSQL (optional, for user data/saved recipes)
- **Authentication**: Supabase Auth (optional, for user accounts)
- **Security**: API keys managed via Supabase environment variables, Row Level Security (RLS) if using database.

### External APIs

1. **DeepSeek API**
   - Purpose: Generate custom vegan recipes
   - Implementation: Supabase Edge Function proxy for security with direct API fallback
   - Key features used: Recipe generation based on ingredients and preferences

2. **ElevenLabs API**
   - Purpose: Text-to-speech for recipe narration
   - Implementation: Supabase Edge Function proxy with potential caching
   - Key features used: Voice selection, audio playback

3. **Google Gemini API**
   - Purpose: Image recognition and note organization
   - Implementation: Supabase Edge Function proxy
   - Key features used: Image analysis, text categorization

### Data Storage

- **Client-side**: LocalStorage for user preferences and offline data (recipes, notes).
- **Server-side (Optional)**: Supabase Database (PostgreSQL) for persistent storage of user accounts, saved recipes, notes, and community features. Synchronization between local and server storage needed if implemented.

## User Flows

### Recipe Generation Flow

1. User navigates to recipe creation screen
2. User inputs available ingredients
3. User selects dietary restrictions and preferences
4. System sends request to DeepSeek API
5. System displays generated recipe
6. User can save, edit with AI assistance, or regenerate the recipe

### Image Recognition Flow

1. User selects "Identify Ingredients" option
2. User takes photo or uploads image
3. System sends image to Gemini API
4. System displays identified ingredients
5. User confirms or edits ingredients
6. System generates recipe suggestions based on ingredients

### Note Creation Flow

1. User navigates to notes section
2. User creates new note
3. User writes content
4. System analyzes content for tags/categories
5. User saves note
6. System organizes note in appropriate collections

## UI/UX Design Principles

### Design System

- **Color Palette**: 
  - Primary: #2e7d32 (Green)
  - Secondary: #8bc34a (Light Green)
  - Neutral: #f5f5dc (Beige)
  - Accent: #1b5e20 (Dark Green)
  - Text: #333333 (Dark Gray)

- **Typography**:
  - Primary Font (Body): Poppins (Regular 400)
  - Secondary Font (Headings): Montserrat (Semi-bold 600)
  - Scale: 1rem base with 1.25 ratio

- **Spacing System**:
  - Base unit: 8px
  - Padding/margins follow 8px increments (8px, 16px, 24px, etc.)

- **Components**:
  - Cards for recipes and notes
  - Form elements with consistent styling
  - Buttons with clear hover/active states
- **Icons**: `react-icons` library (includes Font Awesome Free, Material Design, etc.)

### Accessibility Considerations

- Minimum contrast ratios for text (4.5:1)
- Alternative text for all images
- Keyboard navigation support
- Screen reader friendly elements
- Touch targets minimum 44x44px for mobile

## Performance Optimization

- Lazy loading of images
- Resource minification (CSS, JS)
- SVG for icons
- Efficient caching strategy
- Image optimization

## Testing Strategy

### Unit Testing

- Test individual service classes
- Validate core utility functions
- Ensure API integrations work as expected

### Integration Testing

- Test complete user flows
- Validate interactions between components
- Ensure data persistence works correctly

### Usability Testing

- Test with representative users
- Focus on recipe generation workflow
- Evaluate voice feature usability
- Assess mobile experience

## Development Roadmap

### Phase 1 (Weeks 1-4)

- Project setup and initial structure
- Basic UI implementation
- DeepSeek API integration
- Recipe generation functionality
- Basic note-taking features

### Phase 2 (Weeks 5-8)

- ElevenLabs API integration
- Voice feature implementation
- UI refinements
- Responsive design improvements
- PWA implementation

### Phase 3 (Weeks 9-12)

- Gemini API integration
- Image recognition features
- Note organization enhancements
- Testing and bug fixes
- Performance optimization

### Phase 4 (Future)

- Community features
- Advanced personalization
- Extended capabilities
- Analytics integration

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API cost escalation | High | Medium | Implement usage tracking, caching, and rate limiting |
| Performance issues on mobile | Medium | Medium | Mobile-first development, performance testing |
| User privacy concerns | High | Low | Clear privacy policy, minimal data collection |
| API service disruption | High | Low | Implemented direct API fallback when Supabase Edge Functions are unavailable |
| Browser compatibility issues | Medium | Medium | Cross-browser testing, feature detection |

## Success Metrics

- **User Engagement**: Average time in app, recipes generated per user
- **Retention**: Return rate, saved recipes per user
- **Feature Usage**: Voice feature adoption, image recognition usage
- **User Satisfaction**: Feedback scores, feature requests
- **Performance**: Load times, API response times

## Open Questions & Decisions

1. **User Authentication**
   - Do we implement user accounts for the MVP?
   - If so, what authentication method?

2. **Monetization Strategy**
   - Free with limitations vs. subscription model
   - API usage costs vs. potential revenue

3. **Data Storage & Authentication**
   - MVP: LocalStorage only, no user accounts.
   - Post-MVP: Implement Supabase Auth and Database for user accounts, cloud sync, and sharing features?
   - Define data schema for Supabase DB if used.
   - Import/export capabilities for local data.

4. **Offline Capabilities**
   - Extent of offline functionality
   - Sync resolution strategy

## Appendix

### API Documentation Links

- [DeepSeek API Documentation](https://api.deepseek.com/docs)
- [ElevenLabs API Documentation](https://api.elevenlabs.io/docs)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

### Reference Projects

- Similar apps in the space
- Open source projects to leverage
- Design inspiration sources

---

*This is a living document that will be updated as the project evolves and decisions are made.*
