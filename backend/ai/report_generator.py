from openai import AsyncOpenAI
from .prompt_loader import load_prompt
from ..config import settings
import asyncio

async def generate_report(ticker: str, context_markdown: str, llm_provider: str, api_key: str):
    """
    Streams a report from the selected LLM provider.
    """
    system_prompt = load_prompt()
    
    # Construct the final user prompt
    user_prompt = f"Target Company: {ticker}\n\nHere is the collected context data:\n{context_markdown}\n\nPlease proceed with the analysis."
    
    if llm_provider == "openai":
        key = api_key if api_key else settings.openai_api_key
        if not key:
            yield "Error: No OpenAI API key provided."
            return
            
        client = AsyncOpenAI(api_key=key, base_url="https://api.deepseek.com")
        
        try:
            stream = await client.chat.completions.create(
                model="deepseek-v4-flash", # Changed to deepseek-v4-flash
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True,
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield f"\n\nError during generation: {str(e)}"
            
    else:
        # Fallback / mock for unsupported MVP providers
        yield f"Generating report for {ticker} using {llm_provider} (not fully implemented in MVP)...\n\n"
        yield f"System Prompt length: {len(system_prompt)}\n"
        yield f"Context length: {len(context_markdown)}\n"
        await asyncio.sleep(1)
        yield "\nDone."
