import asyncio
from playwright.async_api import async_playwright

async def test():
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto('http://localhost:5173/?print=true')
            print("Page loaded successfully")
            
            await page.evaluate("window.printMarkdown = 'test'")
            await page.evaluate("window.dispatchEvent(new Event('printDataReady'))")
            
            print("Waiting for .print-ready...")
            await page.wait_for_selector('.print-ready', state='attached', timeout=5000)
            print("Found .print-ready!")
            
            await browser.close()
    except Exception as e:
        print("ERROR:", str(e))

asyncio.run(test())
