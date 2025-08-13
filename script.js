/**
 * CurrencyFlow - Real-Time Currency Converter
 * Fetches live exchange rates and performs currency conversions
 * @author Ankit Agrawal
 * @version 1.0.0
 */

// DOM elements
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const amountInput = document.getElementById('amount');
const resultInput = document.getElementById('result');
const swapButton = document.getElementById('swapBtn');
const copyButton = document.getElementById('copyBtn');
const exchangeRateInfo = document.getElementById('exchangeRateInfo');
const fromCurrencyCode = document.getElementById('fromCurrencyCode');
const toCurrencyCode = document.getElementById('toCurrencyCode');
const exchangeRateSpan = document.getElementById('exchangeRate');
const lastUpdatedDiv = document.getElementById('lastUpdated');
const basePopular = document.getElementById('basePopular');
const popularRatesTable = document.getElementById('popularRates');
const loadingOverlay = document.getElementById('loadingOverlay');

// Global variables
let exchangeRates = {};
let currencies = [];
let lastUpdatedTime = null;

// API URL
const API_BASE_URL = 'https://api.frankfurter.app/latest';

// Popular currencies to display in the table - limited to what Frankfurter API supports
const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'NZD', 'HKD', 'SGD'];

/**
 * Initialize the application
 */
async function initApp() {
    try {
        // Fetch exchange rates with USD as base
        await fetchExchangeRates('USD');
        
        // Setup event listeners
        setupEventListeners();
        
        // Hide loading overlay once initialization is complete
        hideLoading();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Failed to initialize the application. Please try again later.');
        hideLoading();
    }
}

/**
 * Fetch exchange rates from the API
 * @param {string} baseCurrency - The base currency code
 * @returns {Promise} - A promise that resolves when rates are fetched
 */
