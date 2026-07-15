from fastapi import APIRouter
import httpx

router = APIRouter()

@router.get("/")
async def search_ticker(q: str):
    url = "https://query2.finance.yahoo.com/v1/finance/search"
    params = {
        "q": q,
        "quotesCount": 5,
        "newsCount": 0
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200:
                data = response.json()
                quotes = data.get("quotes", [])
                # Filter to only return equities and ETFs, avoiding mutual funds etc if preferred, 
                # but returning all available quotes is usually fine.
                results = []
                for q in quotes:
                    if "symbol" in q:
                        results.append({
                            "symbol": q.get("symbol"),
                            "name": q.get("shortname") or q.get("longname") or "",
                            "type": q.get("quoteType", "")
                        })
                return {"results": results}
        except Exception:
            pass
    return {"results": []}
