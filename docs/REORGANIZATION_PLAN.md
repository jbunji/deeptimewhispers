# Deep Time Whispers Project Reorganization Plan

## Current Issues
- Web files mixed with content files
- No clear separation between podcast and educational features
- Difficult to scale with upcoming features
- No consistent navigation structure

## Proposed New Structure

### Directory Layout
```
DeepTimeWhispers/
├── website/                    # All web application files
│   ├── src/                   # Source code
│   │   ├── pages/            # HTML pages
│   │   │   ├── index.html    # Main landing (podcast focus)
│   │   │   ├── explore.html  # Educational hub (new)
│   │   │   ├── timeline.html
│   │   │   ├── ancient-earth.html
│   │   │   ├── cosmic-calendar.html
│   │   │   └── ask-chrononaut.html
│   │   ├── css/              # Stylesheets
│   │   │   ├── main.css      # Global styles & variables
│   │   │   ├── podcast.css   # Podcast-specific styles
│   │   │   ├── timeline.css  # Timeline feature
│   │   │   └── educational.css # Educational features
│   │   ├── js/               # JavaScript modules
│   │   │   ├── app.js        # Main application
│   │   │   ├── navigation.js # Shared navigation
│   │   │   ├── timeline.js   
│   │   │   ├── ancient-earth.js
│   │   │   └── utils.js      # Shared utilities
│   │   ├── data/             # JSON data files
│   │   │   ├── timeline-events.json
│   │   │   ├── episodes.json # Podcast episodes
│   │   │   └── glossary.json
│   │   └── components/       # Reusable HTML components
│   │       ├── nav-bar.html
│   │       └── footer.html
│   ├── assets/               # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── logos/
│   └── dist/                 # Production build
│
├── content/                   # All podcast content (no changes)
├── brand/                     # Brand assets
├── docs/                      # Documentation
├── tools/                     # Development tools
└── [root config files]
```

## Navigation Design

### Option 1: Dual-Purpose Homepage
```
Homepage Sections:
1. Hero: Podcast focus with "Explore Deep Time" CTA
2. Latest Episodes
3. Educational Portal section
4. About/Reviews
```

### Option 2: Separate But Equal (Recommended)
```
Two Main Entry Points:
- index.html → Podcast Landing (current design)
- explore.html → Educational Hub (new)

Unified Navigation Bar:
[Logo] | Listen | Explore | Timeline | About
         ↓        ↓
         Podcast  Education Hub
```

## Implementation Steps

### Phase 1: Directory Setup
1. Create new directory structure
2. Move existing files to appropriate locations
3. Update all file paths and links

### Phase 2: Navigation System
1. Create shared navigation component
2. Add "Explore" section to main nav
3. Build educational hub page

### Phase 3: Unify Design
1. Extract common CSS variables
2. Create consistent component library
3. Ensure mobile responsiveness

## Benefits
- Clean separation of concerns
- Easy to add new features
- Better developer experience
- Scalable architecture
- Clear user journey

## Migration Commands
```bash
# Create new structure
mkdir -p website/{src/{pages,css,js,data,components},assets/{images,icons,logos},dist}
mkdir -p {docs/guides,tools/scripts}

# Move web files
mv index.html timeline.html website/src/pages/
mv styles.css timeline-styles.css website/src/css/
mv script.js timeline.js website/src/js/
mv data/*.json website/src/data/

# Move documentation
mv *.md docs/
mv midjourney-automation-extension tools/

# Move brand assets
mv Brand/* brand/
```

## Next Steps
1. Review and approve structure
2. Execute migration
3. Update build process
4. Create educational hub
5. Implement unified navigation