from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..config import settings

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    ticker: str
    report_markdown: str
    raw_data: dict = None
    messages: List[ChatMessage]
    api_key: str = None
    context_source: str = "report"  # "report", "raw", "both"

@router.post("/")
async def chat_with_report(req: ChatRequest):
    """
    Takes the generated report and/or raw data as context and streams answers via SSE.
    """
    key = req.api_key or settings.openai_api_key
    if not key:
        raise HTTPException(status_code=400, detail="OpenAI API key is required.")
        
    system_prompt = f"""
You are a top-tier institutional financial analyst at FinLens. 
You are discussing {req.ticker}.
Answer authoritatively, concisely, and use financial terminology.
CRITICAL: Always cite the source of your data and the date/timeframe.
"""
    if req.context_source in ["report", "both"] and req.report_markdown:
        system_prompt += f"""
<YOUR_REPORT>
{req.report_markdown}
</YOUR_REPORT>
"""
    if req.context_source in ["raw", "both"] and req.raw_data:
        import json
        # Truncate raw data to prevent token limits
        safe_raw = {
            "market_info": req.raw_data.get("market", {}).get("info", {}),
            "normalized": req.raw_data.get("normalized", {}),
            "peers": req.raw_data.get("peers", {})
        }
        system_prompt += f"""
<RAW_FINANCIAL_DATA>
{json.dumps(safe_raw, indent=2)}
</RAW_FINANCIAL_DATA>
"""
    
    # Construct the message array for OpenAI
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in req.messages:
        api_messages.append({"role": msg.role, "content": msg.content})
        
    async def event_generator():
        try:
            from openai import AsyncOpenAI
            ai_client = AsyncOpenAI(api_key=key, base_url="https://api.deepseek.com")
            
            response = await ai_client.chat.completions.create(
                model="deepseek-v4-flash",
                messages=api_messages,
                temperature=0.3,
                max_tokens=4000,
                stream=True
            )
            
            import json
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    yield {"event": "message", "data": json.dumps({"text": chunk.choices[0].delta.content})}
            yield {"event": "done", "data": "{}"}
        except Exception as e:
            import json
            yield {"event": "error", "data": json.dumps({"message": str(e)})}
            
    from sse_starlette.sse import EventSourceResponse
    return EventSourceResponse(event_generator())
