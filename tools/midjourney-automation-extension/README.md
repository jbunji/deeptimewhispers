# Midjourney Prompt Automator Chrome Extension

This Chrome extension automates the process of sending multiple prompts to Midjourney, saving you hours of manual copy-pasting.

## Features

- **Batch Processing**: Send hundreds of prompts automatically
- **Adjustable Delay**: Set delay between prompts (5-60 seconds)
- **Batch Mode**: Process prompts in groups to avoid overwhelming the system
- **Pause/Resume**: Pause automation at any time and resume where you left off
- **Progress Tracking**: See exactly how many prompts have been processed
- **Auto-Save**: Your prompts and progress are automatically saved
- **Visual Indicator**: On-screen indicator shows current processing status

## Installation

1. Create icon images (or use placeholders):
   - Create 16x16, 48x48, and 128x128 PNG images named `icon16.png`, `icon48.png`, and `icon128.png`
   - Place them in the extension folder

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `midjourney-automation-extension` folder

## How to Use

1. **Prepare Your Prompts**:
   - Copy all prompts from your Midjourney prompts document
   - Each prompt should be on a new line
   - The extension will automatically filter out empty lines and comment lines (starting with # or ```)

2. **Configure Settings**:
   - **Delay**: Time to wait between batches (default: 15 seconds)
   - **Batch Size**: Number of prompts to send before taking a break (default: 4)

3. **Start Processing**:
   - Navigate to Midjourney (Discord web or Midjourney website)
   - Click the extension icon to open the popup
   - Paste your prompts in the text area
   - Click "Start" to begin automation

4. **Monitor Progress**:
   - Keep the popup window open during processing
   - You'll see real-time progress updates
   - A green indicator appears on the webpage showing current status

## Tips for Best Results

- **Optimal Settings**: 
  - For 100+ prompts: Use 15-20 second delays with batch size of 4
  - This prevents rate limiting and ensures all prompts are processed

- **Prompt Formatting**:
  - Remove the triple backticks (```) from code blocks
  - Each prompt should be complete on one line
  - Include all parameters (--ar 16:9 --v 6) in each prompt

- **During Processing**:
  - Keep the Midjourney tab active
  - Don't interact with the page while processing
  - You can browse other tabs, just keep the Midjourney tab open

## Troubleshooting

- **Can't find input field**: Make sure you're on the correct page and logged in
- **Prompts not sending**: Try increasing the delay between prompts
- **Extension stops**: Check if you've been rate-limited and increase delays

## Example Workflow

1. Open your Midjourney prompts document
2. Select all prompts (skip the backticks and headers)
3. Copy with Ctrl+C (or Cmd+C on Mac)
4. Open the extension popup
5. Paste into the text area
6. Adjust settings if needed
7. Click Start and let it run!

## Creating Icons

To create simple icon files, you can use this Python script:

```python
from PIL import Image, ImageDraw

sizes = [(16, 16), (48, 48), (128, 128)]
color = (76, 175, 80)  # Green color matching the Start button

for width, height in sizes:
    img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a rounded rectangle
    draw.rounded_rectangle(
        [(0, 0), (width-1, height-1)], 
        radius=width//8, 
        fill=color
    )
    
    # Add a play symbol
    points = [
        (width*0.35, height*0.25),
        (width*0.35, height*0.75),
        (width*0.7, height*0.5)
    ]
    draw.polygon(points, fill=(255, 255, 255))
    
    img.save(f'icon{width}.png')
```

Or simply create solid color squares in any image editor.

## Privacy & Security

- This extension only runs on Midjourney/Discord pages
- No data is sent to external servers
- All prompts are stored locally in your browser
- The extension has minimal permissions for security

## Support

If you encounter issues:
1. Check the browser console for error messages (F12 > Console)
2. Try refreshing the Midjourney page
3. Ensure you're using the latest version of Chrome
4. Adjust delay and batch settings for your use case