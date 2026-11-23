import pytest
import asyncio
from fastapi.testclient import TestClient

from app.main import app
from app.db import init_db
from app.engines.portfolio import PortfolioStressEngine
from app.models.portfolio import PortfolioHolding, PortfolioStressRequest
from app.engines.monte_carlo import MonteCarloEngine
from app.data.filing_parser import FilingParser
from app.data.exchange_watcher import ExchangeWatcher
from app.gateway.multilingual import MultiLingualProcessor


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    asyncio.run(init_db())


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_portfolio_csv_parsing():
    engine = PortfolioStressEngine()
    
    # 1. Test Zerodha format
    zerodha_csv = """Instrument,Qty,Avg. cost,LTP,Cur. val
RELIANCE-EQ,10,2500,2800,28000
TCS-EQ,5,3800,3950,19750"""
    holdings = engine.parse_csv_holdings(zerodha_csv)
    assert len(holdings) == 2
    assert holdings[0].symbol == "RELIANCE"
    assert holdings[0].quantity == 10.0
    assert holdings[0].buy_price == 2500.0

    # 2. Test generic format
    generic_csv = """symbol,quantity,buy_price
MARUTI,4,11500
INFY,50,1800"""
    holdings2 = engine.parse_csv_holdings(generic_csv)
    assert len(holdings2) == 2
    assert holdings2[0].symbol == "MARUTI"
    assert holdings2[0].quantity == 4.0


@pytest.mark.asyncio
async def test_portfolio_stress_simulation():
    engine = PortfolioStressEngine()
    req = PortfolioStressRequest(
        portfolio_name="Test Alpha",
        holdings=[
            PortfolioHolding(symbol="RELIANCE", quantity=10, buy_price=2800),
            PortfolioHolding(symbol="MARUTI", quantity=5, buy_price=12000),
            PortfolioHolding(symbol="TCS", quantity=10, buy_price=4000)
        ],
        event_text="Brent crude oil spikes 25% following Middle East shipping disruptions"
    )

    result = await engine.stress_test_portfolio(req)
    assert result.total_holdings_count == 3
    assert result.total_portfolio_value_inr > 0
    assert len(result.holdings_impact) == 3
    assert "crude_oil" in result.channel_exposure_breakdown or len(result.channel_exposure_breakdown) > 0
    assert len(result.hedging_recommendations) > 0


def test_monte_carlo_simulation():
    engine = MonteCarloEngine()
    sim = engine.simulate_company_shock("ASIANPAINT", simulations_count=10000)
    
    assert sim.simulations_count == 10000
    assert sim.base_margin_pct > 0
    assert sim.expected_margin_pct > 0
    assert sim.var_95_drawdown_pct >= 0
    assert len(sim.distribution_bins) == 12
    assert 0 <= sim.prob_covenant_breach_pct <= 100
    assert len(sim.summary_interpretation) > 20


def test_exchange_filing_parser():
    parser = FilingParser()
    
    # High impact USFDA
    cat, score, is_high = parser.evaluate_filing("USFDA issues Form 483 with 4 observations at formulation facility")
    assert score >= 8
    assert is_high is True
    assert "USFDA" in cat

    # Corporate restructuring
    cat2, score2, is_high2 = parser.evaluate_filing("Board approves Scheme of Demerger of businesses")
    assert score2 >= 7
    assert "M&A" in cat2 or "Restructuring" in cat2

    # Noise pattern (loss of certificate)
    cat3, score3, is_high3 = parser.evaluate_filing("Intimation regarding loss of share certificates")
    assert score3 == 1
    assert is_high3 is False


@pytest.mark.asyncio
async def test_exchange_watcher_feed():
    watcher = ExchangeWatcher()
    feed = await watcher.get_recent_filings()
    assert feed.count >= 5
    assert feed.high_impact_count >= 1
    assert any(a.symbol == "SUNPHARMA" for a in feed.announcements)


def test_multilingual_devanagari_detection_and_translation():
    hindi_text = "कच्चे तेल की कीमतों में 20% की बढ़ोतरी हुई है और भारतीय रिजर्व बैंक रेपो रेट बढ़ा सकता है।"
    assert MultiLingualProcessor.is_devanagari(hindi_text) is True

    # Offline translation fallback test
    english = MultiLingualProcessor.offline_translate(hindi_text)
    assert "crude oil" in english.lower()
    assert "20%" in english
    assert "reserve bank of india" in english.lower() or "rbi" in english.lower()

    # English text detection
    eng_text = "Brent crude spikes by 15%"
    assert MultiLingualProcessor.is_devanagari(eng_text) is False


def test_advanced_api_endpoints(client):
    # 1. Parse CSV API
    csv_payload = {"csv_text": "symbol,quantity,buy_price\nRELIANCE,10,2800\nTCS,5,3900"}
    res = client.post("/api/v1/portfolio/parse-csv", json=csv_payload)
    assert res.status_code == 200
    assert len(res.json()) == 2

    # 2. Portfolio Stress API
    stress_payload = {
        "portfolio_name": "API Portfolio",
        "holdings": [{"symbol": "HDFCBANK", "quantity": 20, "buy_price": 1600}],
        "event_text": "RBI hikes repo rate by 50 bps"
    }
    res_stress = client.post("/api/v1/portfolio/analyze", json=stress_payload)
    assert res_stress.status_code == 200
    data = res_stress.json()
    assert data["portfolio_name"] == "API Portfolio"
    assert len(data["holdings_impact"]) == 1

    # 3. Exchange Filings API
    res_filings = client.get("/api/v1/filings/recent")
    assert res_filings.status_code == 200
    assert res_filings.json()["count"] >= 5

    # 4. Printable HTML Report Export
    res_html = client.get("/api/v1/reports/nonexistent/export-html")
    assert res_html.status_code == 404
