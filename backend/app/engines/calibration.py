from typing import List, Dict, Any
from app.models.enums import ImpactBucket


def score_to_bucket(score: float) -> ImpactBucket:
    """
    Classifies a numerical impact score (-5.0 to +5.0) into one of the 5 canonical buckets:
      - Negative High: score <= -3.0
      - Negative Moderate: -3.0 < score <= -0.5
      - Neutral: -0.5 < score < 0.5
      - Positive Moderate: 0.5 <= score < 3.0
      - Positive High: score >= 3.0
    """
    if score <= -3.0:
        return ImpactBucket.NEGATIVE_HIGH
    elif score <= -0.5:
        return ImpactBucket.NEGATIVE_MODERATE
    elif score < 0.5:
        return ImpactBucket.NEUTRAL
    elif score < 3.0:
        return ImpactBucket.POSITIVE_MODERATE
    else:
        return ImpactBucket.POSITIVE_HIGH


def calculate_calibrated_company_score(
    sector_score: float,
    resilience_score: float,
    net_debt_ebitda: float,
    pricing_power: str = "medium"
) -> float:
    """
    Adjusts the broad sector baseline score based on company-specific balance sheet resilience,
    debt burden, and pricing power.
    - If sector faces negative impact (sector_score < 0):
        - High resilience (> 75) and low debt (< 1.0x) dampens negative impact (score moves closer to 0).
        - High debt (> 3.0x) and low resilience (< 50) amplifies negative impact by up to 1.3x.
        - High pricing power provides +0.5 buffer against input cost drag.
    - If sector faces positive impact (sector_score > 0):
        - High resilience and low debt enables aggressive capital deployment (+0.3x bonus).
        - High debt limits ability to capitalize on industry tailwinds (-0.2x penalty).
    """
    adjusted = sector_score

    if sector_score < 0:
        # Negative impact scenario
        if resilience_score >= 75.0 and net_debt_ebitda <= 1.0:
            adjusted = sector_score * 0.75  # 25% cushion
        elif net_debt_ebitda >= 3.0 or resilience_score <= 45.0:
            adjusted = sector_score * 1.25  # 25% amplification of downside

        if pricing_power.lower() == "high":
            adjusted += 0.5
        elif pricing_power.lower() == "low":
            adjusted -= 0.3
    elif sector_score > 0:
        # Positive impact scenario
        if resilience_score >= 75.0 and net_debt_ebitda <= 1.0:
            adjusted = min(5.0, sector_score * 1.15)
        elif net_debt_ebitda >= 3.0:
            adjusted = sector_score * 0.8  # Constrained balance sheet

    # Bound strictly between -5.0 and +5.0
    return round(max(min(adjusted, 5.0), -5.0), 2)


def summarize_market_verdict(sector_scores: List[float]) -> Dict[str, Any]:
    """
    Computes market-level summary statistics and high-level market bias.
    """
    if not sector_scores:
        return {
            "overall_bias": "Neutral",
            "net_market_impact": 0.0,
            "positive_sectors_count": 0,
            "negative_sectors_count": 0,
            "neutral_sectors_count": 0,
            "volatility_regime": "Normal"
        }

    pos = sum(1 for s in sector_scores if s >= 0.5)
    neg = sum(1 for s in sector_scores if s <= -0.5)
    neu = len(sector_scores) - pos - neg
    avg_score = round(sum(sector_scores) / len(sector_scores), 2)

    if avg_score >= 1.0:
        bias = "Strong Net Bullish"
    elif avg_score >= 0.3:
        bias = "Mild Net Bullish"
    elif avg_score <= -1.0:
        bias = "Broadly Bearish / Risk-Off"
    elif avg_score <= -0.3:
        bias = "Cautious / Defensive Tilt"
    else:
        bias = "Rotational / Dispersed"

    # Dispersion / Volatility
    diffs = [abs(s - avg_score) for s in sector_scores]
    dispersion = round(sum(diffs) / len(diffs), 2)
    volatility = "High Dispersion" if dispersion >= 2.0 else "Sector-Specific"

    return {
        "overall_bias": bias,
        "net_market_impact": avg_score,
        "positive_sectors_count": pos,
        "negative_sectors_count": neg,
        "neutral_sectors_count": neu,
        "dispersion_index": dispersion,
        "volatility_regime": volatility
    }
