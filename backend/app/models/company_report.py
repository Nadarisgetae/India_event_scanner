from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from app.models.enums import PlanStance, TimeHorizon, ConfidenceLevel, ImpactBucket
from app.models.event import ParsedEvent, ChannelImpact, MacroSnapshot
from app.models.profile import ResilienceSnapshot
from app.models.market_report import Scenario, AnalogueItem, ReportAppendix

class CompanyDimensionImpact(BaseModel):
    dimension: str
    impact: float = Field(ge=-3.0, le=3.0)
    explanation: str
    evidence: str
    magnitude_estimate: str
    timing: TimeHorizon
    confidence: ConfidenceLevel

class ActionItem(BaseModel):
    action: str
    lever: str
    why: str
    owner: str
    cost_effort: str  # low, medium, high
    expected_effect: str
    risk: str

class KPITracker(BaseModel):
    kpi: str
    target: str
    frequency: str

class TriggerPoint(BaseModel):
    condition: str
    then_switch_to: str

class StrategyPlan(BaseModel):
    stance: PlanStance
    immediate_0_30d: List[ActionItem] = Field(default_factory=list)
    short_term_1_6m: List[ActionItem] = Field(default_factory=list)
    long_term_6_24m: List[ActionItem] = Field(default_factory=list)
    kpis_to_track: List[KPITracker] = Field(default_factory=list)
    trigger_points: List[TriggerPoint] = Field(default_factory=list)
    plan_risks: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)

class TechnicalView(BaseModel):
    period: str  # 1D, 1W, 1M
    chart_data: List[Dict[str, Any]] = Field(default_factory=list)
    bias: str  # bullish, bearish, neutral
    key_levels: Dict[str, float] = Field(default_factory=dict)

class NewsSentimentItem(BaseModel):
    headline: str
    source: str
    date: str
    sentiment: str  # positive, negative, neutral
    materiality: str  # high, medium, low

class PeerComparison(BaseModel):
    symbol: str
    name: str
    impact_score: float
    bucket: ImpactBucket
    better_than_subject: bool

class CompanySubject(BaseModel):
    symbol: str
    name: str
    sector: str
    price: float
    impact_score: float
    business_summary: Optional[str] = None

class MarketView(BaseModel):
    technicals: List[TechnicalView] = Field(default_factory=list)
    priced_in_note: str = ""
    news_sentiment: List[NewsSentimentItem] = Field(default_factory=list)

class MonteCarloBin(BaseModel):
    bin_label: str
    bin_center: float
    count: int
    probability_pct: float

class MonteCarloSimulation(BaseModel):
    simulations_count: int = 10000
    base_ebitda_cr: float
    expected_ebitda_cr: float
    base_margin_pct: float
    expected_margin_pct: float
    margin_contraction_bps: int
    ebitda_drawdown_p5_cr: float
    ebitda_drawdown_p1_cr: float
    var_95_drawdown_pct: float
    var_99_drawdown_pct: float
    prob_negative_ebitda_pct: float
    prob_covenant_breach_pct: float
    interest_coverage_base: float
    interest_coverage_p5: float
    cash_runway_months_p5: float
    distribution_bins: List[MonteCarloBin] = Field(default_factory=list)
    summary_interpretation: str = ""

class CompanyReport(BaseModel):
    id: str
    type: str = "company"
    company: CompanySubject
    event: ParsedEvent
    channels: List[ChannelImpact]
    dimensions: List[CompanyDimensionImpact]
    resilience: ResilienceSnapshot
    market_view: MarketView
    macro_backdrop: MacroSnapshot
    peers: List[PeerComparison] = Field(default_factory=list)
    strategy: StrategyPlan
    scenarios: List[Scenario] = Field(default_factory=list)
    analogues: List[AnalogueItem] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    appendix: ReportAppendix
    monte_carlo: Optional[MonteCarloSimulation] = None
