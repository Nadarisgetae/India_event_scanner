from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from app.models.enums import ImpactBucket, ConfidenceLevel, TimeHorizon, DepthMode
from app.models.event import ParsedEvent, ChannelImpact, MacroImpact, MacroSnapshot

class SectorImpact(BaseModel):
    sector: str
    score: float = Field(ge=-5.0, le=5.0)
    confidence: ConfidenceLevel
    reason: str
    key_channels: List[str] = Field(default_factory=list)

class CompanyImpact(BaseModel):
    symbol: str
    name: str
    sector: str
    impact_score: float = Field(ge=-5.0, le=5.0)
    bucket: ImpactBucket
    primary_channels: List[str] = Field(default_factory=list)
    reasoning: str
    magnitude_estimate: str
    horizon: TimeHorizon
    confidence: ConfidenceLevel
    mitigants: List[str] = Field(default_factory=list)
    data_gaps: List[str] = Field(default_factory=list)

class Scenario(BaseModel):
    name: str
    narrative: str
    triggers: List[str] = Field(default_factory=list)
    bucket_shifts: List[Dict[str, str]] = Field(default_factory=list)

class TimelineItem(BaseModel):
    period: str
    events: List[str] = Field(default_factory=list)

class WatchlistItem(BaseModel):
    trigger: str
    action: str

class AnalogueItem(BaseModel):
    event: str
    date: str
    outcome: str

class ReportAppendix(BaseModel):
    models_used: List[str] = Field(default_factory=list)
    prompt_versions: List[str] = Field(default_factory=list)
    call_count: int = 0
    generation_time_seconds: float = 0.0
    depth: DepthMode = DepthMode.STANDARD
    generated_at: str

class MarketReport(BaseModel):
    id: str
    type: str = "market"
    title: str
    event: ParsedEvent
    executive_summary: str
    verdict: Dict[str, Any]
    channels: List[ChannelImpact]
    macro: MacroImpact
    macro_backdrop: MacroSnapshot
    sectors: List[SectorImpact]
    companies: List[CompanyImpact]
    uncertain: List[CompanyImpact] = Field(default_factory=list)
    scenarios: List[Scenario] = Field(default_factory=list)
    timeline: List[TimelineItem] = Field(default_factory=list)
    watchlist: List[WatchlistItem] = Field(default_factory=list)
    analogues: List[AnalogueItem] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    appendix: ReportAppendix
