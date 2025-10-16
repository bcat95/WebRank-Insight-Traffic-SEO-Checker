# WebRank Insight - Chrome Extension

A lightweight Chrome extension that displays website traffic and ranking insights using public SimilarWeb data sources.

![WebRank Insight](https://raw.githubusercontent.com/bcat95/WebRank-Insight-Traffic-SEO-Checker/refs/heads/main/images/og.png)

## Features

- **Website Rankings**: Global Rank, Country Rank, Category Rank  
- **Traffic & Engagement**: Monthly Visits, Bounce Rate, Pages per Visit, Average Duration  
- **Traffic Sources**: Top traffic sources breakdown  
- **Clean Interface**: Bootstrap-based responsive design

## Installation

1. Download or clone this repository  
2. Open Chrome and go to `chrome://extensions/`  
3. Enable **Developer mode** (top right corner)  
4. Click **Load unpacked** and select the extension folder  
5. The extension icon will appear in your Chrome toolbar

## Usage

1. Navigate to any website  
2. Click the **WebRank Insight** icon in the toolbar  
3. Instantly view the website’s estimated traffic and ranking data  

> ℹ️ Data is fetched from publicly available SimilarWeb endpoints for demonstration and educational purposes only.

## Requirements

- Google Chrome browser (Manifest V3 compatible)  
- Internet connection for fetching live data  

## File Structure

```

├── manifest.json          # Extension manifest
├── popup/
│   ├── popup.html        # Extension popup interface
│   ├── popup.js          # Popup logic
│   └── popup.css         # Popup styling
├── background/
│   └── background.js     # Background service worker
├── content/
│   ├── content.js        # Content script
│   └── content.css       # Content styles
├── _locales/
│   └── en/
│       └── messages.json # English translations
└── images/               # Extension icons

```

## API Endpoints

The extension retrieves ranking and engagement data from public endpoints:
- `https://rank.similarweb.com/api/v1/global`  
- `https://data.similarweb.com/api/v1/data`

## License

This extension is an **independent open-source educational project** and is **not affiliated with or endorsed by SimilarWeb Ltd.**
Use at your own discretion.