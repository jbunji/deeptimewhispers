# Deep Time Whispers Project Rules for Claude

## CRITICAL: File Organization Rules

### Website Files MUST Follow This Structure:
- **HTML files** → `website/` or `website/pages/`
- **CSS files** → `website/css/`
- **JS files** → `website/js/`
- **Images/assets** → `website/assets/`
- **Textures** → `website/textures/`

**NEVER place website files in the root directory!**

### Exceptions (Already in Root):
- `index.html` - Main entry point
- `timeline.html` - Legacy, should be moved
- Main `css/` and `js/` directories for root pages

## Project Structure Overview
```
DeepTimeWhispers/
├── website/              # All new web features go here
│   ├── pages/           # HTML pages
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript
│   ├── assets/          # Images, icons
│   └── textures/        # Map textures
├── content/             # Podcast content
├── docs/                # Documentation
├── api/                 # API endpoints (Vercel)
└── [root files]         # Config, main index
```

## Design & Branding Rules

### Deep Time Whispers Brand Identity
This is an educational platform about Earth's deep history, not just a tech demo.

#### Color Palette (from main.css):
- Primary Purple: `#7B1FA2`
- Deep Purple: `#4A148C`
- Cosmic Teal: `#4DB6AC`
- Midnight: `#1A237E`
- Space Black: `#0A0E27`
- Soft White: `#F5F5F5`

#### Typography:
- Headers: 'Crimson Text' (serif)
- Body: 'Raleway' (sans-serif)

#### Required Elements:
1. Cosmic/space theme with animated starfield background
2. Purple/teal gradient accents
3. The Chrononaut's voice/personality in content
4. Educational focus - this is "Khan Academy of Deep Time"
5. Mobile-first responsive design

## Ancient Earth Feature Requirements

### From the Roadmap (docs/WEBSITE_EXPANSION_ROADMAP.md):

#### Phase 2 Features (Current):
- [x] Basic location tracking through time
- [x] Continental drift visualization
- [x] Time period information
- [ ] "What lived here?" panel with period-appropriate life
- [ ] Environmental conditions for each period
- [ ] Share specific time/location combinations
- [ ] Location search with geocoding
- [ ] Climate indicators (ice caps, sea levels)
- [ ] Major event markers on timeline

#### Missing Core Features:
1. **Unified Design** - Must match Deep Time Whispers aesthetic
2. **Educational Content** - Period descriptions, life forms, climate
3. **Shareable Links** - Deep links to specific time/location
4. **What Lived Here** - Database of period-appropriate organisms
5. **Visual Polish** - Proper loading states, transitions, mobile UX

## Code Quality Standards

### Always:
- Use semantic HTML5 elements
- Follow accessibility guidelines (ARIA labels, keyboard nav)
- Comment complex logic
- Use CSS variables for theming
- Test on mobile devices
- Handle errors gracefully

### Never:
- Place web files in root directory (except index.html)
- Use inline styles for theming
- Forget mobile responsiveness
- Skip loading states
- Ignore the educational mission

## API & Integration Rules

### GPlates API:
- Always use Vercel proxy at `/api/gplates/reconstruct`
- Cache results to minimize API calls
- Provide fallback calculations
- Handle CORS properly

### Texture Loading:
- Use progressive loading
- Show loading progress
- Optimize file sizes
- Provide low-res previews

## Git Commit Standards
- Clear, descriptive commit messages
- Reference issue numbers when applicable
- Group related changes
- Test before committing
- Don't commit large binary files

## Priority Order for Development
1. Fix file organization issues
2. Apply Deep Time Whispers branding
3. Implement missing roadmap features
4. Polish mobile experience
5. Add educational content
6. Performance optimization

## Remember: This is Deep Time Whispers
Every feature should:
- Educate about Earth's history
- Maintain the cosmic/mystical aesthetic
- Be accessible to all users
- Connect to the podcast content
- Inspire wonder about deep time