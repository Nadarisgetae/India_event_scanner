from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.api.routes_market import router as market_router
from app.api.routes_company import router as company_router
from app.api.routes_reports import router as reports_router
from app.api.routes_knowledge import router as knowledge_router
from app.api.routes_system import router as system_router
from app.api.routes_ws import router as ws_router
from app.api.routes_portfolio import router as portfolio_router
from app.api.routes_filings import router as filings_router
from app.data.scheduler import scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure SQLite tables exist and start background scheduler
    await init_db()
    scheduler.start()
    yield
    # Shutdown: Stop scheduler cleanly
    scheduler.stop()

app = FastAPI(
    title="India Event-Impact Scanner Backend",
    version="2.4.0",
    description="Production-grade asynchronous reasoning backend for Indian Equity Macro Event Scanning.",
    lifespan=lifespan
)

# CORS Configuration for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server on localhost:5173, 3000, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api/v1
app.include_router(market_router, prefix="/api/v1", tags=["Market Analysis"])
app.include_router(company_router, prefix="/api/v1", tags=["Company Strategy"])
app.include_router(reports_router, prefix="/api/v1", tags=["Saved Reports"])
app.include_router(knowledge_router, prefix="/api/v1", tags=["Knowledge Base & Universe"])
app.include_router(system_router, prefix="/api/v1", tags=["System & Keys"])
app.include_router(ws_router, prefix="/api/v1", tags=["Live WebSocket Streaming"])
app.include_router(portfolio_router, prefix="/api/v1", tags=["Portfolio Stress-Testing"])
app.include_router(filings_router, prefix="/api/v1", tags=["Exchange Filings Watcher"])

@app.get("/")
async def root():
    return {
        "app": "India Event-Impact Scanner",
        "version": "2.4.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
