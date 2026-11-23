from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.portfolio import (
    PortfolioHolding, PortfolioStressResult, PortfolioStressRequest
)
from app.engines.portfolio import PortfolioStressEngine

router = APIRouter()
portfolio_engine = PortfolioStressEngine()


class CSVParseRequest(BaseModel):
    csv_text: str


@router.post("/portfolio/parse-csv", response_model=List[PortfolioHolding])
async def parse_portfolio_csv(req: CSVParseRequest):
    """
    Parses CSV text into a structured list of portfolio holdings.
    Supports Zerodha Kite, Groww, Upstox, and standard CSV formats.
    """
    try:
        holdings = portfolio_engine.parse_csv_holdings(req.csv_text)
        return holdings
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")


@router.post("/portfolio/analyze", response_model=PortfolioStressResult)
async def analyze_portfolio_stress(req: PortfolioStressRequest):
    """
    Simulates macro event impact across a user's portfolio and returns
    net value drawdown, 12-channel sensitivity vector, and hedging recommendations.
    """
    try:
        result = await portfolio_engine.stress_test_portfolio(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Portfolio stress test failed: {str(e)}")
