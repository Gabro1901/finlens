import asyncio
import httpx
import json

async def test_yahoo_search():
    url = "https://query2.finance.yahoo.com/v1/finance/search"
    params = {
        "q": "alphabet",
        "quotesCount": 5,
        "newsCount": 0
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        print(response.status_code)
        data = response.json()
        for quote in data.get("quotes", []):
            print(f"Ticker: {quote.get('symbol')}, Name: {quote.get('shortname')}, Type: {quote.get('quoteType')}")

if __name__ == "__main__":
    asyncio.run(test_yahoo_search())
