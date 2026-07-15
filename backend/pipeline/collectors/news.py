import asyncio
import feedparser
import urllib.parse

class NewsCollector:
    async def collect(self, ticker: str, company_name: str = None) -> dict:
        """
        Collects news from Google News RSS feed for the given ticker and company name.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._fetch_rss, ticker, company_name)

    def _fetch_rss(self, ticker: str, company_name: str) -> dict:
        try:
            if company_name:
                query = f"{company_name} stock OR {ticker} stock"
            else:
                query = f"{ticker} stock"
                
            # Fix URL encoding bug
            encoded_query = urllib.parse.quote(query)
            url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
            
            feed = feedparser.parse(url)
            
            entries = []
            for entry in feed.entries[:10]: # Top 10 recent news articles
                entries.append({
                    "title": entry.title,
                    "link": entry.link,
                    "published": getattr(entry, 'published', 'N/A')
                })
                
            return {"recent_news": entries}
        except Exception as e:
            return {"error": str(e)}
