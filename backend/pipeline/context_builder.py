import json

def _dict_to_md_table(title, data_dict):
    """
    Converts a nested dictionary {metric: {date1: val1, date2: val2}} to a markdown table.
    """
    if not data_dict:
        return ""
    
    # Extract all unique dates and sort them descending (newest first)
    dates = set()
    for metric, values in data_dict.items():
        if isinstance(values, dict):
            dates.update(values.keys())
    dates = sorted(list(dates), reverse=True)
    
    if not dates:
        return ""
        
    lines = [f"### {title}"]
    header = "| Metric | " + " | ".join(dates) + " |"
    separator = "|---|" + "|".join(["---"] * len(dates)) + "|"
    lines.append(header)
    lines.append(separator)
    
    for metric, values in data_dict.items():
        if not isinstance(values, dict):
            continue
        row = [metric]
        for d in dates:
            val = values.get(d)
            if val is None:
                row.append("-")
            elif isinstance(val, (int, float)):
                # Format large numbers compactly
                if abs(val) >= 1_000_000_000:
                    row.append(f"{val/1_000_000_000:.2f}B")
                elif abs(val) >= 1_000_000:
                    row.append(f"{val/1_000_000:.2f}M")
                elif abs(val) >= 1_000:
                    row.append(f"{val/1_000:.2f}K")
                else:
                    row.append(f"{val:.2f}")
            else:
                row.append(str(val)[:30]) # truncate long strings
        lines.append("| " + " | ".join(row) + " |")
        
    return "\n".join(lines) + "\n\n"


