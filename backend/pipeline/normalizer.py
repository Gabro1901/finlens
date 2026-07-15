def normalize_accounting(bundled_data: dict) -> dict:
    """
    Takes the raw bundled data and computes normalized metrics
    and standardizes accounting policies. Includes multi-year ratios.
    """
    normalized = {}
    red_flags = []
    
    market = bundled_data.get("market", {})
    if isinstance(market, Exception) or "error" in market:
        return {"error": "Market data unavailable for normalization", "red_flags": red_flags}
        
    info = market.get("info", {}) if isinstance(market, dict) else {}
    
    # --- Single Point (Latest) Metrics ---
    ebitda = info.get("ebitda", 0) or 0
    total_debt = info.get("totalDebt", 0) or 0
    total_cash = info.get("totalCash", 0) or 0
    enterprise_value = info.get("enterpriseValue", 0) or 0
    net_income = info.get("netIncomeToCommon", 0) or 0
    free_cashflow = info.get("freeCashflow", 0) or 0
    
    normalized["ebitda"] = ebitda
    normalized["net_debt"] = total_debt - total_cash
    
    if enterprise_value > 0 and ebitda > 0:
        normalized["ev_to_ebitda"] = round(enterprise_value / ebitda, 2)
    else:
        normalized["ev_to_ebitda"] = None
        
    if net_income > 0:
        normalized["fcf_conversion"] = round(free_cashflow / net_income, 2)
    else:
        normalized["fcf_conversion"] = None

    # --- Multi-Year Metrics & Red Flags ---
    income = market.get("income_stmt", {})
    balance = market.get("balance_sheet", {})
    cashflow = market.get("cashflow", {})

    def get_latest_and_prev(stmt, metric_names):
        """Helper to get latest and previous year values for a given metric."""
        for metric in metric_names:
            if metric in stmt and isinstance(stmt[metric], dict):
                dates = sorted(stmt[metric].keys(), reverse=True)
                if len(dates) >= 2:
                    return stmt[metric][dates[0]], stmt[metric][dates[1]]
                elif len(dates) == 1:
                    return stmt[metric][dates[0]], None
        return None, None

    # CapEx Intensity
    capex_curr, capex_prev = get_latest_and_prev(cashflow, ["Capital Expenditure", "CapitalExpenditure"])
    rev_curr, rev_prev = get_latest_and_prev(income, ["Total Revenue"])
    
    if capex_curr is not None and rev_curr and rev_curr > 0:
        normalized["capex_intensity"] = round(abs(capex_curr) / rev_curr, 3)
        if capex_prev is not None and rev_prev and rev_prev > 0:
            intensity_prev = abs(capex_prev) / rev_prev
            if normalized["capex_intensity"] > intensity_prev * 1.5:
                red_flags.append(f"CapEx Intensity spiked from {round(intensity_prev*100,1)}% to {round(normalized['capex_intensity']*100,1)}%.")

    # Accruals Gap (Net Income vs OCF)
    ocf_curr, ocf_prev = get_latest_and_prev(cashflow, ["Operating Cash Flow"])
    ni_curr, ni_prev = get_latest_and_prev(income, ["Net Income"])
    assets_curr, assets_prev = get_latest_and_prev(balance, ["Total Assets"])
    
    if ocf_curr is not None and ni_curr is not None and assets_curr and assets_curr > 0:
        accruals_ratio = (ni_curr - ocf_curr) / assets_curr
        normalized["accruals_ratio"] = round(accruals_ratio, 3)
        if accruals_ratio > 0.10:
            red_flags.append(f"High Accruals Ratio ({round(accruals_ratio*100,1)}%). Earnings may be artificially inflated relative to cash flows.")

    # ROIC (Return on Invested Capital) proxy
    # NOPAT = EBIT * (1 - Tax Rate) approx, Invested Capital = Total Assets - Current Liabilities + Short Term Debt
    ebit_curr, ebit_prev = get_latest_and_prev(income, ["EBIT"])
    if ebit_curr is not None and assets_curr is not None:
        cl_curr, cl_prev = get_latest_and_prev(balance, ["Current Liabilities", "Total Current Liabilities"])
        cl_curr = cl_curr or 0
        ic_curr = assets_curr - cl_curr
        if ic_curr > 0:
            roic = ebit_curr / ic_curr
            normalized["roic_proxy"] = round(roic, 3)
            
            if ebit_prev is not None and assets_prev is not None:
                cl_prev = cl_prev or 0
                ic_prev = assets_prev - cl_prev
                if ic_prev > 0:
                    roic_prev = ebit_prev / ic_prev
                    if roic < roic_prev - 0.05:
                        red_flags.append(f"ROIC declining significantly: {round(roic_prev*100,1)}% -> {round(roic*100,1)}%.")

        
    # --- Existing Red Flag Watchlist Logic ---
    # 1. Poor cash conversion
    if normalized.get("fcf_conversion") is not None and normalized["fcf_conversion"] < 0.5:
        red_flags.append(f"Low cash conversion: FCF is only {normalized['fcf_conversion']}x of Net Income.")
        
    # 2. High Leverage
    if ebitda > 0 and (total_debt / ebitda) > 4:
        red_flags.append(f"High Leverage: Debt/EBITDA is {round(total_debt/ebitda, 2)}x (Red Flag: >4x).")
        
    # 3. High short interest
    if (info.get("shortRatio") or 0) > 5:
        red_flags.append(f"High short interest ratio: {info.get('shortRatio')} days to cover.")
        
    # 4. Insider Activity
    insiders = market.get("insider_transactions", [])
    if isinstance(insiders, list) and len(insiders) > 0:
        sale_count = 0
        for tx in insiders:
            if isinstance(tx, dict):
                text_val = str(tx).lower()
                if 'sale' in text_val or 'sell' in text_val:
                    sale_count += 1
                elif tx.get('Shares', 0) and isinstance(tx.get('Shares'), (int, float)) and tx.get('Shares') < 0:
                    sale_count += 1
        
        if sale_count > (len(insiders) / 2) and len(insiders) > 2:
            red_flags.append("Insider Activity: Majority of recent top insider transactions are sales.")
            
    news = bundled_data.get("news", {})
    if not isinstance(news, Exception) and "error" not in news:
        recent = news.get("recent_news", [])
        if len(recent) == 0:
            red_flags.append("Warning: Unusually low news volume for this ticker.")
            
    normalized["accounting_notes"] = "Normalization engine highlights: Check for capitalized software and ROU lease liabilities."
    normalized["red_flags"] = red_flags
    
    return normalized
