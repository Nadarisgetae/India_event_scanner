import asyncio
import time
import uuid
from datetime import datetime, timezone
from typing import Optional, Callable, Dict, Any, List

from app.models.enums import (
    ImpactBucket, ConfidenceLevel, TimeHorizon, DepthMode, Direction, PlanStance,
    EventType, Magnitude, Duration, Certainty
)
from app.models.event import ParsedEvent, ChannelImpact, MacroSnapshot
from app.models.profile import ResilienceSnapshot
from app.models.market_report import Scenario, AnalogueItem, ReportAppendix
from app.models.company_report import (
    CompanyReport, CompanySubject, CompanyDimensionImpact, ActionItem,
    KPITracker, TriggerPoint, StrategyPlan, TechnicalView, NewsSentimentItem,
    PeerComparison, MarketView
)
from app.engines.calibration import score_to_bucket, calculate_calibrated_company_score
from app.enrichment.resilience import calculate_resilience_breakdown
from app.enrichment.technicals import analyze_technicals_and_priced_in
from app.enrichment.sentiment import extract_sector_or_company_sentiment
from app.data.universe import UniverseManager
from app.data.macro import MacroManager
from app.data.prices import PriceManager
from app.data.fundamentals import FundamentalsManager
from app.data.news import NewsManager
from app.kb.kb_manager import KBManager
from app.gateway.chat_gateway import ChatGateway
from app.engines.monte_carlo import MonteCarloEngine
from app.gateway.multilingual import MultiLingualProcessor


