import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    asyncio.run(init_db())

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["version"] == "2.4.0"

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_macro_snapshot():
    response = client.get("/api/v1/macro/snapshot")
    assert response.status_code == 200
    data = response.json()
    assert "nifty50" in data
    assert "brent_crude" in data
    assert "usdinr" in data

def test_knowledge_base_endpoints():
    r_uni = client.get("/api/v1/universe")
    assert r_uni.status_code == 200
    assert r_uni.json()["count"] > 0

    r_ch = client.get("/api/v1/channels")
    assert r_ch.status_code == 200
    assert len(r_ch.json()["channels"]) == 12

    r_sec = client.get("/api/v1/sectors/matrix")
    assert r_sec.status_code == 200
    assert len(r_sec.json()["matrix"]) > 0

    r_pe = client.get("/api/v1/past-events")
    assert r_pe.status_code == 200
    assert r_pe.json()["count"] >= 10

def test_company_ratios_and_profile():
    r_rat = client.get("/api/v1/companies/RELIANCE/ratios")
    assert r_rat.status_code == 200
    assert "resilience_breakdown" in r_rat.json()

    r_prof = client.get("/api/v1/companies/TCS/profile")
    assert r_prof.status_code == 200
    assert r_prof.json()["symbol"] == "TCS"

def test_synchronous_market_analysis():
    payload = {
        "event_text": "Brent crude spikes 12% following Red Sea tanker attack",
        "category": "macro",
        "time_horizon": "short",
        "depth": "standard",
        "synchronous": True
    }
    response = client.post("/api/v1/analyze/market", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "report" in data
    assert data["report"]["id"].startswith("MR-")

def test_synchronous_company_analysis():
    payload = {
        "symbol": "INDIGO",
        "event_text": "Brent crude spikes 12% following Red Sea tanker attack",
        "category": "macro",
        "depth": "standard",
        "synchronous": True
    }
    response = client.post("/api/v1/analyze/company", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "report" in data
    assert data["report"]["id"].startswith("CR-")

def test_saved_reports_lifecycle():
    r_list = client.get("/api/v1/reports")
    assert r_list.status_code == 200
    reports = r_list.json()["reports"]
    assert len(reports) >= 2  # generated from above tests

    # Fetch first report
    rep_id = reports[0]["id"]
    r_fetch = client.get(f"/api/v1/reports/{rep_id}")
    assert r_fetch.status_code == 200
    assert r_fetch.json()["id"] == rep_id
