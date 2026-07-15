<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/Hexagon-logo-abstract.svg" width="100" alt="FinLens Logo">
  <h1>FinLens 🔍</h1>
  <p><strong>AI-Powered Institutional Equity Research Platform</strong></p>
</div>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a>
</p>

---

## 📖 Overview
**FinLens** is a modern, full-stack AI financial platform designed to automate the generation of institutional-grade equity research reports. By aggregating data across multiple financial dimensions (SEC filings, macroeconomic trends, live market data, and news) and piping it into advanced LLMs (like DeepSeek and OpenAI), FinLens produces comprehensive, unbiased financial reports in seconds.

## ✨ Features

- 🧠 **AI-Powered Analysis**: Generates incredibly detailed financial reports using `deepseek-v4-flash` or OpenAI models.
- 🎯 **Intelligent Peer Detection**: Bypasses flawed "retail correlation" algorithms by using a dedicated LLM pass to identify true business competitors for highly accurate Comparable Company Analysis (Comps).
- 📊 **Multi-Source Data Aggregation**: 
  - **SEC EDGAR**: Pulls structural and regulatory data.
  - **Yahoo Finance**: Live market data, valuation multiples, and historical prices.
  - **FRED**: Correlates macroeconomic indicators.
  - **News & Congressional Trades**: Sentiment and insider activity.
- 📱 **Flawless Mobile Experience**: Features a dedicated, app-like mobile UI with bottom navigation, optimized specifically for iOS Safari and Desktop environments.
- 📄 **Export Capabilities**: Export the final generated reports to beautifully formatted PDF or Markdown files.
- 💬 **Interactive AI Chat**: Ask follow-up questions directly about the analyzed company and generated report.

## 🛠 Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (for styling and glassmorphism UI)
- **Framer Motion** (for fluid animations)
- **Lucide React** (Icons)

### Backend
- **Python 3.10+**
- **FastAPI** (High-performance async API)
- **AsyncIO & HTTPX** (Concurrent data fetching)
- **yfinance** (Market data)
- **OpenAI Python SDK** (For LLM integration)

## 🏗 Architecture (Two-Tier Pipeline)

FinLens uses an asynchronous concurrent pipeline to minimize waiting time:
1. **Phase 1 (Metadata)**: Quickly fetches company name and sector from the market.
2. **Phase 2 (Concurrent Aggregation)**: Spawns parallel workers to fetch SEC data, News, Macro indicators, and Intelligent Peers.
3. **Phase 3 (Normalization)**: Cleans and standardizes the massive dataset.
4. **Phase 4 (Generation)**: The compiled context is streamed to the LLM, which streams the formatted markdown report back to the React frontend via Server-Sent Events (SSE).

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- (Optional) Cloudflared installed for Quick Tunnels

### 1. Clone the repository
```bash
git clone https://github.com/Gabro1901/finlens.git
cd finlens
```

### 2. Setup the Backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Setup the Frontend
```bash
cd frontend
npm install
```

## ⚙️ Configuration (API Keys)
To run the full pipeline, you need an LLM API Key (DeepSeek or OpenAI).

You can pass the API keys directly from the Frontend UI (via the Settings gear icon), or set them as environment variables in the backend. 
Required/Recommended Keys:
- **LLM API Key** (OpenAI / DeepSeek)
- **FRED API Key** (Macro data)
- **SEC Email** (Required by SEC EDGAR guidelines to pull filings)

## 💻 Running the App Locally
For local development, start both servers:

**Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

*(Alternatively, use the included `FinLens Tunnel.bat` script on Windows to automatically launch the stack and expose it to the internet via Cloudflare Quick Tunnels).*

## 📄 License
This project is for educational and portfolio purposes. Data is sourced from public APIs.

---
*Disclaimer: FinLens generates research using AI. It does not provide financial advice. Always verify data before making investment decisions.*