class ModeBEngine:
    """
    Mode B: Company Deep-Dive Strategy Pipeline (Steps B1 to B8)
    Synthesizes an executive Defend & Capitalize strategy report for an Indian enterprise.
    """

    def __init__(
        self,
        universe_mgr: Optional[UniverseManager] = None,
        macro_mgr: Optional[MacroManager] = None,
        price_mgr: Optional[PriceManager] = None,
        fund_mgr: Optional[FundamentalsManager] = None,
        news_mgr: Optional[NewsManager] = None,
        kb_mgr: Optional[KBManager] = None,
        chat_gateway: Optional[ChatGateway] = None,
    ):
        self.universe_mgr = universe_mgr or UniverseManager()
        self.macro_mgr = macro_mgr or MacroManager()
        self.price_mgr = price_mgr or PriceManager()
        self.fund_mgr = fund_mgr or FundamentalsManager()
        self.news_mgr = news_mgr or NewsManager()
        self.kb_mgr = kb_mgr or KBManager()
        self.chat_gateway = chat_gateway or ChatGateway()
        self.mc_engine = MonteCarloEngine()

    async def run(
        self,
        symbol: str,
        event_text: str,
        category: Optional[str] = "macro",
        depth: DepthMode = DepthMode.STANDARD,
        stream_callback: Optional[Callable[[Dict[str, Any]], Any]] = None,
    ) -> CompanyReport:
        t0 = time.time()
        call_count = 0

        async def emit(step_id: str, label: str, status: str, summary: str, data: Optional[Dict[str, Any]] = None):
            if stream_callback:
                msg = {
                    "step_id": step_id,
                    "label": label,
                    "status": status,
                    "summary": summary,
                    "data": data or {},
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                res = stream_callback(msg)
                if asyncio.iscoroutine(res):
                    await res

        # ----------------------------------------------------
        # Step B1: Company Exposure Profile Loading
        # ----------------------------------------------------
        await emit("B1", "Company Exposure Profile Ingestion", "in_progress", f"Resolving metadata and sector priors for {symbol}...")
        comp_meta = self.universe_mgr.get_by_symbol(symbol)
        comp_name = comp_meta.name if comp_meta else symbol
        comp_sector = comp_meta.sector if comp_meta else "Industrial"
        comp_sub = (comp_meta.sub_industry if comp_meta and comp_meta.sub_industry else "General Manufacturing")

        profile = self.kb_mgr.build_company_exposure_profile(
            symbol=symbol,
            name=comp_name,
            sector=comp_sector,
            sub_industry=comp_sub
        )
        await emit("B1", "Company Exposure Profile Ingestion", "completed", f"Loaded profile for {comp_name} ({comp_sector})", {"profile": profile.model_dump()})

        # ----------------------------------------------------
        # Step B2: Live Fundamentals & Balance Sheet Ingestion
        # ----------------------------------------------------
        await emit("B2", "Live Fundamentals Ingestion", "in_progress", f"Querying balance sheet and leverage ratios for {symbol}...")
        fh = await self.fund_mgr.get_financial_health(symbol)
        profile.financial_health = fh
        await emit("B2", "Live Fundamentals Ingestion", "completed", f"Retrieved fundamentals: Net Debt/EBITDA={fh.net_debt_ebitda:.2f}x, OPM={fh.operating_margin:.1f}%, Int Cov={fh.interest_coverage:.1f}x", {"financials": fh.model_dump()})

        # ----------------------------------------------------
        # Step B3: Price Action, Technicals & Priced-in Scan
        # ----------------------------------------------------
        await emit("B3", "Price Action & Technicals Scan", "in_progress", f"Scanning price momentum and priced-in indicators for {symbol}...")
        tech_data = await analyze_technicals_and_priced_in(symbol, self.price_mgr)
        current_price = tech_data.get("current_price", 1000.0)
        priced_in_note = tech_data.get("priced_in_reason", "Price action reflects balanced baseline expectations.")
        await emit("B3", "Price Action & Technicals Scan", "completed", f"Technical scan complete: {tech_data.get('technical_posture', 'Neutral')} (RSI: {tech_data.get('rsi_14', 50):.1f})", {"technicals": tech_data})

        # ----------------------------------------------------
        # Step B4: Operational Transmission Channel Mapping
        # ----------------------------------------------------
        await emit("B4", "Operational Transmission Mapping", "in_progress", f"Mapping event transmission into {symbol}'s P&L dimensions...")
        eng_text, detected_lang, original_hindi = await MultiLingualProcessor.process_input_text(event_text, self.chat_gateway)
        event_lower = eng_text.lower()
        event_title = eng_text[:80].strip() if len(eng_text) > 80 else eng_text.strip()
        parsed_event = ParsedEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:6].upper()}",
            raw_input=eng_text,
            title=event_title,
            headline=event_title,
            category=category or "macro",
            event_type=EventType.COMMODITY_SHOCK if "crude" in event_lower or "oil" in event_lower else EventType.OTHER,
            magnitude=Magnitude.HIGH if any(w in event_lower for w in ["surge", "spike", "crash", "war"]) else Magnitude.MEDIUM,
            duration=Duration.MEDIUM,
            certainty=Certainty.HIGH,
            direction_for_india=Direction.NEGATIVE,
            summary=f"Event impact evaluated specifically for {comp_name} ({symbol}).",
            affected_channels=["input_costs", "currency_inr"],
            key_assets_impacted=[f"{symbol}.NS"],
            key_facts=[f"Target equity subject: {comp_name} ({symbol})"],
            unknowns=["Exact forward pass-through pricing schedule"],
            original_language=detected_lang,
            original_text=original_hindi
        )

        # Baseline sector sensitivity
        sens_map = self.kb_mgr.get_sector_sensitivities(comp_sector)
        primary_sens = -3.0
        for ch_key, info in sens_map.items():
            primary_sens = info["sensitivity"]
            break

        # Calculate company impact score
        comp_score = calculate_calibrated_company_score(
            sector_score=primary_sens,
            resilience_score=fh.resilience_score,
            net_debt_ebitda=fh.net_debt_ebitda,
            pricing_power=profile.pricing_power
        )

        dimensions = [
            CompanyDimensionImpact(
                dimension="Gross Margin & Input Cost Drag",
                impact=round(max(min(comp_score * 0.6, 3.0), -3.0), 1),
                explanation=f"Direct raw material cost transmission in {comp_sector}. Pass-through subject to competitive intensity.",
                evidence=f"Baseline sector sensitivity of {primary_sens:+0.1f} against key input channels.",
                magnitude_estimate=f"Estimated {abs(comp_score)*30:.0f} to {abs(comp_score)*50:.0f} bps margin headwind",
                timing=TimeHorizon.IMMEDIATE,
                confidence=ConfidenceLevel.HIGH
            ),
            CompanyDimensionImpact(
                dimension="Revenue & End-User Demand",
                impact=round(max(min(comp_score * 0.4, 3.0), -3.0), 1),
                explanation="End-market consumption elasticity and volume growth across distribution touchpoints.",
                evidence=f"Dominant market position in {comp_sub} supports volume resilience.",
                magnitude_estimate="Moderate volume sensitivity",
                timing=TimeHorizon.SHORT_TERM,
                confidence=ConfidenceLevel.MEDIUM
            ),
            CompanyDimensionImpact(
                dimension="Working Capital & Liquidity",
                impact=round(max(min(comp_score * 0.3, 3.0), -3.0), 1),
                explanation=f"Inventory holding cost and credit terms. Balance sheet leverage at {fh.net_debt_ebitda:.2f}x.",
                evidence=f"Interest coverage of {fh.interest_coverage:.1f}x provides solvency cushion.",
                magnitude_estimate=f"Working capital cycle variance +/- 10 days",
                timing=TimeHorizon.SHORT_TERM,
                confidence=ConfidenceLevel.HIGH
            )
        ]
        await emit("B4", "Operational Transmission Mapping", "completed", f"Mapped {len(dimensions)} core operational dimensions", {"dimensions": [d.model_dump() for d in dimensions]})

        # ----------------------------------------------------
        # Step B5: Resilience Score & Solvency Stress-Testing
        # ----------------------------------------------------
        await emit("B5", "Resilience & Solvency Stress-Testing", "in_progress", "Calculating explainable resilience breakdown and capital buffer...")
        res_breakdown = calculate_resilience_breakdown(fh)
        r_score = int(res_breakdown["resilience_score"])
        r_band = "high" if r_score >= 70 else ("medium" if r_score >= 50 else "low")
        res_snapshot = ResilienceSnapshot(
            score=r_score,
            band=r_band,
            strengths=res_breakdown["strengths"],
            weaknesses=res_breakdown["vulnerabilities"],
            ratios={
                "Net Debt/EBITDA": f"{fh.net_debt_ebitda:.2f}x",
                "Interest Coverage": f"{fh.interest_coverage:.1f}x",
                "Operating Margin": f"{fh.operating_margin:.1f}%",
                "ROE": f"{fh.roe:.1f}%"
            },
            resilience_score=res_breakdown["resilience_score"],
            financial_health_score=res_breakdown["resilience_score"],
            pricing_power_rating=profile.pricing_power,
            market_position="Leader / Tier-1 Established Franchise",
            key_strengths=res_breakdown["strengths"],
            key_vulnerabilities=res_breakdown["vulnerabilities"]
        )
        await emit("B5", "Resilience & Solvency Stress-Testing", "completed", f"Resilience score: {res_snapshot.resilience_score}/100 ({res_breakdown['grade']})", {"resilience": res_breakdown})

        # ----------------------------------------------------
        # Step B6: Defend Strategic Levers Formulation
        # ----------------------------------------------------
        await emit("B6", "Defend Strategic Levers Formulation", "in_progress", "Selecting and tailoring defensive levers from KB library...")
        defend_raw = self.kb_mgr.get_levers(strategy_type="defend")
        immediate_actions: List[ActionItem] = []
        short_term_actions: List[ActionItem] = []

        # Tailor top 2 for immediate (0-30d)
        for d_item in defend_raw[:2]:
            immediate_actions.append(ActionItem(
                action=f"Execute {d_item['name']}",
                lever=d_item["id"],
                why=d_item["why"],
                owner=d_item["owner"],
                cost_effort=d_item["cost_effort"],
                expected_effect=f"Preserves EBITDA margin by mitigating initial channel shock.",
                risk="Short-term distributor friction or contractual lock-in."
            ))

        # Tailor next 2 for short term (1-6m)
        for d_item in defend_raw[2:4]:
            short_term_actions.append(ActionItem(
                action=f"Deploy {d_item['name']}",
                lever=d_item["id"],
                why=d_item["why"],
                owner=d_item["owner"],
                cost_effort=d_item["cost_effort"],
                expected_effect="Protects liquidity runway and lowers fixed overheads.",
                risk="Requires inter-departmental coordination."
            ))
        await emit("B6", "Defend Strategic Levers Formulation", "completed", f"Formulated {len(immediate_actions) + len(short_term_actions)} defensive initiatives")

        # ----------------------------------------------------
        # Step B7: Capitalize Strategic Levers Formulation
        # ----------------------------------------------------
        await emit("B7", "Capitalize Strategic Levers Formulation", "in_progress", "Formulating proactive growth and market share capture levers...")
        cap_raw = self.kb_mgr.get_levers(strategy_type="capitalize")
        long_term_actions: List[ActionItem] = []

        for c_item in cap_raw[:3]:
            long_term_actions.append(ActionItem(
                action=f"Initiate {c_item['name']}",
                lever=c_item["id"],
                why=c_item["why"],
                owner=c_item["owner"],
                cost_effort=c_item["cost_effort"],
                expected_effect="Captures incremental profitable market share from stressed peers.",
                risk="Requires disciplined capital execution and milestone monitoring."
            ))

        kpis = [
            KPITracker(kpi="Consolidated Gross Margin", target="> Maintain within -50 bps of baseline", frequency="Monthly"),
            KPITracker(kpi="Cash Flow from Operations Conversion", target="> 80% of reported EBITDA", frequency="Quarterly"),
            KPITracker(kpi="Net Debt to EBITDA Ratio", target=f"< {max(fh.net_debt_ebitda, 1.5):.2f}x", frequency="Quarterly")
        ]

        triggers = [
            TriggerPoint(condition="Raw material or fuel prices soften by > 8%", then_switch_to="Aggressive volume acceleration and retail discounting"),
            TriggerPoint(condition="Secondary supplier defaults or announces force majeure", then_switch_to="Emergency activation of dual-sourcing domestic suppliers")
        ]

        stance = PlanStance.DEFEND if comp_score < -1.5 else (PlanStance.CAPITALIZE if comp_score > 1.5 else PlanStance.BALANCED)
        strategy_plan = StrategyPlan(
            stance=stance,
            immediate_0_30d=immediate_actions,
            short_term_1_6m=short_term_actions,
            long_term_6_24m=long_term_actions,
            kpis_to_track=kpis,
            trigger_points=triggers,
            plan_risks=["Prolonged macroeconomic stagnation", "Foreign exchange volatility exceeding hedging bands"],
            assumptions=["Operating supply lines remain functional without extended plant shutdowns", "Working capital lines remain unencumbered"]
        )
        await emit("B7", "Capitalize Strategic Levers Formulation", "completed", f"Synthesized strategy plan: {stance.value.upper()} stance with {len(kpis)} tracking KPIs")

        # ----------------------------------------------------
        # Step B8: Executive Strategy Report Assembly
        # ----------------------------------------------------
        await emit("B8", "Executive Strategy Report Assembly", "in_progress", f"Assembling final executive company report for {symbol}...")
        macro_snap = await self.macro_mgr.get_latest_macro_snapshot()

        # Sector peers comparison
        peers: List[PeerComparison] = []
        all_comps = self.universe_mgr.get_by_sector(comp_sector)
        for p in all_comps:
            if p.symbol != symbol:
                p_score = calculate_calibrated_company_score(primary_sens, 60.0, 1.5, "medium")
                peers.append(PeerComparison(
                    symbol=p.symbol,
                    name=p.name,
                    impact_score=p_score,
                    bucket=score_to_bucket(p_score),
                    better_than_subject=(p_score > comp_score)
                ))
            if len(peers) >= 3:
                break

        # News sentiment
        sentiment_data = await extract_sector_or_company_sentiment(comp_name, self.news_mgr, limit=3)
        news_items = [
            NewsSentimentItem(
                headline=hl,
                source="Indian Financial Media",
                date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                sentiment="neutral",
                materiality="medium"
            )
            for hl in sentiment_data.get("top_headlines", [])
        ]

        market_view = MarketView(
            technicals=[
                TechnicalView(
                    period="1D",
                    chart_data=[],
                    bias=tech_data.get("technical_posture", "Neutral").lower(),
                    key_levels={"dma_50": tech_data.get("dma_50") or current_price, "dma_200": tech_data.get("dma_200") or current_price}
                )
            ],
            priced_in_note=priced_in_note,
            news_sentiment=news_items
        )

        channels = [
            ChannelImpact(
                channel_id="input_costs",
                name="Input Costs",
                direction=Direction.NEGATIVE if comp_score < 0 else Direction.POSITIVE,
                intensity=comp_score,
                speed="immediate",
                directness="direct_1st_order",
                narrative=f"Direct exposure to supply chain and raw materials for {comp_sector}."
            )
        ]

        scenarios = [
            Scenario(
                name="Aggressive Mitigation",
                narrative="Management rapidly passes through 80%+ of cost increases; market valuation holds.",
                triggers=["Timely price hike announcement across distributor network"],
                bucket_shifts=[{"from": "Negative Moderate", "to": "Neutral"}]
            ),
            Scenario(
                name="Protracted Margin Squeeze",
                narrative="Intense peer price-cutting prevents pricing pass-through, eroding operating margins.",
                triggers=["Competitor initiates discount promotions"],
                bucket_shifts=[{"from": "Negative Moderate", "to": "Negative High"}]
            )
        ]

        analogues = [
            AnalogueItem(
                event="FY22 Global Commodity Inflation Wave",
                date="2022-03-15",
                outcome="Companies with superior pricing power protected gross margins within 2 quarters."
            )
        ]

        # Parametric Monte Carlo Margin & EBITDA Simulation (10,000 iterations)
        mc_sim = self.mc_engine.simulate_company_shock(
            symbol=symbol,
            financial_health=fh,
            profile=profile,
            channels=channels,
            simulations_count=10000
        )

        appendix = ReportAppendix(
            models_used=["openrouter/free-tier", "deterministic-company-calibrator"],
            prompt_versions=["v2.4-company-b"],
            call_count=call_count,
            generation_time_seconds=round(time.time() - t0, 2),
            depth=depth,
            generated_at=datetime.now(timezone.utc).isoformat()
        )

        report = CompanyReport(
            id=f"CR-{uuid.uuid4().hex[:8]}",
            type="company",
            company=CompanySubject(
                symbol=symbol,
                name=comp_name,
                sector=comp_sector,
                price=current_price,
                impact_score=comp_score,
                business_summary=f"Leading Indian company in {comp_sector} ({comp_sub})."
            ),
            event=parsed_event,
            channels=channels,
            dimensions=dimensions,
            resilience=res_snapshot,
            market_view=market_view,
            macro_backdrop=macro_snap,
            peers=peers,
            strategy=strategy_plan,
            scenarios=scenarios,
            analogues=analogues,
            limitations=[
                "Sensitivity estimates rely on trailing 12-month balance sheet disclosures.",
                "Unannounced intra-quarter pricing hikes or hedging gains may dampen modeled impact."
            ],
            appendix=appendix,
            monte_carlo=mc_sim
        )

        await emit("B8", "Executive Strategy Report Assembly", "completed", f"Company Report {report.id} ready", {"report_id": report.id})
        return report
