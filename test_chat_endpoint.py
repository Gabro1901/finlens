import asyncio
import httpx
import json

async def test():
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.post('http://localhost:8000/api/chat/', json={
                "ticker": "MSFT",
                "report_markdown": "This is a report.",
                "messages": [{"role": "user", "content": "Hello"}],
                "api_key": ""
            })
            print("Status:", response.status_code)
            print("Body:", response.text)
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(test())
