# CurrencyFlow - Modern Currency Converter

A professional, SaaS-styled web application that allows users to convert between currencies using real-time exchange rates with historical charts.

![Currency Converter Screenshot](https://github.com/ankitagr09/currency-converter/blob/main/Screenshot%202025-08-13%20221858.png)

## Features

- **Real-time Exchange Rates**: Fetches the latest exchange rates from the [Frankfurter API](https://www.frankfurter.app)
- **Historical Charts**: View exchange rate trends with interactive charts
- **All Major Currencies**: Support for all major world currencies
- **Currency Swap**: Easily swap between base and target currencies
- **Mobile Friendly**: Responsive design that works on all devices
- **Popular Conversions**: Shows a table of popular currency conversions for the selected base currency
- **Modern Clipboard API**: Easy copying of conversion results
- **Clean, Modern UI**: SaaS-style interface with smooth animations

## Technology Stack

- **HTML5**: For structure
- **CSS3**: For styling (with Bootstrap 5)
- **JavaScript (ES6+)**: For fetching API data and handling conversions
- **Chart.js**: For interactive exchange rate charts
- **Bootstrap 5**: For responsive design and UI components
- **Frankfurter API**: For current and historical exchange rates

## Usage

1. Select your base currency from the "From" dropdown
2. Enter the amount you want to convert
3. Select your target currency from the "To" dropdown
4. View the converted amount instantly
5. Click "Show Chart" to see historical exchange rate data
6. Use the swap button to reverse the conversion
7. View popular conversions in the table below

## Installation

No installation required! This is a client-side application that runs entirely in the browser.

### To run locally:

1. Clone this repository:
   ```
   git clone https://github.com/ankitagr09/currency-converter.git
   ```

2. Open `index.html` in any web browser

## Deployment

This application can be deployed on any static hosting service:

1. GitHub Pages
2. Netlify
3. Vercel
4. Amazon S3
5. Firebase Hosting

## API Details

This application uses the [Frankfurter API](https://www.frankfurter.app):

- Current rates: `https://api.frankfurter.app/latest?from={CURRENCY_CODE}`
- Historical rates: `https://api.frankfurter.app/{START_DATE}..{END_DATE}?from={FROM}&to={TO}`

## Project Structure

```
currencyflow/
├── index.html      # Main UI
├── style.css       # Styling
├── script.js       # Core functionality
├── chart.js        # Chart functionality
└── README.md       # Documentation
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- Mobile browsers (iOS & Android)

## License

MIT License

## Credits

- Exchange rates provided by [Frankfurter API](https://www.frankfurter.app)
- Icons by [Bootstrap Icons](https://icons.getbootstrap.com/)
- Charts by [Chart.js](https://www.chartjs.org/)
