from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ExportRequest(BaseModel):
    markdown_content: str
    ticker: str

import json
import tempfile
import os
import asyncio

def _generate_pdf_sync(markdown_content: str, ticker: str) -> bytes:
    from playwright.sync_api import sync_playwright
    
    fd, pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Go to the frontend print view.
            page.goto("http://localhost:5173/?print=true")
            
            # Inject the markdown data into the window object safely via args
            page.evaluate(
                "([markdown, ticker]) => { window.printMarkdown = markdown; window.printTicker = ticker; }", 
                [markdown_content, ticker]
            )
            
            # Dispatch the event so the React component knows the data is ready
            page.evaluate("window.dispatchEvent(new Event('printDataReady'))")
            
            # Wait for the frontend to render the report.
            page.wait_for_selector('.print-ready', state='attached', timeout=10000)
            
            # Wait a little longer for Recharts animations to finish
            page.wait_for_timeout(2000)
            
            # Generate the PDF
            page.pdf(
                path=pdf_path,
                format="A4",
                margin={"top": "10mm", "bottom": "10mm", "left": "10mm", "right": "10mm"},
                print_background=True
            )
            
            browser.close()
            
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        return pdf_bytes
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

@router.post("/pdf")
async def export_pdf(req: ExportRequest):
    try:
        pdf_bytes = await asyncio.to_thread(_generate_pdf_sync, req.markdown_content, req.ticker)
            
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="FinLens_{req.ticker}_Report.pdf"'}
        )
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"PDF Generation failed: {repr(e)}\n{err_msg}")

@router.post("/markdown")
async def export_markdown(req: ExportRequest):
    return Response(
        content=req.markdown_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="FinLens_{req.ticker}_Report.md"'}
    )
