import asyncio
import httpx
import yfinance as yf
from openai import AsyncOpenAI

class PeersCollector:
    def __init__(self, llm_provider: str = None, llm_api_key: str = None):
        self.llm_provider = llm_provider
        self.llm_api_key = llm_api_key

    async def collect(self, ticker: str, company_name: str = None) -> dict:
        """
        Collects peer tickers and their key financial metrics using a two-tier approach:
        1. LLM selection for accurate business peers.
        2. Fallback to Yahoo Finance recommendations.
        """
        try:
            peers = await self._get_llm_peers(ticker, company_name)
            
            # Fallback if LLM failed or returned no peers
            if not peers:
                print(f"[Peers] LLM failed to find peers for {ticker}, falling back to Yahoo Finance...")
                peers = await self._get_peer_tickers(ticker)
                
            if not peers:
                return {"error": "No peers found via LLM or Yahoo fallback."}
                
            loop = asyncio.get_event_loop()
            peer_data = await loop.run_in_executor(None, self._fetch_peer_metrics, peers)
            return {"peers": peer_data}
            
        except Exception as e:
            return {"error": str(e)}

    async def _get_llm_peers(self, ticker: str, company_name: str) -> list:
        if not self.llm_api_key or self.llm_provider != "openai":
            return []
            
        # We know we are using DeepSeek as instructed
        client = AsyncOpenAI(api_key=self.llm_api_key, base_url="https://api.deepseek.com")
        
        target = company_name if company_name else ticker
        prompt = (
            f"You are a financial analyst. Provide exactly the top 3 direct business competitors "
            f"for {target} ({ticker}) that are publicly traded on US exchanges. "
            f"Return ONLY a comma-separated list of their exact stock ticker symbols (e.g., AAPL, MSFT, GOOG). "
            f"Do not include the word 'Ticker' or any other text, just the 3 symbols separated by commas."
        )
        
        try:
            response = await client.chat.completions.create(
                model="deepseek-v4-flash",
                messages=[
                    {"role": "system", "content": "You output only comma-separated ticker symbols."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=20,
                temperature=0.0
            )
            
            content = response.choices[0].message.content.strip()
            # Clean up potential extra spaces or quotes
            tickers = [t.strip().upper() for t in content.split(',')]
            # Filter out non-alphanumeric just in case, and exclude the original ticker
            valid_tickers = [t for t in tickers if t.isalpha() and t != ticker.upper()]
            
            return valid_tickers[:3]
        except Exception as e:
            print(f"[Peers] LLM Error: {e}")
            return []

    async def _get_peer_tickers(self, ticker: str) -> list:
        url = f"https://query2.finance.yahoo.com/v6/finance/recommendationsbysymbol/{ticker}"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(url, headers=headers, timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get('finance', {}).get('result', [])
                    if results and len(results) > 0:
                        recs = results[0].get('recommendedSymbols', [])
                        return [r['symbol'] for r in recs[:3]]
            except Exception:
                pass
        return []

    def _fetch_peer_metrics(self, peers: list) -> list:
        peer_data = []
        for p in peers:
            try:
                t = yf.Ticker(p)
                info = t.info
                if info:
                    ev = info.get('enterpriseValue', 0)
                    ebitda = info.get('ebitda', 0)
                    ev_ebitda = round(ev / ebitda, 2) if ev and ebitda else None
                    
                    peer_data.append({
                        "ticker": p,
                        "marketCap": info.get('marketCap'),
                        "trailingPE": info.get('trailingPE'),
                        "forwardPE": info.get('forwardPE'),
                        "evToEbitda": ev_ebitda,
                        "returnOnEquity": info.get('returnOnEquity'),
                        "profitMargins": info.get('profitMargins'),
                        "revenueGrowth": info.get('revenueGrowth')
                    })
            except Exception:
                continue
        return peer_data
