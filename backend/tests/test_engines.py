import pytest
import asyncio
from app.engines.calibration import score_to_bucket, calculate_calibrated_company_score, summarize_market_verdict
from app.models.enums import ImpactBucket, DepthMode, TimeHorizon
from app.engines.mode_a import ModeAEngine
from app.engines.mode_b import ModeBEngine
from app.models.market_report import MarketReport
from app.models.company_report import CompanyReport


def test_score_to_bucket_classification():
    assert score_to_bucket(-4.5) == ImpactBucket.NEGATIVE_HIGH
    assert score_to_bucket(-1.8) == ImpactBucket.NEGATIVE_MODERATE
    assert score_to_bucket(0.1) == ImpactBucket.NEUTRAL
    assert score_to_bucket(1.5) == ImpactBucket.POSITIVE_MODERATE
    assert score_to_bucket(3.8) == ImpactBucket.POSITIVE_HIGH


def test_calibrated_company_score_modifiers():
    # Negative sector score: -4.0
    # Resilient company should get cushioned
    score_resilient = calculate_calibrated_company_score(
        sector_score=-4.0,
        resilience_score=80.0,
        net_debt_ebitda=0.4,
        pricing_power="high"
    )
    # Stressed company should get amplified downside
    score_stressed = calculate_calibrated_company_score(
        sector_score=-4.0,
        resilience_score=40.0,
        net_debt_ebitda=3.5,
        pricing_power="low"
    )
    assert score_resilient > score_stressed
    assert score_resilient > -4.0
    assert score_stressed < -4.0


def test_summarize_market_verdict():
    scores = [-4.0, -3.0, -1.5, 0.0, 1.2, 3.5]
    verdict = summarize_market_verdict(scores)
    assert "overall_bias" in verdict
    assert verdict["positive_sectors_count"] == 2
    assert verdict["negative_sectors_count"] == 3


@pytest.mark.asyncio
async def test_mode_a_engine_execution_and_streaming():
    engine = ModeAEngine()
    streamed_steps = []

    def callback(step):
        streamed_steps.append(step["step_id"])

    report = await engine.run(
        event_text="Brent Crude surges 15% amid geopolitical supply disruption in Middle East",
        category="macro",
        time_horizon=TimeHorizon.SHORT_TERM,
        depth=DepthMode.STANDARD,
        stream_callback=callback
    )

    assert isinstance(report, MarketReport)
    assert report.id.startswith("MR-")
    assert len(report.sectors) > 0
    assert len(report.companies) > 0
    assert len(report.scenarios) == 3
    assert len(streamed_steps) >= 10  # A1 to A10 emitted


@pytest.mark.asyncio
async def test_mode_b_engine_execution_and_streaming():
    engine = ModeBEngine()
    streamed_steps = []

    def callback(step):
        streamed_steps.append(step["step_id"])

    report = await engine.run(
        symbol="ASIANPAINT",
        event_text="Brent crude spikes to $95 per barrel",
        category="macro",
        depth=DepthMode.STANDARD,
        stream_callback=callback
    )

    assert isinstance(report, CompanyReport)
    assert report.id.startswith("CR-")
    assert report.company.symbol == "ASIANPAINT"
    assert report.resilience.resilience_score > 0
    assert len(report.strategy.immediate_0_30d) > 0
    assert len(report.strategy.long_term_6_24m) > 0
    assert len(streamed_steps) >= 8  # B1 to B8 emitted
