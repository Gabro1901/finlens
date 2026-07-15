import asyncio
import httpx
import yfinance as yf

class PeersCollector:
    async def collect(self, ticker: str) -> dict:
        """
        Collects peer tickers and their key financial metrics.
        """
        try:
            peers = await self._get_peer_tickers(ticker)
            if not peers:
                return {"error": "No peers found."}
                
            loop = asyncio.get_event_loop()
            peer_data = await loop.run_in_executor(None, self._fetch_peer_metrics, peers)
            return {"peers": peer_data}
            
        except Exception as e:
            return {"error": str(e)}

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
                        # Top 3 peers
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
