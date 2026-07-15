import json
import asyncio
import datetime
import traceback
from .collectors.edgar import EdgarCollector
from .collectors.market import MarketCollector
from .collectors.macro import MacroCollector
from .collectors.news import NewsCollector
from .collectors.regulatory import RegulatoryCollector
from .collectors.peers import PeersCollector
from .normalizer import normalize_accounting
from .context_builder import build_context
from ..ai.report_generator import generate_report


class SafeJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles date, datetime, Timestamp, numpy, 
    pandas, and other non-standard Python types gracefully."""
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        if isinstance(obj, datetime.date):
            return obj.isoformat()
        try:
            import numpy as np
            if isinstance(obj, (np.integer,)):
                return int(obj)
            if isinstance(obj, (np.floating,)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            if isinstance(obj, np.bool_):
                return bool(obj)
        except ImportError:
            pass
        try:
            import pandas as pd
            if isinstance(obj, pd.Timestamp):
                return obj.isoformat()
            if isinstance(obj, pd.Series):
                return obj.to_dict()
            if isinstance(obj, pd.DataFrame):
                return obj.to_dict(orient='records')
        except ImportError:
            pass
        try:
            return str(obj)
        except Exception:
            return repr(obj)


def safe_json_dumps(obj):
    return json.dumps(obj, cls=SafeJSONEncoder, ensure_ascii=False)


async def run_pipeline(ticker: str, llm_provider: str, llm_api_key: str, fred_api_key: str = "", congress_api_key: str = "", sec_email: str = ""):
    """
    Orchestrates the entire financial analysis pipeline for a given ticker.
    Uses a two-phase collection process.
    Yields dicts suitable for SSE.
    """
    from ..config import settings
    if fred_api_key:
        settings.fred_api_key = fred_api_key
    if congress_api_key:
        settings.congress_api_key = congress_api_key
    if sec_email:
        settings.edgar_identity = f"FinLens User {sec_email}"
    
    yield {"event": "status", "data": safe_json_dumps({"stage": "init", "message": f"Starting analysis for {ticker}..."})}
    
    from .cache import collector_cache
    cached_data = collector_cache.get(ticker)
    if cached_data:
        yield {"event": "status", "data": safe_json_dumps({"stage": "collection", "message": f"Using recently cached data for {ticker}..."})}
        bundled_data = cached_data
        context_markdown = bundled_data["context_prompt"]
        yield {"event": "raw_data", "data": safe_json_dumps(bundled_data)}
        
        # Jump directly to report generation
        yield {"event": "status", "data": safe_json_dumps({"stage": "generation", "message": "Generating institutional report..."})}
        try:
            async for chunk in generate_report(ticker, context_markdown, llm_provider, llm_api_key):
                yield {"event": "report_chunk", "data": safe_json_dumps({"text": chunk})}
        except Exception as e:
            yield {"event": "report_chunk", "data": safe_json_dumps({"text": f"\n\n⚠️ **Generation Error**: {e}"})}
            
        yield {"event": "complete", "data": safe_json_dumps({"message": "Analysis complete."})}
        return
    
    # 1. Initialize collectors
    try:
        edgar = EdgarCollector()
        market = MarketCollector()
        macro = MacroCollector()
        news = NewsCollector()
        reg = RegulatoryCollector()
        peers = PeersCollector()
    except Exception as e:
        yield {"event": "status", "data": safe_json_dumps({"stage": "error", "message": f"Failed to initialize collectors: {e}"})}
        yield {"event": "error", "data": safe_json_dumps({"message": f"Initialization error: {e}"})}
        return
    
    # 2. Phase 1: Fetch Market Data to extract company metadata
    yield {"event": "status", "data": safe_json_dumps({"stage": "collection", "message": "Phase 1: Fetching Market Data..."})}
    
    try:
        market_data = await market.collect(ticker)
        company_name = market_data.get("info", {}).get("shortName") or market_data.get("info", {}).get("longName")
        sector = market_data.get("info", {}).get("sector")
    except Exception as e:
        market_data = {"error": str(e)}
        company_name = None
        sector = None
        
    bundled_data = {"ticker": ticker, "market": market_data}
    
    # 3. Phase 2: Run remaining collectors concurrently using metadata
    yield {"event": "status", "data": safe_json_dumps({"stage": "collection", "message": "Phase 2: Fetching 5 additional sources..."})}
    
    collector_names = ["edgar", "macro", "news", "regulatory", "peers"]
    tasks = [
        asyncio.create_task(edgar.collect(ticker, company_name)),
        asyncio.create_task(macro.collect(ticker)),
        asyncio.create_task(news.collect(ticker, company_name)),
        asyncio.create_task(reg.collect(ticker, company_name, sector)),
        asyncio.create_task(peers.collect(ticker))
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for i, name in enumerate(collector_names):
        if isinstance(results[i], Exception):
            bundled_data[name] = {"error": f"{type(results[i]).__name__}: {results[i]}"}
        else:
            bundled_data[name] = results[i]
            
    # 4. Normalize data
    yield {"event": "status", "data": safe_json_dumps({"stage": "normalization", "message": "Normalizing accounting and market metrics..."})}
    try:
        bundled_data["normalized"] = normalize_accounting(bundled_data)
    except Exception as e:
        bundled_data["normalized"] = {"error": f"Normalization failed: {e}", "traceback": traceback.format_exc()}
    
    # 5. Build context
    yield {"event": "status", "data": safe_json_dumps({"stage": "context", "message": "Assembling financial context for AI..."})}
    try:
        context_markdown = build_context(bundled_data)
    except Exception as e:
        context_markdown = f"# Context Build Error\n\nFailed to build context: {e}\n\nRaw data was collected but context assembly failed. The AI will work with limited information."
        bundled_data["context_build_error"] = str(e)
        bundled_data["context_traceback"] = traceback.format_exc()
    
    bundled_data["context_prompt"] = context_markdown
    collector_cache.set(ticker, bundled_data)
    yield {"event": "raw_data", "data": safe_json_dumps(bundled_data)}
    
    # 6. Generate report via LLM
    yield {"event": "status", "data": safe_json_dumps({"stage": "generation", "message": "Generating institutional report..."})}
    
    try:
        async for chunk in generate_report(ticker, context_markdown, llm_provider, llm_api_key):
            yield {"event": "report_chunk", "data": safe_json_dumps({"text": chunk})}
    except Exception as e:
        yield {"event": "report_chunk", "data": safe_json_dumps({"text": f"\n\n⚠️ **Generation Error**: {e}"})}
        
    yield {"event": "complete", "data": safe_json_dumps({"message": "Analysis complete."})}
