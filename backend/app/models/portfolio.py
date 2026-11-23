from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime, timezone
from app.models.enums import ImpactBucket
from app.models.company_report import ActionItem


class PortfolioHolding(BaseModel):
    symbol: str
    exchange: str = "NSE"
    quantity: float = 1.0
    buy_price: Optional[float] = None
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    weight_pct: Optional[float] = None
    sector: Optional[str] = None


class HoldingImpact(BaseModel):
    symbol: str
    company_name: str
    sector: str
    quantity: float
    weight_pct: float
    current_value: float
    bucket: ImpactBucket
    predicted_abnormal_return_pct: float
    estimated_pnl_inr: float
    confidence: float
    primary_channel: str
    rationale: str


class PortfolioStressResult(BaseModel):
    portfolio_name: str = "Indian Equity Portfolio"
    total_holdings_count: int
    total_portfolio_value_inr: float
    net_portfolio_impact_pct: float
    net_portfolio_pnl_inr: float
    event_headline: str
    channel_exposure_breakdown: Dict[str, float] = Field(default_factory=dict)
    bucket_distribution: Dict[str, int] = Field(default_factory=dict)
    holdings_impact: List[HoldingImpact] = Field(default_factory=list)
    top_detractors: List[HoldingImpact] = Field(default_factory=list)
    top_beneficiaries: List[HoldingImpact] = Field(default_factory=list)
    hedging_recommendations: List[ActionItem] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PortfolioStressRequest(BaseModel):
    holdings: List[PortfolioHolding]
    event_text: str
    portfolio_name: Optional[str] = "Portfolio"
