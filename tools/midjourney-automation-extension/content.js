let isRunning = false;
let isPaused = false;
let prompts = [];
let currentIndex = 0;
let delay = 15000;
let batchSize = 4;

// Helper function to find the prompt input field
function findPromptInput() {
  // For Discord web
  const discordInput = document.querySelector('[data-slate-editor="true"]');
  if (discordInput) return discordInput;
  
  // For Midjourney website (adjust selector as needed)
  const mjInput = document.querySelector('input[placeholder*="prompt"], textarea[placeholder*="prompt"], [contenteditable="true"]');
  if (mjInput) return mjInput;
  
  // Fallback: look for any text input or contenteditable
  const inputs = document.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]');
  for (const input of inputs) {
    const rect = input.getBoundingClientRect();
    if (rect.width > 200 && rect.height > 20 && rect.bottom > 0) {
      return input;
    }
  }
  
  return null;
}

// Helper function to set text in various input types
async function setInputText(input, text) {
  if (!input) return false;
  
  // Focus the input
  input.focus();
  input.click();
  
  // Clear existing content
  if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // For contenteditable elements
    input.textContent = '';
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('delete', false);
  }
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Set new text
  if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    // For contenteditable elements
    document.execCommand('insertText', false, text);
  }
  
  // Trigger change events
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new InputEvent('input', { 
    bubbles: true, 
    cancelable: true,
    inputType: 'insertText',
    data: text 
  }));
  
  return true;
}

// Helper function to simulate Enter key press
async function pressEnter(input) {
  if (!input) return false;
  
  const enterEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });
  
  input.dispatchEvent(enterEvent);
  
  // Also try keypress and keyup
  input.dispatchEvent(new KeyboardEvent('keypress', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true
  }));
  
  input.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true
  }));
  
  // For Discord, might need to find and click send button
  const sendButton = document.querySelector('button[aria-label*="Send"], button[type="submit"]');
  if (sendButton) {
    sendButton.click();
  }
  
  return true;
}

// Process a single prompt
async function processPrompt(prompt, index) {
  const input = findPromptInput();
  
  if (!input) {
    sendProgress(index, 'Error: Cannot find prompt input field', true);
    return false;
  }
  
  sendProgress(index, `Processing prompt ${index + 1}/${prompts.length}`);
  
  // Set the prompt text
  const textSet = await setInputText(input, prompt);
  if (!textSet) {
    sendProgress(index, 'Error: Failed to set prompt text', true);
    return false;
  }
  
  // Small delay before sending
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Press Enter to send
  await pressEnter(input);
  
  return true;
}

// Process prompts in batches
async function processBatch(startIdx) {
  const endIdx = Math.min(startIdx + batchSize, prompts.length);
  
  for (let i = startIdx; i < endIdx && isRunning && !isPaused; i++) {
    const success = await processPrompt(prompts[i], i);
    if (!success) {
      isRunning = false;
      return;
    }
    
    currentIndex = i + 1;
    
    // Wait between prompts in the same batch (shorter delay)
    if (i < endIdx - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Main processing loop
async function startProcessing(startIndex = 0) {
  currentIndex = startIndex;
  
  while (currentIndex < prompts.length && isRunning) {
    if (!isPaused) {
      // Process a batch
      await processBatch(currentIndex);
      
      // Wait longer between batches
      if (currentIndex < prompts.length && isRunning && !isPaused) {
        sendProgress(currentIndex, `Waiting ${delay/1000} seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } else {
      // Check every second if we should resume
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (currentIndex >= prompts.length) {
    chrome.runtime.sendMessage({ action: 'complete' });
  }
}

// Send progress update to popup
function sendProgress(index, message, isError = false) {
  chrome.runtime.sendMessage({
    action: isError ? 'error' : 'progress',
    currentIndex: index,
    message: message
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'start') {
    prompts = request.prompts;
    delay = request.delay * 1000;
    batchSize = request.batchSize;
    isRunning = true;
    isPaused = false;
    startProcessing(request.startIndex);
  } else if (request.action === 'pause') {
    isPaused = true;
  } else if (request.action === 'resume') {
    isPaused = false;
  } else if (request.action === 'stop') {
    isRunning = false;
    isPaused = false;
  }
});

// Add visual indicator when extension is active
let indicator;
function createIndicator() {
  if (indicator) return;
  
  indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    display: none;
  `;
  document.body.appendChild(indicator);
}

// Update indicator
function updateIndicator(text, color = '#4CAF50') {
  if (!indicator) createIndicator();
  indicator.textContent = text;
  indicator.style.background = color;
  indicator.style.display = 'block';
  
  if (!isRunning) {
    setTimeout(() => {
      if (indicator) indicator.style.display = 'none';
    }, 3000);
  }
}

// Create indicator on load
createIndicator();

// Watch for status changes
setInterval(() => {
  if (isRunning && !isPaused) {
    updateIndicator(`Processing: ${currentIndex}/${prompts.length}`, '#4CAF50');
  } else if (isRunning && isPaused) {
    updateIndicator('Paused', '#ff9800');
  }
}, 1000);