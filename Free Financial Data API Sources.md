# Essential Open-Source Financial Data API Sources

The FinLens data pipeline has been simplified to rely on 9 essential, non-redundant, and free/freemium data sources. This minimizes the API keys required and reduces pipeline complexity.

## 1. Accounting Data
**edgartools (Python Library)**
- **Coverage**: SEC filings, 10-K, 10-Q, 8-K, XBRL tags, accounting policies, management transcripts (Exhibit 99.1).
- **Cost**: Free (requires valid User-Agent email).
- **Role**: Foundational accounting normalization.

## 2. Market Data
**yfinance (Python Library)**
- **Coverage**: Prices, market cap, enterprise value, shares outstanding, EPS estimates, peer lists, basic profile.
- **Cost**: Free (no API key required).
- **Role**: Replaces FMP, Finnhub, Alpha Vantage, etc. for market data.

## 3. Macroeconomic Data (USA)
**FRED API (Federal Reserve Bank of St. Louis)**
- **Coverage**: US CPI, GDP, unemployment, interest rates, Treasury yields.
- **Cost**: Free (requires free API key).
- **Role**: Macro overlay and risk-free rate calculation.

## 4. Macroeconomic Data (Global)
**World Bank API (wbgapi)**
- **Coverage**: Global GDP growth, demographics, inflation by country.
- **Cost**: Free (no API key required).
- **Role**: Distinguish company weakness from regional macro cycles.

## 5. Regulatory (Legislative)
**Congress.gov API**
- **Coverage**: US federal legislation, bills, committee actions.
- **Cost**: Free up to 5000 req/hour (requires free API key).
- **Role**: Identify disruption vectors.

## 6. Regulatory (Executive)
**Federal Register API**
- **Coverage**: Federal agency regulations, proposed rules.
- **Cost**: Free (no API key required).
- **Role**: Complementary to Congress.gov for executive actions.

## 7. News & Sentiment
**Google News RSS**
- **Coverage**: Recent financial news, announcements.
- **Cost**: Free (no API key required).
- **Role**: Replaces Finnhub sentiment and GDELT.

## 8. Patents
**USPTO PatentsView API**
- **Coverage**: Patent filings, assignees, technology classes.
- **Cost**: Free (no API key required).
- **Role**: Replaces OpenCitations; acts as an early indicator of R&D strategy.