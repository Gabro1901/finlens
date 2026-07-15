import asyncio
import httpx
import json

async def test_chat():
    url = "http://localhost:8000/api/chat/"
    payload = {
        "ticker": "AAPL",
        "report_markdown": "## AAPL Report\nApple is a tech company.",
        "raw_data": {"market": {"info": {"marketCap": 3000000000000}}},
        "messages": [{"role": "user", "content": "What is their market cap?"}],
        "context_source": "both"
    }
    
    async with httpx.AsyncClient() as client:
        async with client.stream("POST", url, json=payload, timeout=30.0) as response:
            print(f"Status: {response.status_code}")
            async for chunk in response.aiter_text():
                print(chunk, end="")

if __name__ == "__main__":
    asyncio.run(test_chat())
