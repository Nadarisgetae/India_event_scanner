from enum import Enum

class ImpactBucket(str, Enum):
    DANGER = "danger"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    GAIN = "gain"

    # Semantic aliases
    NEGATIVE_HIGH = "danger"
    NEGATIVE_MODERATE = "negative"
    POSITIVE_MODERATE = "positive"
    POSITIVE_HIGH = "gain"

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class EventType(str, Enum):
    COMMODITY_SHOCK = "commodity_shock"
    POLICY_CHANGE = "policy_change"
    GEOPOLITICAL = "geopolitical"
    MONETARY_POLICY = "monetary_policy"
    TRADE_ACTION = "trade_action"
    OTHER = "other"

class Direction(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    MIXED = "mixed"

class Magnitude(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"

class Duration(str, Enum):
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"

class Certainty(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class DepthMode(str, Enum):
    QUICK = "quick"
    STANDARD = "standard"
    DEEP = "deep"

class ReportType(str, Enum):
    MARKET = "market"
    COMPANY = "company"

class PlanStance(str, Enum):
    DEFEND = "defend"
    CAPITALIZE = "capitalize"
    BOTH = "both"
    BALANCED = "both"

class TimeHorizon(str, Enum):
    IMMEDIATE = "immediate"
    SHORT = "short"
    SHORT_TERM = "short"
    LONG = "long"
    LONG_TERM = "long"

class SpeedOfTransmission(str, Enum):
    IMMEDIATE = "immediate"
    MEDIUM_TERM = "medium_term"
    SLOW = "slow"

class DirectnessOfImpact(str, Enum):
    DIRECT_1ST_ORDER = "direct_1st_order"
    INDIRECT_2ND_ORDER = "indirect_2nd_order"
    SYSTEMIC = "systemic"

class VerificationStatus(str, Enum):
    HUMAN_VERIFIED = "human-verified"
    LLM_DRAFT = "llm-draft"
