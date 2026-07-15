import asyncio
from fastapi import APIRouter, Request
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from ..pipeline.orchestrator import run_pipeline

router = APIRouter()

class AnalysisRequest(BaseModel):
    ticker: str
    llm_provider: str = "openai"
    llm_api_key: str = ""
    fred_api_key: str = ""
    congress_api_key: str = ""
    sec_email: str = ""

@router.post("/")
async def analyze_company(request: Request, body: AnalysisRequest):
    """
    Starts the analysis pipeline for the given ticker.
    Returns a Server-Sent Events (SSE) stream.
    """
    async def event_generator():
        try:
            # Yield events from the pipeline
            async for event in run_pipeline(
                body.ticker, 
                body.llm_provider, 
                body.llm_api_key,
                fred_api_key=body.fred_api_key,
                congress_api_key=body.congress_api_key,
                sec_email=body.sec_email
            ):
                # Ensure the client is still connected
                if await request.is_disconnected():
                    break
                yield event
        except Exception as e:
            import json
            yield {"event": "error", "data": json.dumps({"message": str(e)})}
            
    return EventSourceResponse(event_generator())
