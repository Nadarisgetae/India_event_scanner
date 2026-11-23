import csv
import yaml
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.models.profile import CompanyExposureProfile, TransmissionExposure, FinancialHealth
from app.models.enums import Direction, SpeedOfTransmission, DirectnessOfImpact


class KBManager:
    """
    Manages Knowledge Base resources:
    - 12 Macro Transmission Channels (channels.yaml)
    - 25-Sector Sensitivity Prior Matrix (sector_matrix.csv)
    - Strategic Response Levers (lever_library.yaml)
    - 40 Historical Indian Macro Events (past_events.csv)
    """

    def __init__(self, kb_dir: Optional[Path] = None):
        self.kb_dir = kb_dir or Path(__file__).resolve().parent
        self._channels: List[Dict[str, Any]] = []
        self._sector_matrix: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self._defend_levers: List[Dict[str, Any]] = []
        self._capitalize_levers: List[Dict[str, Any]] = []
        self._past_events: List[Dict[str, Any]] = []

        self._load_all()

    def _load_all(self):
        self._load_channels()
        self._load_sector_matrix()
        self._load_levers()
        self._load_past_events()

    def _load_channels(self):
        ch_file = self.kb_dir / "channels.yaml"
        if ch_file.exists():
            with open(ch_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
                self._channels = data.get("channels", [])

    def _load_sector_matrix(self):
        sm_file = self.kb_dir / "sector_matrix.csv"
        if sm_file.exists():
            with open(sm_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    sec = row["sector"].strip()
                    ch = row["channel"].strip()
                    try:
                        sens = float(row["sensitivity"].strip())
                    except ValueError:
                        sens = 0.0
                    reasoning = row.get("reasoning", "").strip()

                    if sec not in self._sector_matrix:
                        self._sector_matrix[sec] = {}
                    self._sector_matrix[sec][ch] = {
                        "sensitivity": sens,
                        "reasoning": reasoning
                    }

    def _load_levers(self):
        lv_file = self.kb_dir / "lever_library.yaml"
        if lv_file.exists():
            with open(lv_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}
                self._defend_levers = data.get("defend_levers", [])
                self._capitalize_levers = data.get("capitalize_levers", [])

    def _load_past_events(self):
        pe_file = self.kb_dir / "past_events.csv"
        if pe_file.exists():
            with open(pe_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self._past_events.append({
                        "date": row.get("date", "").strip(),
                        "title": row.get("title", "").strip(),
                        "event_type": row.get("event_type", "").strip(),
                        "magnitude": row.get("magnitude", "").strip(),
                        "benchmark_outcome": row.get("benchmark_outcome", "").strip()
                    })

    # Query APIs
    def get_channels(self) -> List[Dict[str, Any]]:
        return self._channels

    def get_channel_by_id(self, channel_id: str) -> Optional[Dict[str, Any]]:
        for ch in self._channels:
            if ch.get("id") == channel_id:
                return ch
        return None

    def get_sector_sensitivities(self, sector: str) -> Dict[str, Dict[str, Any]]:
        # Match sector case-insensitively or return nearest
        if sector in self._sector_matrix:
            return self._sector_matrix[sector]
        for s_name, mapping in self._sector_matrix.items():
            if s_name.lower() == sector.lower():
                return mapping
        return {}

    def get_all_sector_sensitivities(self) -> Dict[str, Dict[str, Dict[str, Any]]]:
        return self._sector_matrix

    def get_past_events(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        if not category:
            return self._past_events
        return [e for e in self._past_events if category.lower() in e.get("event_type", "").lower()]

    def find_similar_past_events(self, event_title: str, event_type: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Heuristic search for historically comparable events."""
        event_lower = event_title.lower()
        matched = []

        # High priority: matching words in title
        for pe in self._past_events:
            score = 0
            pe_title = pe["title"].lower()
            pe_type = pe["event_type"].lower()

            if pe_type == event_type.lower():
                score += 3
            # Check key tokens
            for token in event_lower.split():
                if len(token) > 3 and token in pe_title:
                    score += 2

            if score > 0:
                matched.append((score, pe))

        matched.sort(key=lambda x: x[0], reverse=True)
        results = [m[1] for m in matched[:limit]]
        if not results:
            results = self._past_events[:limit]
        return results

    def get_levers(self, strategy_type: Optional[str] = None, channel: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns defend or capitalize levers."""
        if strategy_type == "defend":
            return self._defend_levers
        elif strategy_type == "capitalize":
            return self._capitalize_levers
        return self._defend_levers + self._capitalize_levers

    def build_company_exposure_profile(
        self,
        symbol: str,
        name: str,
        sector: str,
        sub_industry: Optional[str] = "",
        financial_health: Optional[FinancialHealth] = None,
        pricing_power: str = "medium"
    ) -> CompanyExposureProfile:
        """
        Synthesizes an exposure profile using sector sensitivity priors and financial health.
        """
        sub_industry = sub_industry or ""
        sens_map = self.get_sector_sensitivities(sector)
        exposures: List[TransmissionExposure] = []

        for ch_id, ch_info in sens_map.items():
            sens_val = ch_info["sensitivity"]
            reasoning = ch_info["reasoning"]

            if sens_val > 0:
                dir_enum = Direction.POSITIVE
            elif sens_val < 0:
                dir_enum = Direction.NEGATIVE
            else:
                dir_enum = Direction.NEUTRAL

            abs_val = abs(sens_val)
            speed = SpeedOfTransmission.IMMEDIATE if abs_val >= 4 else SpeedOfTransmission.MEDIUM_TERM
            directness = DirectnessOfImpact.DIRECT_1ST_ORDER if abs_val >= 4 else DirectnessOfImpact.INDIRECT_2ND_ORDER

            exposures.append(TransmissionExposure(
                channel_id=ch_id,
                channel_name=ch_id.replace("_", " ").title(),
                direction=dir_enum,
                historical_sensitivity=sens_val,
                speed=speed,
                directness=directness,
                description=reasoning
            ))

        # Default financial health if none provided
        fh = financial_health or FinancialHealth(
            resilience_score=60.0,
            net_debt_ebitda=1.2,
            interest_coverage=5.5,
            operating_margin=18.0,
            roe=16.0,
            cash_flow_from_ops_cr=2500.0,
            capex_to_operating_cf=40.0
        )

        return CompanyExposureProfile(
            symbol=symbol,
            company_name=name,
            sector=sector,
            sub_industry=sub_industry,
            pricing_power=pricing_power,
            exposures=exposures,
            financial_health=fh,
            strategic_posture="resilient" if fh.resilience_score >= 60 else "vulnerable"
        )
