# Deep Time Whispers Landing Page

A beautiful, atmospheric landing page for the Deep Time Whispers podcast.

## Setup

1. Update the Spotify embed code in `index.html` (line 134) with your actual episode ID
2. Update platform links in `script.js` (bottom of file)
3. Add the chrononaut hourglass image to this directory
4. Deploy to GitHub Pages

## Deployment

```bash
git add .
git commit -m "Add landing page"
git push
```

Then in GitHub:
- Go to Settings > Pages
- Source: Deploy from branch
- Branch: main
- Folder: /landing-page

Your site will be live at: `https://[username].github.io/deeptimewhispers`

## Features

- Animated starfield background
- Smooth scrolling navigation
- Mobile responsive design
- Episode embed section
- Platform links
- Review section
- Three content pillars showcase

## Customization

- Colors are defined in CSS variables at the top of `styles.css`
- Add your actual podcast platform links in `script.js`
- Reviews can be updated directly in `index.html`