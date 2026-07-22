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
    language: str = "en"

@router.post("/")
async def analyze_company(request: Request, body: AnalysisRequest):
    """
    Starts the analysis pipeline for the given ticker.
    Returns a Server-Sent Events (SSE) stream.
    """
    async def event_generator():
        import json
        import asyncio
        
        queue = asyncio.Queue()

        async def producer():
            try:
                async for event in run_pipeline(
                    body.ticker, 
                    body.llm_provider, 
                    body.llm_api_key,
                    fred_api_key=body.fred_api_key,
                    congress_api_key=body.congress_api_key,
                    sec_email=body.sec_email,
                    language=body.language
                ):
                    await queue.put(event)
                await queue.put(None)
            except asyncio.CancelledError:
                pass
            except Exception as e:
                await queue.put({"event": "error", "data": json.dumps({"message": str(e)})})
                await queue.put(None)

        task = asyncio.create_task(producer())

        try:
            while True:
                if await request.is_disconnected():
                    print("Client disconnected. Cancelling analysis task.")
                    task.cancel()
                    break
                
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=1.0)
                    if event is None:
                        break
                    yield event
                except asyncio.TimeoutError:
                    continue
        finally:
            if not task.done():
                task.cancel()

    return EventSourceResponse(event_generator())
