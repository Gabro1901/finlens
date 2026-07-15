import os
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analysis
from .routers import export
from .routers import chat
from .routers import history
from .routers import search

# Ensure env vars are loaded
from .config import settings

app = FastAPI(title="FinLens API", version="1.0.0")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])

@app.get("/")
def read_root():
    return {"status": "FinLens Backend is running"}
