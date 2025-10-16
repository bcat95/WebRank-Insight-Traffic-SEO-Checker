// Simple content script for Chrome extension
console.log('SimilarWeb content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'togglePopup') {
        // Handle popup toggle if needed
        console.log('Toggle popup requested');
    }
    return true;
});

// Simple initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('SimilarWeb content script initialized');
});