async function fetchExchangeRates(baseCurrency) {
    try {
        showLoading();
        
        const url = `${API_BASE_URL}?from=${baseCurrency}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Store the exchange rates and update timestamp
        exchangeRates = data.rates;
        // Add base currency with rate 1 since Frankfurter doesn't include it
        exchangeRates[baseCurrency] = 1;
        lastUpdatedTime = new Date(data.date);
        
        // Update currency dropdowns if this is the first load
        if (currencies.length === 0) {
            currencies = Object.keys(exchangeRates).sort();
            populateCurrencyDropdowns();
            
            // Set default values
            fromCurrencySelect.value = baseCurrency;
            toCurrencySelect.value = baseCurrency === 'EUR' ? 'USD' : 'EUR';
        }
        
        // Update the UI
        updateUI();
        updatePopularRates();
        hideLoading();
        
        return data;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        hideLoading();
        alert('Error fetching exchange rates. Please check your internet connection and try again. Details: ' + error.message);
        throw error;
    }
}

/**
 * Populate currency dropdown menus
 */
function populateCurrencyDropdowns() {
    // Clear existing options
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    
    // Add options for each currency
    currencies.forEach(currency => {
        const fromOption = document.createElement('option');
        fromOption.value = currency;
        fromOption.textContent = currency;
        
        const toOption = document.createElement('option');
        toOption.value = currency;
        toOption.textContent = currency;
        
        fromCurrencySelect.appendChild(fromOption);
        toCurrencySelect.appendChild(toOption);
    });
}

/**
 * Convert currency based on user input
 */
function convertCurrency() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    const amount = parseFloat(amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        resultInput.value = 'Invalid amount';
        return;
    }
    
    // Check if we need to fetch new rates (if base currency changed)
    if (fromCurrency !== fromCurrencyCode.textContent) {
        fetchExchangeRates(fromCurrency)
            .then(() => {
                performConversion(fromCurrency, toCurrency, amount);
            })
            .catch(error => {
                console.error('Error updating exchange rates:', error);
                resultInput.value = 'Error fetching rates';
            });
    } else {
        performConversion(fromCurrency, toCurrency, amount);
    }
}

/**
 * Perform the actual conversion calculation
 * @param {string} fromCurrency - From currency code
 * @param {string} toCurrency - To currency code
 * @param {number} amount - Amount to convert
 */
function performConversion(fromCurrency, toCurrency, amount) {
    const rate = exchangeRates[toCurrency];
    if (!rate) {
        resultInput.value = 'Rate not available';
        return;
    }
    
    const convertedAmount = amount * rate;
    resultInput.value = convertedAmount.toFixed(4);
    
    // Update the exchange rate info
    fromCurrencyCode.textContent = fromCurrency;
    toCurrencyCode.textContent = toCurrency;
    exchangeRateSpan.textContent = rate.toFixed(6);
    
    // Apply highlight effect to show change
    resultInput.classList.add('highlight');
    setTimeout(() => {
        resultInput.classList.remove('highlight');
    }, 1000);
}

/**
 * Update the popular rates table
 */
function updatePopularRates() {
    const baseCurrency = fromCurrencySelect.value;
    const amount = parseFloat(amountInput.value) || 1;
    
    basePopular.textContent = baseCurrency;
    popularRatesTable.innerHTML = '';
    
    // Filter out the base currency itself from the popular list
    const currenciesToShow = popularCurrencies.filter(curr => curr !== baseCurrency);
    
    // Add a few more currencies if the base is in the popular list
    if (popularCurrencies.includes(baseCurrency)) {
        const additionalCurrencies = currencies
            .filter(curr => !popularCurrencies.includes(curr))
            .slice(0, 3);
        currenciesToShow.push(...additionalCurrencies);
    }
    
    currenciesToShow.slice(0, 10).forEach(currencyCode => {
        const rate = exchangeRates[currencyCode];
        if (!rate) return;
        
        const tr = document.createElement('tr');
        
        // Get currency name (fallback to code if not found)
        const currencyName = getCurrencyName(currencyCode);
        
        tr.innerHTML = `
            <td>${currencyName}</td>
            <td>${currencyCode}</td>
            <td>${rate.toFixed(6)}</td>
            <td>${(amount * rate).toFixed(4)}</td>
        `;
        
        popularRatesTable.appendChild(tr);
    });
}

/**
 * Get the full name of a currency from its code
 * @param {string} code - The currency code
 * @returns {string} - The currency name or code if not found
 */
function getCurrencyName(code) {
    // Map of common currency codes to names
    const currencyNames = {
        'USD': 'US Dollar',
        'EUR': 'Euro',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'CAD': 'Canadian Dollar',
        'AUD': 'Australian Dollar',
        'CHF': 'Swiss Franc',
        'CNY': 'Chinese Yuan',
        'INR': 'Indian Rupee',
        'BRL': 'Brazilian Real',
        'NZD': 'New Zealand Dollar',
        'ZAR': 'South African Rand',
        'RUB': 'Russian Ruble',
        'KRW': 'South Korean Won',
        'SGD': 'Singapore Dollar',
        'HKD': 'Hong Kong Dollar',
        'MXN': 'Mexican Peso',
        'SEK': 'Swedish Krona',
        'NOK': 'Norwegian Krone',
        'DKK': 'Danish Krone'
    };
    
    return currencyNames[code] || code;
}

/**
 * Update the UI with the latest data
 */
function updateUI() {
    // Update last updated time
    if (lastUpdatedTime) {
        lastUpdatedDiv.textContent = `Last updated: ${lastUpdatedTime.toLocaleString()}`;
    }
    
    // Convert with current values
    convertCurrency();
    
    // Update chart if it exists
    if (window.currencyChart && typeof window.currencyChart.update === 'function') {
        window.currencyChart.update();
    }
}

/**
 * Swap the from and to currencies
 */
function swapCurrencies() {
    const fromValue = fromCurrencySelect.value;
    const toValue = toCurrencySelect.value;
    
    fromCurrencySelect.value = toValue;
    toCurrencySelect.value = fromValue;
    
    // Fetch new rates if needed and update the conversion
    convertCurrency();
}

/**
 * Copy the result to clipboard using modern Clipboard API
 */
function copyToClipboard() {
    const textToCopy = resultInput.value;
    
    // Use Clipboard API if available, fallback to older method
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                // Show feedback
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="bi bi-check"></i>';
                
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                // Fallback to old method
                resultInput.select();
                document.execCommand('copy');
            });
    } else {
        // Fallback for older browsers
        resultInput.select();
        document.execCommand('copy');
        
        // Show feedback
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="bi bi-check"></i>';
        
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Currency conversion events
    fromCurrencySelect.addEventListener('change', convertCurrency);
    toCurrencySelect.addEventListener('change', convertCurrency);
    amountInput.addEventListener('input', convertCurrency);
    
    // Swap button
    swapButton.addEventListener('click', swapCurrencies);
    
    // Copy button
    copyButton.addEventListener('click', copyToClipboard);
}

/**
 * Show loading overlay
 */
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', function() {
    // Initialize the main app
    initApp();
    
    // Initialize chart feature if available
    if (window.currencyChart && typeof window.currencyChart.init === 'function') {
        window.currencyChart.init();
    }
});

// Add scroll effect for navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Make developer name editable on click
document.addEventListener('DOMContentLoaded', function() {
    const developerName = document.getElementById('developerName');
    if (developerName) {
        developerName.addEventListener('click', function() {
            const currentName = this.textContent;
            const newName = prompt('Enter your name:', currentName);
            if (newName && newName.trim() !== '') {
                this.textContent = newName;
                localStorage.setItem('developerName', newName);
            }
        });
        
        // Load saved name if available
        const savedName = localStorage.getItem('developerName');
        if (savedName) {
            developerName.textContent = savedName;
        }
    }
});

// Add hover effects to feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            featureCards.forEach(c => {
                if (c !== card) {
                    c.style.opacity = '0.7';
                }
            });
        });
        
        card.addEventListener('mouseleave', function() {
            featureCards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });
});
