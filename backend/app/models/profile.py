from pydantic import BaseModel, Field
from typing import List, Dict, Union, Any, Optional
from app.models.enums import VerificationStatus, ConfidenceLevel, Direction, SpeedOfTransmission, DirectnessOfImpact

class FinancialHealth(BaseModel):
    resilience_score: float = 65.0
    net_debt_ebitda: float = 1.0
    interest_coverage: float = 8.0
    operating_margin: float = 18.0
    roe: float = 16.0
    cash_flow_from_ops_cr: float = 2500.0
    capex_to_operating_cf: float = 40.0

class TransmissionExposure(BaseModel):
    channel_id: str
    channel_name: str
    direction: Direction
    historical_sensitivity: float = Field(ge=-5.0, le=5.0)
    speed: SpeedOfTransmission = SpeedOfTransmission.MEDIUM_TERM
    directness: DirectnessOfImpact = DirectnessOfImpact.DIRECT_1ST_ORDER
    description: str = ""

class ResilienceSnapshot(BaseModel):
    score: int = Field(default=65, ge=0, le=100)
    band: str = "medium"  # high, medium, low
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    ratios: Dict[str, Union[str, float, int]] = Field(default_factory=dict)
    resilience_score: Optional[float] = None
    financial_health_score: Optional[float] = None
    pricing_power_rating: Optional[str] = None
    market_position: Optional[str] = None
    key_strengths: List[str] = Field(default_factory=list)
    key_vulnerabilities: List[str] = Field(default_factory=list)

class CompanyExposureProfile(BaseModel):
    symbol: str
    company_name: str
    sector: str
    sub_industry: Optional[str] = ""
    pricing_power: str = "medium"
    exposures: List[TransmissionExposure] = Field(default_factory=list)
    financial_health: FinancialHealth = Field(default_factory=FinancialHealth)
    strategic_posture: str = "resilient"

class ExposureProfile(BaseModel):
    symbol: str
    name: str
    sector: str
    verification: VerificationStatus = VerificationStatus.LLM_DRAFT
    confidence: ConfidenceLevel = ConfidenceLevel.MEDIUM
    last_verified: str
    business_summary: str
    revenue_mix: Dict[str, float] = Field(default_factory=dict)
    exposure_tags: List[str] = Field(default_factory=list)
    resilience: ResilienceSnapshot
    ratios: Dict[str, Union[str, float, int]] = Field(default_factory=dict)
    sources: List[str] = Field(default_factory=list)

class UniverseCompany(BaseModel):
    symbol: str
    name: str
    sector: str
    market_cap_bucket: str = "large"  # large, mid, small
    price_series: List[float] = Field(default_factory=list)
    resilience_band: str = "medium"   # high, medium, low
    tags: List[str] = Field(default_factory=list)
    isin: Optional[str] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
