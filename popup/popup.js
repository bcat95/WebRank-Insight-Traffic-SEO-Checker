// Enhanced popup script for Chrome extension
class SimilarWebPopup {
    constructor() {
        this.chart = null;
        this.init();
    }

    async init() {
        try {
            await this.getCurrentTab();
            await this.fetchWebsiteData();
        } catch (error) {
            console.error('Initialization error:', error);
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

        // Display site information
        this.setElementValue('site-name', data.SiteName || this.currentDomain);
        this.setElementValue('site-description', data.Description || 'No description available');

        // Display rankings
        this.setElementValue('global-rank', this.formatRank(data.GlobalRank?.Rank));
        this.setElementValue('country-rank', this.formatRank(data.CountryRank?.Rank));
        this.setElementValue('category-rank', this.formatRank(data.CategoryRank?.Rank));

        // Display traffic metrics
        const engagements = data.Engagments || {};
        const monthlyVisits = data.EstimatedMonthlyVisits || {};

        // Get the most recent month's data
        const latestMonth = Object.keys(monthlyVisits).sort().pop();
        const latestVisits = monthlyVisits[latestMonth];
        this.setElementValue('monthly-visits', this.formatNumber(latestVisits));

        // Calculate trend if we have previous month data
        if (Object.keys(monthlyVisits).length >= 2) {
            const sortedMonths = Object.keys(monthlyVisits).sort();
            const currentMonth = sortedMonths[sortedMonths.length - 1];
            const previousMonth = sortedMonths[sortedMonths.length - 2];

            const currentVisits = monthlyVisits[currentMonth];
            const previousVisits = monthlyVisits[previousMonth];

            const trend = ((currentVisits - previousVisits) / previousVisits) * 100;
            const trendElement = document.getElementById('visits-trend');

            if (trend > 0) {
                trendElement.innerHTML = `<i class="bi bi-arrow-up trend-up"></i> ${Math.abs(trend).toFixed(1)}%`;
                trendElement.className = 'text-success small';
            } else if (trend < 0) {
                trendElement.innerHTML = `<i class="bi bi-arrow-down trend-down"></i> ${Math.abs(trend).toFixed(1)}%`;
                trendElement.className = 'text-danger small';
            } else {
                trendElement.textContent = 'No change';
                trendElement.className = 'text-muted small';
            }
        }

        // Display engagement metrics
        this.setElementValue('bounce-rate', this.formatPercentage(engagements.BounceRate));
        this.setElementValue('pages-per-visit', this.formatNumber(engagements.PagePerVisit, 2));
        this.setElementValue('avg-duration', this.formatDuration(engagements.TimeOnSite));
        this.setElementValue('total-visits', this.formatNumber(engagements.Visits));

        // Display traffic sources
        this.displayTrafficSourcesOverview(data.TrafficSources || {});
        this.displayTrafficSourcesDetailed(data.TrafficSources || {});

        // Display top countries
        this.displayTopCountries(data.TopCountryShares || []);

        // Display top keywords
        this.displayTopKeywords(data.TopKeywords || []);

        // Create visits chart
        this.createVisitsChart(monthlyVisits);
    }

    displayTrafficSourcesOverview(sources) {
        const container = document.getElementById('traffic-sources-overview');
        container.innerHTML = '';

        const sourceTypes = [
            { key: 'Direct', label: 'Direct', color: '#4e73df' },
            { key: 'Search', label: 'Search', color: '#1cc88a' },
            { key: 'Social', label: 'Social', color: '#36b9cc' },
            { key: 'Referrals', label: 'Referrals', color: '#f6c23e' },
            { key: 'Mail', label: 'Email', color: '#e74a3b' },
            { key: 'Paid Referrals', label: 'Paid Ads', color: '#858796' }
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
            item.className = 'traffic-source-item';
            item.innerHTML = `
                <div class="traffic-source-label">
                    <span>${source.label}</span>
                    <span>${this.formatPercentage(source.value)}</span>
                </div>
                <div class="traffic-source-bar">
                    <div class="traffic-source-fill" style="width: ${source.value * 100}%; background-color: ${source.color};"></div>
                </div>
            `;
            container.appendChild(item);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="text-muted text-center">No traffic source data available</div>';
        }
    }

    displayTrafficSourcesDetailed(sources) {
        const container = document.getElementById('traffic-sources-detailed');
        container.innerHTML = '';

        const sourceTypes = [
            { key: 'Direct', label: 'Direct', icon: 'bi-link-45deg' },
            { key: 'Search', label: 'Search', icon: 'bi-search' },
            { key: 'Social', label: 'Social', icon: 'bi-share' },
            { key: 'Referrals', label: 'Referrals', icon: 'bi-arrow-return-right' },
            { key: 'Mail', label: 'Email', icon: 'bi-envelope' },
            { key: 'Paid Referrals', label: 'Paid Ads', icon: 'bi-cash-stack' }
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
                <div class="d-flex align-items-center">
                    <i class="${source.icon} me-2"></i>
                    <span>${source.label}</span>
                </div>
                <span class="badge bg-primary rounded-pill">${this.formatPercentage(source.value)}</span>
            `;
            container.appendChild(item);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="list-group-item text-muted text-center">No traffic source data available</div>';
        }
    }

    displayTopCountries(countries) {
        const container = document.getElementById('top-countries');
        container.innerHTML = '';

        // Sort countries by value (descending)
        const sortedCountries = countries
            .map(country => ({
                ...country,
                flagUrl: `https://flagcdn.com/w20/${country.CountryCode.toLowerCase()}.png`
            }))
            .sort((a, b) => b.Value - a.Value)
            .slice(0, 10); // Show top 10 countries

        sortedCountries.forEach(country => {
            const item = document.createElement('div');
            item.className = 'country-item';
            item.innerHTML = `
                <img src="${country.flagUrl}" alt="${country.CountryCode}" class="country-flag">
                <div class="country-name">${country.CountryCode}</div>
                <div class="country-share">${this.formatPercentage(country.Value)}</div>
            `;
            container.appendChild(item);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="text-muted text-center">No country data available</div>';
        }
    }

    displayTopKeywords(keywords) {
        const container = document.getElementById('top-keywords');
        container.innerHTML = '';

        // Sort keywords by estimated value (descending)
        const sortedKeywords = keywords
            .sort((a, b) => b.EstimatedValue - a.EstimatedValue)
            .slice(0, 10); // Show top 10 keywords

        sortedKeywords.forEach(keyword => {
            const item = document.createElement('div');
            item.className = 'keyword-item';
            item.innerHTML = `
                <div class="keyword-name">${keyword.Name}</div>
                <div class="keyword-stats">
                    <span class="keyword-volume">Volume: ${this.formatNumber(keyword.Volume)}</span>
                    <span class="keyword-value">Value: $${this.formatNumber(keyword.EstimatedValue)}</span>
                </div>
            `;
            container.appendChild(item);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="text-muted text-center">No keyword data available</div>';
        }
    }

    createVisitsChart(monthlyVisits) {
        const ctx = document.getElementById('visits-chart').getContext('2d');

        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }

        // Prepare data
        const labels = Object.keys(monthlyVisits).sort();
        const data = labels.map(month => monthlyVisits[month]);

        // Format labels to be more readable
        const formattedLabels = labels.map(label => {
            const date = new Date(label);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [{
                    label: 'Monthly Visits',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Visits: ${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function (value) {
                                if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
                                if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
                                if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
                                return value;
                            }
                        }
                    }
                }
            }
        });
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