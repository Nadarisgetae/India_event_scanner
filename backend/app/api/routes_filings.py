from typing import Optional
from fastapi import APIRouter, Query

from app.models.filings import FilingsResponse
from app.data.exchange_watcher import exchange_watcher

router = APIRouter()


@router.get("/filings/recent", response_model=FilingsResponse)
async def get_recent_filings(
    exchange: Optional[str] = Query(None, description="Filter by exchange: NSE, BSE, or ALL"),
    high_impact_only: bool = Query(False, description="Filter only filings with materiality score >= 7")
):
    """
    Returns live digested corporate filings from NSE and BSE with materiality scores.
    """
    return await exchange_watcher.get_recent_filings(exchange=exchange, high_impact_only=high_impact_only)
