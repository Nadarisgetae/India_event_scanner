import csv
import io
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.models.enums import ImpactBucket, Direction, TimeHorizon, DepthMode
from app.models.portfolio import (
    PortfolioHolding, HoldingImpact, PortfolioStressResult, PortfolioStressRequest
)
from app.models.company_report import ActionItem
from app.data.universe import UniverseManager
from app.data.prices import PriceManager
from app.kb.kb_manager import KBManager
from app.engines.mode_a import ModeAEngine
from app.engines.calibration import score_to_bucket


class PortfolioStressEngine:
    """
    Stress-testing engine that simulates the net financial and valuation impact
    of a macro/geopolitical shock on a user's multi-asset Indian equity portfolio.
    """

    def __init__(
        self,
        universe_mgr: Optional[UniverseManager] = None,
        price_mgr: Optional[PriceManager] = None,
        kb_mgr: Optional[KBManager] = None,
        mode_a_engine: Optional[ModeAEngine] = None,
    ):
        self.universe_mgr = universe_mgr or UniverseManager()
        self.price_mgr = price_mgr or PriceManager()
        self.kb_mgr = kb_mgr or KBManager()
        self.mode_a = mode_a_engine or ModeAEngine(
            universe_mgr=self.universe_mgr,
            price_mgr=self.price_mgr,
            kb_mgr=self.kb_mgr
        )

    def parse_csv_holdings(self, csv_text: str) -> List[PortfolioHolding]:
        """
        Parses brokerage CSV exports from Zerodha Kite, Groww, or generic CSV formats.
        """
        holdings = []
        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        if not reader.fieldnames:
            return holdings

        # Map header variations
        cols = {c.strip().lower(): c for c in reader.fieldnames}
        
        sym_col = (
            cols.get("symbol") or cols.get("instrument") or cols.get("stock name")
            or cols.get("tradingsymbol") or cols.get("stock")
        )
        qty_col = (
            cols.get("qty") or cols.get("quantity") or cols.get("shares")
            or cols.get("qty.") or cols.get("holding")
        )
        buy_col = (
            cols.get("avg. cost") or cols.get("avg cost") or cols.get("buy price")
            or cols.get("average price") or cols.get("avg. price") or cols.get("buy_price")
        )

        for row in reader:
            if not sym_col or not row.get(sym_col):
                continue
            
            raw_sym = row[sym_col].strip().upper()
            # Clean ticker if formatted as RELIANCE-EQ or NSE:RELIANCE
            clean_sym = raw_sym.replace("-EQ", "").replace("NSE:", "").replace("BSE:", "").strip()
            
            # Parse quantity
            try:
                qty = float(str(row.get(qty_col, "1")).replace(",", "").strip())
            except (ValueError, TypeError):
                qty = 1.0

            # Parse buy price
            buy_price = None
            if buy_col and row.get(buy_col):
                try:
                    buy_price = float(str(row[buy_col]).replace(",", "").replace("₹", "").strip())
                except (ValueError, TypeError):
                    buy_price = None

            if clean_sym:
                holdings.append(PortfolioHolding(
                    symbol=clean_sym,
                    quantity=qty,
                    buy_price=buy_price
                ))

        return holdings

    async def stress_test_portfolio(
        self,
        request: PortfolioStressRequest,
    ) -> PortfolioStressResult:
        """
        Simulates event impact across each holding and aggregates portfolio metrics.
        """
        holdings = request.holdings
        if not holdings:
            return PortfolioStressResult(
                portfolio_name=request.portfolio_name or "Empty Portfolio",
                total_holdings_count=0,
                total_portfolio_value_inr=0.0,
                net_portfolio_impact_pct=0.0,
                net_portfolio_pnl_inr=0.0,
                event_headline=request.event_text,
            )

        # 1. Resolve live prices and fill sectors
        total_val = 0.0
        enriched_holdings = []
        for h in holdings:
            sym = h.symbol.upper()
            co_info = self.universe_mgr.get_by_symbol(sym)
            sector = co_info.sector if co_info else (h.sector or "Diversified")
            
            # Fetch current quote
            quote = await self.price_mgr.get_quote(sym)
            curr_price = h.current_price or (quote.current_price if quote and quote.current_price > 0 else (h.buy_price or 1000.0))
            curr_val = h.quantity * curr_price
            total_val += curr_val

            enriched_holdings.append({
                "symbol": sym,
                "company_name": co_info.name if co_info else sym,
                "sector": sector,
                "quantity": h.quantity,
                "buy_price": h.buy_price,
                "current_price": curr_price,
                "current_val": curr_val,
            })

        if total_val <= 0:
            total_val = 1.0

        # 2. Identify active channels from shock event
        event_lower = request.event_text.lower()
        channel_weights: Dict[str, float] = {}
        confidence = 0.85

        if any(w in event_lower for w in ["crude", "oil", "brent", "petrol", "diesel"]):
            factor = -1.0 if any(w in event_lower for w in ["spike", "surge", "jump", "high", "attack", "war", "blockade"]) else 1.0
            channel_weights["crude_oil"] = factor
        if any(w in event_lower for w in ["rate", "rbi", "repo", "inflation", "cpi", "fed"]):
            factor = -1.0 if any(w in event_lower for w in ["hike", "raise", "tighten", "spike"]) else 1.0
            channel_weights["interest_rates"] = factor
        if any(w in event_lower for w in ["tariff", "customs", "duty", "trade war", "wto", "reciprocal"]):
            channel_weights["trade_tariffs"] = -1.0
        if any(w in event_lower for w in ["rupee", "usd", "inr", "depreciation", "plunge", "forex"]):
            channel_weights["currency_inr"] = -1.0

        if not channel_weights:
            channel_weights["input_costs"] = -0.6
            confidence = 0.70

        # 3. Score each holding
        holdings_impact: List[HoldingImpact] = []
        net_impact_weighted = 0.0
        bucket_counts: Dict[str, int] = {b.value: 0 for b in ImpactBucket}
        net_channel_exposure: Dict[str, float] = {}

        for eh in enriched_holdings:
            sym = eh["symbol"]
            sector = eh["sector"]
            curr_val = eh["current_val"]
            weight_pct = (curr_val / total_val) * 100.0

            # Get sector sensitivities
            sens_map = self.kb_mgr.get_sector_sensitivities(sector)

            # Calculate raw impact score from channels
            raw_score = 0.0
            primary_ch = "General Macro"
            max_abs_impact = 0.0

            for ch_id, ch_wt in channel_weights.items():
                sens_info = sens_map.get(ch_id, {"sensitivity": 0.0})
                sens = sens_info.get("sensitivity", 0.0) if isinstance(sens_info, dict) else 0.0
                channel_delta = sens * ch_wt
                raw_score += channel_delta

                if abs(channel_delta) > max_abs_impact:
                    max_abs_impact = abs(channel_delta)
                    primary_ch = ch_id

                # Aggregate portfolio channel exposure
                net_channel_exposure[ch_id] = net_channel_exposure.get(ch_id, 0.0) + (weight_pct / 100.0) * sens

            # Scale to expected abnormal return percentage [-15% to +15%]
            pred_return_pct = max(-15.0, min(15.0, raw_score * 3.5))
            est_pnl = curr_val * (pred_return_pct / 100.0)
            bucket = score_to_bucket(raw_score)
            bucket_counts[bucket.value] += 1

            net_impact_weighted += (weight_pct / 100.0) * pred_return_pct

            holdings_impact.append(HoldingImpact(
                symbol=sym,
                company_name=eh["company_name"],
                sector=sector,
                quantity=eh["quantity"],
                weight_pct=round(weight_pct, 2),
                current_value=round(curr_val, 2),
                bucket=bucket,
                predicted_abnormal_return_pct=round(pred_return_pct, 2),
                estimated_pnl_inr=round(est_pnl, 2),
                confidence=round(confidence, 2),
                primary_channel=primary_ch,
                rationale=f"Affected through {primary_ch} with sector sensitivity to {sector}."
            ))

        # 4. Sort detractors and beneficiaries
        holdings_sorted = sorted(holdings_impact, key=lambda x: x.predicted_abnormal_return_pct)
        top_detractors = [h for h in holdings_sorted if h.predicted_abnormal_return_pct < 0][:5]
        top_beneficiaries = [h for h in reversed(holdings_sorted) if h.predicted_abnormal_return_pct > 0][:5]

        # 5. Determine recommended portfolio hedges from lever library
        raw_levers = self.kb_mgr.get_levers(strategy_type="defend")
        hedges: List[ActionItem] = []
        for lv in raw_levers[:3]:
            hedges.append(ActionItem(
                action=lv.get("name", "Defensive Hedging"),
                lever=lv.get("code", "DEF-01"),
                why=lv.get("mechanism", "Portfolio protection against macro shock"),
                owner="Portfolio Manager / Treasury",
                cost_effort="medium",
                expected_effect=lv.get("mechanism", "Mitigate downside portfolio drawdown"),
                risk="Opportunity cost if market rebounds quickly"
            ))

        net_pnl_inr = sum(h.estimated_pnl_inr for h in holdings_impact)

        return PortfolioStressResult(
            portfolio_name=request.portfolio_name or "Indian Equity Portfolio",
            total_holdings_count=len(holdings_impact),
            total_portfolio_value_inr=round(total_val, 2),
            net_portfolio_impact_pct=round(net_impact_weighted, 2),
            net_portfolio_pnl_inr=round(net_pnl_inr, 2),
            event_headline=request.event_text,
            channel_exposure_breakdown={k: round(v, 3) for k, v in net_channel_exposure.items()},
            bucket_distribution=bucket_counts,
            holdings_impact=holdings_impact,
            top_detractors=top_detractors,
            top_beneficiaries=top_beneficiaries,
            hedging_recommendations=hedges,
            created_at=datetime.now(timezone.utc).isoformat()
        )
