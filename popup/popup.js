// Simple popup script for Chrome extension
class SimilarWebPopup {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.getCurrentTab();
            await this.fetchWebsiteData();
        } catch (error) {
            this.showError();
        }
    }

    async getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) {
            throw new Error('No active tab found');
        }
        
        this.currentDomain = this.extractDomain(tab.url);
        if (!this.currentDomain) {
            throw new Error('Invalid domain');
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return null;
        }
    }

    async fetchWebsiteData() {
        try {
            // Show loading state
            this.showLoading();

            // Fetch data from background script
            const response = await chrome.runtime.sendMessage({
                action: 'fetchData',
                domain: this.currentDomain
            });

            if (response && response.success) {
                this.displayData(response.data);
            } else {
                this.showNoData();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            this.showError();
        }
    }

    displayData(data) {
        console.log('Displaying data:', data);
        this.hideAllViews();
        document.getElementById('data-view').classList.remove('d-none');

        // Display rankings
        this.setElementValue('global-rank', this.formatRank(data.GlobalRank?.Rank));
        this.setElementValue('country-rank', this.formatRank(data.CountryRank?.Rank));
        this.setElementValue('category-rank', this.formatRank(data.CategoryRank?.Rank));

        // Display traffic metrics from Engagments object
        const engagements = data.Engagments || {};
        console.log('Engagements data:', engagements);
        
        const monthlyVisits = data.EstimatedMonthlyVisits?.[Object.keys(data.EstimatedMonthlyVisits || {})[0]];
        this.setElementValue('monthly-visits', this.formatNumber(monthlyVisits));
        
        const bounceRate = engagements.BounceRate;
        if (bounceRate !== undefined && bounceRate !== null) {
            this.setElementValue('bounce-rate', this.formatPercentage(bounceRate));
        } else {
            this.setElementValue('bounce-rate', 'N/A');
        }

        const pagesPerVisit = engagements.PagePerVisit;
        this.setElementValue('pages-per-visit', this.formatNumber(pagesPerVisit, 2));

        const avgDuration = engagements.TimeOnSite;
        this.setElementValue('avg-duration', this.formatDuration(avgDuration));

        // Display traffic sources
        console.log('Traffic sources:', data.TrafficSources);
        this.displayTrafficSources(data.TrafficSources || {});
    }

    displayTrafficSources(sources) {
        const container = document.getElementById('traffic-sources');
        container.innerHTML = '';

        const sourceTypes = [
            { key: 'Direct', label: 'Direct' },
            { key: 'Search', label: 'Search' },
            { key: 'Social', label: 'Social' },
            { key: 'Referrals', label: 'Referrals' },
            { key: 'Mail', label: 'Email' },
            { key: 'Paid Referrals', label: 'Paid Ads' }
        ];

        // Sort sources by value (descending)
        const sortedSources = sourceTypes
            .map(source => ({
                ...source,
                value: sources[source.key] || 0
            }))
            .filter(source => source.value > 0)
            .sort((a, b) => b.value - a.value);

        sortedSources.forEach(source => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <span>${source.label}</span>
                <span class="badge bg-primary rounded-pill">${this.formatPercentage(source.value)}</span>
            `;
            container.appendChild(item);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="list-group-item text-muted text-center">No traffic source data available</div>';
        }
    }

    formatRank(rank) {
        if (typeof rank === 'string') {
            const parsed = parseFloat(rank);
            if (!isNaN(parsed) && parsed > 0) {
                rank = parsed;
            } else {
                return 'N/A';
            }
        }

        if (typeof rank !== 'number' || isNaN(rank) || rank <= 0) return 'N/A';
        return `#${this.formatNumber(rank)}`;
    }

    formatNumber(num, decimals = 0) {
        if (typeof num === 'string') {
            const parsed = parseFloat(num);
            if (!isNaN(parsed) && parsed > 0) {
                num = parsed;
            } else {
                return 'N/A';
            }
        }

        if (typeof num !== 'number' || isNaN(num) || num <= 0) return 'N/A';
        
        if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
        
        return num.toFixed(decimals);
    }

    formatPercentage(num) {
        if (typeof num === 'string') {
            const parsed = parseFloat(num);
            if (!isNaN(parsed) && parsed >= 0) {
                num = parsed;
            } else {
                return 'N/A';
            }
        }

        if (typeof num !== 'number' || isNaN(num) || num < 0) return 'N/A';
        if (num === 0) return '0%';
        // Convert decimal to percentage (0.5557 -> 55.6%)
        return `${(num * 100).toFixed(1)}%`;
    }

    formatDuration(seconds) {
        if (typeof seconds === 'string') {
            const parsed = parseFloat(seconds);
            if (!isNaN(parsed) && parsed > 0) {
                seconds = parsed;
            } else {
                return 'N/A';
            }
        }
        
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) return 'N/A';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }

    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    showLoading() {
        this.hideAllViews();
        document.getElementById('loading').classList.remove('d-none');
    }

    showError() {
        this.hideAllViews();
        document.getElementById('error').classList.remove('d-none');
    }

    showNoData() {
        this.hideAllViews();
        document.getElementById('no-data').classList.remove('d-none');
    }

    hideAllViews() {
        document.getElementById('loading').classList.add('d-none');
        document.getElementById('error').classList.add('d-none');
        document.getElementById('no-data').classList.add('d-none');
        document.getElementById('data-view').classList.add('d-none');
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SimilarWebPopup();
});