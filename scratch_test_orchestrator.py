import asyncio
from backend.pipeline.orchestrator import run_pipeline
from backend.config import settings

async def test_pipeline():
    ticker = "AAPL"
    api_key = settings.openai_api_key
    
    print(f"Starting pipeline for {ticker}...")
    # we only run a small part or wait for the context building
    events = run_pipeline(ticker, "openai", api_key)
    async for event in events:
        import json
        if event["event"] == "status":
            data = json.loads(event["data"])
            print("Status:", data["stage"], "-", data["message"])
        elif event["event"] == "error":
            print("Error:", event["data"])
        elif event["event"] == "raw_data":
            print("Raw Data generated successfully.")
            data = json.loads(event["data"])
            context_prompt = data.get("context_prompt", "")
            print(f"Context Prompt length: {len(context_prompt)}")
            print("--- Context Snippet ---")
            print(context_prompt[:500])
            print("-----------------------")
            
            print("Peer Comparison snippet:")
            if "Peer Comparison Data" in context_prompt:
                idx = context_prompt.find("Peer Comparison Data")
                print(context_prompt[idx:idx+500])
            break  # stop before generation to save time and tokens

if __name__ == "__main__":
    asyncio.run(test_pipeline())
