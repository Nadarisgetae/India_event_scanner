import json
import os
from pathlib import Path
from typing import List, Optional, Dict
from app.models.profile import UniverseCompany
from app.config import settings

# 25 Sector Taxonomy Mapping
SECTOR_TAXONOMY = {
    "Consumer Durables": ["Paints", "Tiles", "Appliances", "Jewellery"],
    "IT Services": ["IT Consulting", "Software", "BPO"],
    "Aviation": ["Airlines", "Airports"],
    "Banking": ["Private Banks", "PSU Banks"],
    "Oil & Gas": ["Integrated Oil & Gas", "Refining", "Marketing", "Petrochemicals"],
    "Oil & Gas Upstream": ["Crude Exploration", "Offshore Drilling"],
    "Oil Marketing Cos": ["Fuel Retail", "Refining"],
    "Automobile": ["Passenger Vehicles", "Commercial Vehicles", "2-Wheelers", "Auto Components"],
    "Pharmaceuticals": ["Generics", "Specialty Pharma", "APIs", "Formulations"],
    "Financial Services": ["Insurance", "NBFCs", "Housing Finance", "Broking"],
    "Consumer Staples": ["FMCG", "Packaged Food", "Personal Care", "Edible Oils"],
    "Telecom": ["Telecom Services", "Towers", "Optical Fibre"],
    "Capital Goods": ["Industrial Machinery", "Engineering", "Heavy Electricals"],
    "Cement": ["Cement", "Building Materials"],
    "Retail": ["Hypermarkets", "Fashion Retail", "E-Commerce"],
    "Internet": ["Quick Commerce", "Food Delivery", "Fintech", "Online Marketplaces"],
    "Logistics": ["Express Logistics", "Freight Forwarding", "Warehousing", "Rail Freight"],
    "Healthcare": ["Hospitals", "Diagnostics", "Pharmacy Retail"],
    "Tyres": ["Tyres & Rubber"],
    "Metals & Mining": ["Steel", "Aluminium", "Zinc", "Mining"],
    "Textiles": ["Apparel Export", "Denim", "Spinning"],
    "Real Estate": ["Residential Real Estate", "Commercial REITs"],
    "Power": ["Power Generation", "Renewable Energy", "Transmission"],
    "Chemicals": ["Specialty Chemicals", "Agrochemicals", "Fluorochemicals"],
    "Defence": ["Aerospace", "Shipbuilding", "Defence Electronics"]
}

class UniverseManager:
    def __init__(self):
        self._universe: List[UniverseCompany] = []
        self._load_seed_universe()

    def _load_seed_universe(self):
        """Loads canonical universe seeded from verified Nifty data."""
        seed_path = Path(settings.STORAGE_DIR) / "universe.json"
        if not seed_path.exists():
            # Check mock folder for bootstrap seed
            alt_seed = Path(__file__).resolve().parent.parent.parent / "india-event-impact-mock" / "src" / "data" / "universe.json"
            if alt_seed.exists():
                seed_path = alt_seed

        if seed_path.exists():
            try:
                with open(seed_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._universe = [UniverseCompany(**item) for item in data]
                    return
            except Exception:
                pass

        # Fallback core Nifty 50 companies if file not yet copied
        self._universe = [
            UniverseCompany(symbol="RELIANCE", name="Reliance Industries", sector="Oil & Gas", market_cap_bucket="large", resilience_band="high", tags=["integrated_oil", "petchem", "retail", "telecom"]),
            UniverseCompany(symbol="TCS", name="Tata Consultancy Services", sector="IT Services", market_cap_bucket="large", resilience_band="high", tags=["export_oriented", "rupee_beneficiary", "low_debt"]),
            UniverseCompany(symbol="HDFCBANK", name="HDFC Bank", sector="Banking", market_cap_bucket="large", resilience_band="high", tags=["rate_sensitive", "credit_growth", "retail_credit"]),
            UniverseCompany(symbol="ASIANPAINT", name="Asian Paints", sector="Consumer Durables", market_cap_bucket="large", resilience_band="high", tags=["high_input_cost_sensitivity", "pricing_power"]),
            UniverseCompany(symbol="INDIGO", name="InterGlobe Aviation", sector="Aviation", market_cap_bucket="large", resilience_band="medium", tags=["high_atf_sensitivity", "currency_sensitive"]),
            UniverseCompany(symbol="INFY", name="Infosys", sector="IT Services", market_cap_bucket="large", resilience_band="high", tags=["export_oriented", "rupee_beneficiary"]),
            UniverseCompany(symbol="MARUTI", name="Maruti Suzuki", sector="Automobile", market_cap_bucket="large", resilience_band="medium", tags=["input_cost_sensitivity", "domestic_demand"]),
            UniverseCompany(symbol="SUNPHARMA", name="Sun Pharma", sector="Pharmaceuticals", market_cap_bucket="large", resilience_band="high", tags=["us_generics", "rupee_beneficiary"]),
            UniverseCompany(symbol="TATAMOTORS", name="Tata Motors", sector="Automobile", market_cap_bucket="large", resilience_band="medium", tags=["jlr_exposure", "ev_leader"]),
            UniverseCompany(symbol="HINDUNILVR", name="Hindustan Unilever", sector="Consumer Staples", market_cap_bucket="large", resilience_band="high", tags=["rural_demand", "pricing_power"]),
        ]

    def get_all(self) -> List[UniverseCompany]:
        return self._universe

    def get_all_companies(self) -> List[UniverseCompany]:
        return self._universe

    def get_company(self, symbol: str) -> Optional[UniverseCompany]:
        clean = symbol.upper().replace(".NS", "").strip()
        for c in self._universe:
            if c.symbol.upper() == clean:
                return c
        return None

    def get_by_symbol(self, symbol: str) -> Optional[UniverseCompany]:
        return self.get_company(symbol)

    def get_by_sector(self, sector: str) -> List[UniverseCompany]:
        sec_lower = sector.lower().strip()
        return [c for c in self._universe if c.sector.lower() == sec_lower]

    def search(self, query: str) -> List[UniverseCompany]:
        if not query or not query.strip():
            return self._universe
        q = query.lower().strip()
        return [
            c for c in self._universe
            if q in c.symbol.lower() or q in c.name.lower() or q in c.sector.lower()
        ]

universe_manager = UniverseManager()
