// Simple background script for Chrome extension
class SimilarWebBackground {
    constructor() {
        this.init();
    }

    init() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'fetchData':
                    const data = await this.fetchWebsiteData(request.domain);
                    sendResponse({ success: true, data });
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async fetchWebsiteData(domain) {
        try {
            // Fetch ranking data
            const rankResponse = await fetch(`https://rank.similarweb.com/api/v1/global?domain=${domain}`);
            const rankData = await rankResponse.json();

            // Fetch detailed data
            const dataResponse = await fetch(`https://data.similarweb.com/api/v1/data?domain=${domain}`);
            const dataData = await dataResponse.json();

            // Combine data
            return {
                ...rankData,
                ...dataData
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Failed to fetch website data');
        }
    }
}

// Initialize background script
new SimilarWebBackground();