import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

load_dotenv("c:/Users/gabri/Desktop/F-LSEG/.env")
key = os.getenv("OPENAI_API_KEY")

async def test():
    try:
        ai_client = AsyncOpenAI(api_key=key, base_url="https://api.deepseek.com")
        print("Sending request with model: deepseek-v4-flash")
        response = await ai_client.chat.completions.create(
            model="deepseek-v4-flash",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(test())
