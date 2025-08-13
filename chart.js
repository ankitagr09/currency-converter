/**
 * CurrencyFlow - Exchange Rate Chart Functionality
 * Creates and manages interactive charts for currency exchange rates
 * @author Your Name
 * @version 1.0.0
 */

// Chart configuration
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            title: {
                display: true,
                text: 'Exchange Rate History'
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Rate'
                }
            }
        }
    }
};

// Chart instance
let rateChart = null;

/**
 * Initialize the chart functionality
 * This should be called after the DOM is fully loaded
 */
function initChartFeature() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not found. Chart features disabled.');
        return;
    }

    // Create chart container if not exists
    createChartContainer();
    
    // Add chart feature button
    addChartButton();
}

/**
 * Create chart container in the DOM
 */
function createChartContainer() {
    const converterCard = document.querySelector('.converter-card');
    if (!converterCard) return;
    
    const chartContainer = document.createElement('div');
    chartContainer.id = 'chartContainer';
    chartContainer.className = 'chart-container mt-4';
    chartContainer.style.display = 'none';
    chartContainer.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Exchange Rate History</h5>
                <div>
                    <select id="timeRangeSelect" class="form-select form-select-sm">
                        <option value="7">7 Days</option>
                        <option value="30" selected>30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">1 Year</option>
                    </select>
                </div>
            </div>
            <div class="card-body">
                <div style="height: 300px;">
                    <canvas id="rateChart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Insert after the converter card
    converterCard.parentNode.insertBefore(chartContainer, converterCard.nextSibling);
    
    // Add event listener to time range select
    const timeRangeSelect = document.getElementById('timeRangeSelect');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', function() {
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;
            loadHistoricalRates(fromCurrency, toCurrency, this.value);
        });
    }
}

/**
 * Add chart toggle button to the UI
 */
function addChartButton() {
    const exchangeRateInfo = document.getElementById('exchangeRateInfo');
    if (!exchangeRateInfo) return;
    
    const chartButton = document.createElement('button');
    chartButton.id = 'showChartBtn';
    chartButton.className = 'btn btn-sm btn-outline-primary ms-2';
    chartButton.innerHTML = '<i class="bi bi-graph-up"></i> Show Chart';
    chartButton.title = 'Show exchange rate history chart';
    
    exchangeRateInfo.parentNode.insertBefore(chartButton, exchangeRateInfo.nextSibling);
    
    // Add event listener
    chartButton.addEventListener('click', toggleChart);
}

/**
 * Toggle chart visibility
 */
function toggleChart() {
    const chartContainer = document.getElementById('chartContainer');
    const chartButton = document.getElementById('showChartBtn');
    
    if (!chartContainer || !chartButton) return;
    
    const isVisible = chartContainer.style.display !== 'none';
    
    if (isVisible) {
        chartContainer.style.display = 'none';
        chartButton.innerHTML = '<i class="bi bi-graph-up"></i> Show Chart';
    } else {
        chartContainer.style.display = 'block';
        chartButton.innerHTML = '<i class="bi bi-graph-up"></i> Hide Chart';
        
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        const days = document.getElementById('timeRangeSelect')?.value || 30;
        
        loadHistoricalRates(fromCurrency, toCurrency, days);
    }
}

/**
 * Load historical exchange rates from API
 * @param {string} fromCurrency - Base currency
 * @param {string} toCurrency - Target currency
 * @param {number} days - Number of days to look back
 */
async function loadHistoricalRates(fromCurrency, toCurrency, days) {
    try {
        showChartLoading(true);
        
        // Calculate dates
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Format dates for API
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);
        
        // Fetch historical data from Frankfurter API
        const url = `https://api.frankfurter.app/${formattedStartDate}..${formattedEndDate}?from=${fromCurrency}&to=${toCurrency}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch historical data');
        }
        
        const data = await response.json();
        
        // Process and display data
        displayChart(data, fromCurrency, toCurrency);
        
    } catch (error) {
        console.error('Error loading historical rates:', error);
        showChartError(error.message);
    } finally {
        showChartLoading(false);
    }
}

/**
 * Format a date as YYYY-MM-DD for API calls
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Display the chart with historical rate data
 * @param {Object} data - Historical rate data
 * @param {string} fromCurrency - Base currency
 * @param {string} toCurrency - Target currency
 */
function displayChart(data, fromCurrency, toCurrency) {
    const ctx = document.getElementById('rateChart');
    if (!ctx) return;
    
    // Extract dates and rates
    const dates = Object.keys(data.rates);
    const rates = dates.map(date => data.rates[date][toCurrency]);
    
    // Destroy previous chart if exists
    if (rateChart) {
        rateChart.destroy();
    }
    
    // Create new chart
    rateChart = new Chart(ctx, {
        ...chartConfig,
        data: {
            labels: dates,
            datasets: [{
                label: `${fromCurrency} to ${toCurrency}`,
                data: rates,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        }
    });
    
    // Update chart title
    rateChart.options.plugins.title.text = `${fromCurrency} to ${toCurrency} Exchange Rate History`;
    rateChart.update();
}

/**
 * Show or hide chart loading indicator
 * @param {boolean} isLoading - Whether the chart is loading
 */
function showChartLoading(isLoading) {
    const chartCanvas = document.getElementById('rateChart');
    if (!chartCanvas) return;
    
    if (isLoading) {
        chartCanvas.style.opacity = 0.5;
        // You could add a spinner here if needed
    } else {
        chartCanvas.style.opacity = 1;
    }
}

/**
 * Show chart error message
 * @param {string} message - Error message to display
 */
function showChartError(message) {
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.textContent = `Failed to load chart data: ${message}`;
    
    // Add retry button
    const retryButton = document.createElement('button');
    retryButton.className = 'btn btn-sm btn-danger ms-2';
    retryButton.textContent = 'Retry';
    retryButton.onclick = function() {
        errorDiv.remove();
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        const days = document.getElementById('timeRangeSelect')?.value || 30;
        loadHistoricalRates(fromCurrency, toCurrency, days);
    };
    
    errorDiv.appendChild(retryButton);
    
    // Remove any existing error message
    const existingError = chartContainer.querySelector('.alert');
    if (existingError) {
        existingError.remove();
    }
    
    // Add to container
    chartContainer.querySelector('.card-body').appendChild(errorDiv);
}

// Function to update chart when currencies change
function updateChart() {
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer && chartContainer.style.display !== 'none') {
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;
        const days = document.getElementById('timeRangeSelect')?.value || 30;
        loadHistoricalRates(fromCurrency, toCurrency, days);
    }
}

// Export functions for use in main script
window.currencyChart = {
    init: initChartFeature,
    update: updateChart
};
