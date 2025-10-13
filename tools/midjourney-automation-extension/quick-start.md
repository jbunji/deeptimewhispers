# Quick Start: Processing Your Midjourney Prompts

## Step 1: Install the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Turn on "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `midjourney-automation-extension` folder

## Step 2: Prepare Your Prompts
Open one of your prompt files (e.g., `midjourney-prompts-first-rain.md`) and:

1. Copy just the prompt lines (not the headers or backticks)
2. Skip lines that start with:
   - `#` (headers)
   - ` ``` ` (code blocks)
   - Numbers like "1." or "2."

Example of what to copy:
```
Hyperrealistic Earth landscape 3.8 billion years ago completely shrouded in dense steam --ar 16:9 --v 6
Photorealistic view of early Earth's surface where water exists only as superheated steam --ar 16:9 --v 6
```

## Step 3: Use the Extension
1. Go to Midjourney (Discord web or website)
2. Click the extension icon (green play button)
3. Paste your prompts
4. Recommended settings:
   - Delay: 20 seconds (gives Midjourney time to process)
   - Batch size: 4 (sends 4 prompts, then waits)
5. Click "Start"

## Step 4: Let It Run
- Keep the popup window open
- You can switch tabs but keep Midjourney tab open
- Watch the progress counter
- Green indicator on the page shows it's working

## Time Estimates
- 100 prompts with 20-second delays ≈ 35-40 minutes
- 100 prompts with 15-second delays ≈ 25-30 minutes

## Pro Tips
1. **Test First**: Try with 5-10 prompts to ensure it's working
2. **Best Time**: Run during off-peak hours for faster processing
3. **Save Progress**: The extension saves your position - you can close and resume later
4. **Multiple Files**: Process one file completely before starting the next

## Quick Prompt Extraction
To quickly extract all prompts from a file using the terminal:

```bash
# Extract lines between triple backticks, excluding the backticks themselves
grep -v '```' midjourney-prompts-first-rain.md | grep -E '^(Hyperrealistic|Photorealistic)' > prompts-only.txt
```

This creates a clean file with just the prompts, ready to copy and paste!

## Troubleshooting Quick Fixes

**Not sending prompts?**
- Refresh the Midjourney page
- Make sure you're logged in
- Increase delay to 25-30 seconds

**Stopped working?**
- You might be rate-limited
- Take a 5-minute break
- Restart with longer delays

**Can't find input?**
- Make sure you're in a Midjourney channel (Discord)
- Or on the correct page (Midjourney website)

Ready to save hours of manual work? Let's go! 🚀