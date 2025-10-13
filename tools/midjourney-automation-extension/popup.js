let isRunning = false;
let isPaused = false;
let currentIndex = 0;
let prompts = [];

// Load saved settings and prompts
chrome.storage.local.get(['prompts', 'delay', 'batchSize', 'currentIndex'], (data) => {
  if (data.prompts) {
    document.getElementById('prompts').value = data.prompts;
  }
  if (data.delay) {
    document.getElementById('delay').value = data.delay;
  }
  if (data.batchSize) {
    document.getElementById('batchSize').value = data.batchSize;
  }
  if (data.currentIndex) {
    currentIndex = data.currentIndex;
    updateProgress();
  }
});

// Update status display
function updateStatus(message, isError = false) {
  const statusText = document.getElementById('statusText');
  statusText.textContent = message;
  statusText.style.color = isError ? '#f44336' : '#666';
}

// Update progress display
function updateProgress() {
  const progress = document.getElementById('progress');
  if (prompts.length > 0) {
    progress.textContent = `Progress: ${currentIndex}/${prompts.length} prompts completed`;
  } else {
    progress.textContent = '';
  }
}

// Parse prompts from textarea
function parsePrompts() {
  const textarea = document.getElementById('prompts');
  const text = textarea.value.trim();
  
  if (!text) {
    updateStatus('Please paste your prompts first!', true);
    return [];
  }
  
  // Split by newlines and filter out empty lines
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('```') && !line.startsWith('#'));
}

// Send message to content script
async function sendToContentScript(message) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    updateStatus('Error: Make sure you are on Midjourney/Discord!', true);
    isRunning = false;
  }
}

// Start button handler
document.getElementById('startBtn').addEventListener('click', async () => {
  if (isRunning) return;
  
  prompts = parsePrompts();
  if (prompts.length === 0) return;
  
  // Save settings
  const delay = parseInt(document.getElementById('delay').value);
  const batchSize = parseInt(document.getElementById('batchSize').value);
  
  chrome.storage.local.set({
    prompts: document.getElementById('prompts').value,
    delay: delay,
    batchSize: batchSize
  });
  
  isRunning = true;
  isPaused = false;
  updateStatus('Starting automation...');
  updateProgress();
  
  await sendToContentScript({
    action: 'start',
    prompts: prompts,
    delay: delay,
    batchSize: batchSize,
    startIndex: currentIndex
  });
});

// Pause button handler
document.getElementById('pauseBtn').addEventListener('click', () => {
  if (!isRunning) return;
  
  isPaused = !isPaused;
  updateStatus(isPaused ? 'Paused' : 'Resumed');
  
  sendToContentScript({
    action: isPaused ? 'pause' : 'resume'
  });
});

// Stop button handler
document.getElementById('stopBtn').addEventListener('click', () => {
  isRunning = false;
  isPaused = false;
  updateStatus('Stopped');
  
  sendToContentScript({
    action: 'stop'
  });
});

// Clear button handler
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear all prompts and reset progress?')) {
    document.getElementById('prompts').value = '';
    currentIndex = 0;
    prompts = [];
    updateStatus('Cleared');
    updateProgress();
    
    chrome.storage.local.remove(['prompts', 'currentIndex']);
  }
});

// Listen for progress updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'progress') {
    currentIndex = request.currentIndex;
    chrome.storage.local.set({ currentIndex: currentIndex });
    updateProgress();
    updateStatus(request.message);
  } else if (request.action === 'complete') {
    isRunning = false;
    currentIndex = 0;
    chrome.storage.local.remove('currentIndex');
    updateStatus('All prompts completed! 🎉');
  } else if (request.action === 'error') {
    isRunning = false;
    updateStatus(request.message, true);
  }
});

// Auto-save prompts on change
let saveTimeout;
document.getElementById('prompts').addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    chrome.storage.local.set({
      prompts: document.getElementById('prompts').value
    });
  }, 1000);
});