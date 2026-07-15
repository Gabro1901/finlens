from edgar import set_identity, Company

set_identity("Test User user@example.com")
try:
    filings = Company("META").get_filings(form=["10-K", "10-Q"])
    latest = filings[0]
    
    xbrl = latest.xbrl()
    if xbrl:
        if hasattr(xbrl, 'notes') and callable(xbrl.notes):
            notes = xbrl.notes()
            if notes:
                # get the first note
                # Wait, if notes is not subscriptable, it might be an iterator or a special collection
                # Let's iterate
                count = 0
                for n in notes:
                    print("--- Note", count, "---")
                    print("Role or type:", n.role_or_type)
                    if hasattr(n, 'text') and callable(n.text):
                        print("Text:", n.text()[:200])
                    else:
                        print("Text prop:", str(n.text)[:200])
                    count += 1
                    if count >= 2: break
except Exception as e:
    print(f"Error: {e}")