def build_context(bundled_data: dict) -> str:
    """
    Transforms the bundled raw data into a structured Markdown string
    to be injected into the LLM prompt.
    """
    ticker = bundled_data.get("ticker", "UNKNOWN")
    edgar = bundled_data.get("edgar", {})
    market = bundled_data.get("market", {})
    macro = bundled_data.get("macro", {})
    news = bundled_data.get("news", {})
    regulatory = bundled_data.get("regulatory", {})
    peers = bundled_data.get("peers", {})
    normalized = bundled_data.get("normalized", {})
    
    lines = []
    lines.append(f"# Raw Financial Context for {ticker}\n")
    
    # 1. Market Data & Valuation
    lines.append("## Market & Valuation Data")
    if "error" in market:
        lines.append(f"Error fetching market data: {market['error']}\n")
    else:
        info = market.get("info", {})
        lines.append(f"- Sector: {info.get('sector', 'N/A')}")
        lines.append(f"- Industry: {info.get('industry', 'N/A')}")
        lines.append(f"- Market Cap: {info.get('marketCap', 'N/A')}")
        lines.append(f"- Enterprise Value: {info.get('enterpriseValue', 'N/A')}")
        lines.append(f"- Forward P/E: {info.get('forwardPE', 'N/A')}")
        lines.append(f"- Trailing P/E: {info.get('trailingPE', 'N/A')}")
        lines.append(f"- Price to Book: {info.get('priceToBook', 'N/A')}")
        lines.append(f"- Short Ratio: {info.get('shortRatio', 'N/A')}")
        lines.append(f"- Forward EPS: {info.get('forwardEps', 'N/A')}")
        lines.append(f"- Trailing EPS: {info.get('trailingEps', 'N/A')}\n")
        
    # 2. Financial Statements (Income, Balance, Cashflow)
    lines.append("## Financial Statements (Multi-Year Context)")
    if "error" not in market:
        inc = _dict_to_md_table("Income Statement (Annual)", market.get("income_stmt", {}))
        bal = _dict_to_md_table("Balance Sheet (Annual)", market.get("balance_sheet", {}))
        cf = _dict_to_md_table("Cash Flow (Annual)", market.get("cashflow", {}))
        
        q_inc = _dict_to_md_table("Income Statement (Quarterly)", market.get("quarterly_income_stmt", {}))
        q_bal = _dict_to_md_table("Balance Sheet (Quarterly)", market.get("quarterly_balance_sheet", {}))
        q_cf = _dict_to_md_table("Cash Flow (Quarterly)", market.get("quarterly_cashflow", {}))
        
        if inc or bal or cf:
            lines.append(inc)
            lines.append(bal)
            lines.append(cf)
        else:
            lines.append("Annual financial statements not available via yfinance.\n")
            
        if q_inc or q_bal or q_cf:
            lines.append(q_inc)
            lines.append(q_bal)
            lines.append(q_cf)
        else:
            lines.append("Quarterly financial statements not available via yfinance.\n")

    # 3. Normalized Accounting
    lines.append("## Normalized Accounting, Metrics & Red Flags")
    lines.append(f"- Adjusted EBITDA: {normalized.get('ebitda', 'N/A')}")
    lines.append(f"- Net Debt: {normalized.get('net_debt', 'N/A')}")
    lines.append(f"- EV / Adjusted EBITDA: {normalized.get('ev_to_ebitda', 'N/A')}")
    lines.append(f"- FCF Conversion Ratio: {normalized.get('fcf_conversion', 'N/A')}")
    lines.append(f"- Accounting Adjustments: {normalized.get('accounting_notes', 'None')}")
    
    red_flags = normalized.get('red_flags', [])
    if red_flags:
        lines.append("- AUTOMATED RED FLAGS:")
        for flag in red_flags:
            lines.append(f"  - 🚩 {flag}")
    lines.append("\n")

    # 4. SEC EDGAR Disclosures
    lines.append("## SEC EDGAR Disclosures (10-K/10-Q Extracts)")
    if "error" in edgar:
        lines.append(f"Error fetching EDGAR data: {edgar['error']}\n")
    else:
        recent = edgar.get('recent_filings', [])
        if recent:
            lines.append(f"Recent filings processed: {len(recent)}")
            for f in recent:
                lines.append(f"- {f.get('form')} filed on {f.get('filing_date')} (Accession: {f.get('accession_no')})")
        
        xbrl = edgar.get('xbrl_highlights', {})
        if "error" in xbrl:
            lines.append(f"\nXBRL Extraction Error: {xbrl['error']}\n")
        elif xbrl:
            lines.append("\n### Key SEC 10-K/10-Q Extracts:")
            for k, v in xbrl.items():
                if v:
                    lines.append(f"#### {k}")
                    # truncate heavily if it's super long, but user said context size is fine
                    # still, maybe limit to 5000 chars per table to avoid total explosion
                    lines.append(str(v)[:15000])
                    lines.append("\n")
    lines.append("\n")
    
    # 5. Management & Analyst Signals
    lines.append("## Management & Analyst Signals")
    if "error" not in market:
        insiders = market.get("insider_transactions", [])
        if insiders:
            lines.append("### Recent Insider Transactions")
            for tx in insiders:
                # keys depend on yfinance version, usually 'Text', 'Shares', 'Value', 'Start Date'
                lines.append(f"- {json.dumps(tx)}")
            lines.append("\n")
            
        recs = market.get("recommendations", [])
        if recs:
            lines.append("### Analyst Recommendations")
            lines.append(json.dumps(recs, indent=2))
            lines.append("\n")

    # 6. Macro & Geo Data
    lines.append("## Macroeconomic Context (FRED & World Bank)")
    if "error" in macro:
        lines.append(f"Error fetching macro data: {macro['error']}\n")
    else:
        fred = macro.get("fred", {})
        wb = macro.get("world_bank", {})
        lines.append(f"- US CPI (Latest): {fred.get('cpi_latest', 'N/A')}")
        lines.append(f"- US 10-Year Treasury Yield: {fred.get('treasury_10y_latest', 'N/A')}")
        lines.append(f"- US GDP (Latest): {wb.get('usa_gdp_latest', 'N/A')}\n")

    # 7. News
    lines.append("## Recent News Headlines")
    if "error" in news:
        lines.append(f"Error fetching News data: {news['error']}\n")
    else:
        recent = news.get("recent_news", [])
        for r in recent:
            lines.append(f"- {r.get('title')} ({r.get('published')})")
    lines.append("\n")

    # 8. Regulatory Context
    lines.append("## Regulatory Context (Congress & Federal Register)")
    if "error" in regulatory:
        lines.append(f"Error fetching Regulatory data: {regulatory['error']}\n")
    else:
        fr = regulatory.get("federal_register", [])
        lines.append("### Federal Register Mentions:")
        for doc in fr:
            lines.append(f"- {doc.get('title')}")
            
        cg = regulatory.get("congress", [])
        if isinstance(cg, list) and len(cg) > 0:
            lines.append("\n### Congressional Bills (Sector context):")
            for bill in cg:
                lines.append(f"- {bill.get('title')}")
    lines.append("\n")
    

    # 10. Peer Comparison Data
    lines.append("## Peer Comparison Data")
    if "error" in peers:
        lines.append(f"Error fetching Peer data: {peers['error']}\n")
    else:
        peer_list = peers.get("peers", [])
        if peer_list:
            lines.append("| Ticker | Market Cap | Trailing P/E | Forward P/E | EV/EBITDA | ROE | Margins | Growth |")
            lines.append("|---|---|---|---|---|---|---|---|")
            for p in peer_list:
                lines.append(f"| {p.get('ticker')} | {p.get('marketCap')} | {p.get('trailingPE')} | {p.get('forwardPE')} | {p.get('evToEbitda')} | {p.get('returnOnEquity')} | {p.get('profitMargins')} | {p.get('revenueGrowth')} |")
        else:
            lines.append("No peer data found.")
    lines.append("\n")

    return "\n".join(lines)
