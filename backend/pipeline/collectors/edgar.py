import asyncio
from edgar import set_identity, Company
from ...config import settings

class EdgarCollector:
    def __init__(self):
        set_identity(settings.edgar_identity)

    async def collect(self, ticker: str, company_name: str = None) -> dict:
        """
        Collects SEC data via edgartools.
        Runs in an executor because edgartools is synchronous.
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._fetch_edgar_data, ticker)

    def _fetch_edgar_data(self, ticker: str) -> dict:
        try:
            # We filter for 10-K, 10-Q, and 8-K
            filings = Company(ticker).get_filings(form=["10-K", "10-Q", "8-K"])
            recent_filings = []
            
            # Get latest 5 filings metadata
            for filing in filings[:5]:
                recent_filings.append({
                    "form": filing.form,
                    "filing_date": str(filing.filing_date),
                    "accession_no": filing.accession_no
                })
            
            xbrl_highlights = {}
            
            # Get latest 10-K or 10-Q to extract actual XBRL markdown
            latest_periodic = next((f for f in filings if f.form in ["10-K", "10-Q"]), None)
            
            if latest_periodic:
                try:
                    xbrl = latest_periodic.xbrl()
                    if xbrl:
                        # Skip extracting primary statements (Income, Balance, Cash Flow) 
                        # to prevent redundancy with yfinance data.
                        
                        if hasattr(xbrl, 'notes') and callable(xbrl.notes):
                            notes = xbrl.notes()
                            if notes:
                                notes_text = []
                                # Extract up to 3 major notes to preserve context size
                                for i, n in enumerate(notes):
                                    if i >= 3: break
                                    role = n.role_or_type.split('/')[-1] if n.role_or_type else f"Note {i+1}"
                                    text = n.text() if callable(n.text) else str(n.text)
                                    text = text[:3000] + ("..." if len(text) > 3000 else "")
                                    notes_text.append(f"**{role}**\n{text}\n")
                                
                                if notes_text:
                                    xbrl_highlights["XBRL Disclosures"] = "\n".join(notes_text)
                except Exception as e:
                    xbrl_highlights["error"] = f"Failed to extract XBRL: {str(e)}"
                    
                # Extract Supply Chain information from the latest 10-K specifically (since 10-Qs do not contain Item 1 Business)
                try:
                    latest_10k = next((f for f in filings if f.form == "10-K"), None)
                    if latest_10k:
                        doc = latest_10k.obj()
                        if doc:
                            item1_text = doc["Item 1"] if hasattr(doc, 'items') and "Item 1" in doc.items else ""
                            item1a_text = doc["Item 1A"] if hasattr(doc, 'items') and "Item 1A" in doc.items else ""
                            
                            combined_text = item1_text + "\n" + item1a_text
                            paragraphs = combined_text.split('\n')
                            
                            import re
                            # Using \b to match whole words and avoid matching "open-sourcing" for "sourcing"
                            supply_chain_pattern = re.compile(r'\b(supply chain|supplier|suppliers|raw material|raw materials|vendor|vendors|manufacturing|logistics|sourcing)\b', re.IGNORECASE)
                            
                            extracted_paragraphs = []
                            for p in paragraphs:
                                if supply_chain_pattern.search(p):
                                    # check length to avoid very short generic sentences
                                    if len(p.split()) > 15:
                                        # clean up whitespace and ensure it ends with period
                                        cleaned = p.strip()
                                        if cleaned:
                                            extracted_paragraphs.append(cleaned)
                            
                            if extracted_paragraphs:
                                # limit to 10 paragraphs to avoid blowing up context
                                sc_text = "\n\n".join(extracted_paragraphs[:10])
                                xbrl_highlights["Supply Chain & Manufacturing (10-K)"] = sc_text
                except Exception as e:
                    xbrl_highlights["supply_chain_error"] = f"Failed to extract supply chain from 10-K: {str(e)}"
                    
            return {
                "recent_filings": recent_filings,
                "xbrl_highlights": xbrl_highlights
            }
        except Exception as e:
            return {"error": str(e)}
