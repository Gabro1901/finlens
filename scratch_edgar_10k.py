from edgar import set_identity, Company

set_identity("Test User user@example.com")
try:
    filings = Company("META").get_filings(form=["10-K", "10-Q", "8-K"])
    print("Total filings count:", len(filings))
    forms = [f.form for f in filings]
    print("Forms in filings:", set(forms))
    
    latest_10k = next((f for f in filings if f.form == "10-K"), None)
    print("Latest 10-K found:", latest_10k)
    
except Exception as e:
    print(f"Error: {e}")
