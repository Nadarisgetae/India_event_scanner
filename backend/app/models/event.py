from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.models.enums import EventType, Magnitude, Duration, Certainty, Direction

class ParsedEvent(BaseModel):
    event_id: Optional[str] = None
    raw_input: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    affected_channels: List[str] = Field(default_factory=list)
    key_assets_impacted: List[str] = Field(default_factory=list)

    # Core taxonomy fields
    headline: str = ""
    event_type: EventType = EventType.OTHER
    geographies: List[str] = Field(default_factory=lambda: ["India", "Global"])
    magnitude: Magnitude = Magnitude.MEDIUM
    duration: Duration = Duration.MEDIUM
    certainty: Certainty = Certainty.HIGH
    direction_for_india: Direction = Direction.NEUTRAL
    key_facts: List[str] = Field(default_factory=list)
    unknowns: List[str] = Field(default_factory=list)
    original_language: str = "en"
    original_text: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if not self.headline and self.title:
            self.headline = self.title
        if not self.title and self.headline:
            self.title = self.headline

class ChannelImpact(BaseModel):
    channel: str = ""
    active: bool = True
    direction: Direction = Direction.NEUTRAL
    strength: int = Field(default=3, ge=1, le=5)
    reason: str = ""

    # Extended helper fields
    channel_id: Optional[str] = None
    name: Optional[str] = None
    intensity: Optional[float] = None
    speed: Optional[str] = None
    directness: Optional[str] = None
    narrative: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if not self.channel and self.channel_id:
            self.channel = self.channel_id
        if not self.channel_id and self.channel:
            self.channel_id = self.channel
        if not self.reason and self.narrative:
            self.reason = self.narrative
        if not self.narrative and self.reason:
            self.narrative = self.reason

class MacroItem(BaseModel):
    direction: Direction = Direction.NEUTRAL
    magnitude_band: str = "moderate"
    confidence: str = "medium"
    horizon: str = "short"

class MacroImpact(BaseModel):
    gdp_growth: MacroItem = Field(default_factory=MacroItem)
    cpi_inflation: MacroItem = Field(default_factory=MacroItem)
    current_account_deficit: MacroItem = Field(default_factory=MacroItem)
    inr_direction: MacroItem = Field(default_factory=MacroItem)
    yield_10y: MacroItem = Field(default_factory=MacroItem)
    rbi_stance: MacroItem = Field(default_factory=MacroItem)
    fii_flows: MacroItem = Field(default_factory=MacroItem)
    nifty_tone: MacroItem = Field(default_factory=MacroItem)

    # Narrative summary extensions
    gdp_growth_impact: Optional[str] = None
    inflation_trajectory: Optional[str] = None
    fiscal_balance_effect: Optional[str] = None
    monetary_policy_stance: Optional[str] = None

class MacroSnapshot(BaseModel):
    nifty50: float = 24850.0
    sensex: float = 81200.0
    vix: float = 13.8
    usdinr: float = 84.45
    brent_crude: float = 74.20
    gold: float = 2680.0
    us_10y: float = 4.42
    repo_rate: float = 6.50

    # Aliases
    @property
    def nifty_50(self) -> float:
        return self.nifty50

    @property
    def india_vix(self) -> float:
        return self.vix
