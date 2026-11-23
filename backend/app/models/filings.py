from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone


class CorporateAnnouncement(BaseModel):
    id: str
    symbol: str
    company_name: str
    exchange: str = "NSE"  # NSE or BSE
    category: str = "General Announcement"
    headline: str
    summary: str
    materiality_score: int = Field(ge=1, le=10, default=5)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    attachment_url: Optional[str] = None
    is_high_impact: bool = False


class FilingsResponse(BaseModel):
    count: int
    high_impact_count: int
    announcements: List[CorporateAnnouncement]
