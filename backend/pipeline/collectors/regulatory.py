import asyncio
import httpx
import urllib.parse
from ...config import settings

class RegulatoryCollector:
    CONGRESS_BASE_URL = "https://api.congress.gov/v3"
    FEDERAL_REGISTER_BASE_URL = "https://www.federalregister.gov/api/v1"

    async def collect(self, ticker: str, company_name: str = None, sector: str = None) -> dict:
        """
        Collects regulatory data related to the company/sector.
        """
        congress_key = settings.congress_api_key
        
        async with httpx.AsyncClient() as client:
            try:
                # 1. Federal Register (No auth needed)
                search_term = company_name if company_name else ticker
                encoded_term = urllib.parse.quote(search_term)
                
                fr_url = f"{self.FEDERAL_REGISTER_BASE_URL}/documents.json?conditions[term]={encoded_term}&per_page=5"
                fr_req = await client.get(fr_url)
                fr_data = fr_req.json().get('results', []) if fr_req.status_code == 200 else []
                
                # 2. Congress.gov (Needs auth)
                cg_data = []
                if congress_key:
                    # To keep it simple for the MVP, we just fetch recent bills. 
                    # A true implementation would use the complex search query API for the specific sector.
                    cg_url = f"{self.CONGRESS_BASE_URL}/bill?api_key={congress_key}&limit=5"
                    cg_req = await client.get(cg_url)
                    cg_data = cg_req.json().get('bills', []) if cg_req.status_code == 200 else []
                
                return {
                    "federal_register": fr_data,
                    "congress": cg_data if congress_key else {"error": "CONGRESS_API_KEY not configured"}
                }
            except Exception as e:
                return {"error": str(e)}
