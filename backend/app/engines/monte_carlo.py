import numpy as np
from typing import List, Dict, Any, Optional
from app.models.company_report import MonteCarloSimulation, MonteCarloBin
from app.models.profile import FinancialHealth, CompanyExposureProfile
from app.models.event import ChannelImpact, Direction


class MonteCarloEngine:
    """
    Parametric Monte Carlo Simulator for corporate earnings resilience.
    Simulates 10,000 paths of commodity price, FX, and demand shocks to project
    the distribution of EBITDA contraction, Value-at-Risk (VaR), and debt covenant breach risk.
    """

    def simulate_company_shock(
        self,
        symbol: str,
        financial_health: Optional[FinancialHealth] = None,
        profile: Optional[CompanyExposureProfile] = None,
        channels: Optional[List[ChannelImpact]] = None,
        simulations_count: int = 10000,
    ) -> MonteCarloSimulation:
        np.random.seed(42)  # Deterministic seed for reproducible testing

        # 1. Calibrate baseline parameters
        # Default representative baseline for Indian large cap if specific statement missing
        base_revenue = 25000.0  # ₹ Cr
        operating_margin = 0.18
        debt_to_equity = 0.45
        current_ratio = 1.6

        if financial_health:
            if getattr(financial_health, "operating_margin", None) is not None and financial_health.operating_margin > 0:
                operating_margin = financial_health.operating_margin / 100.0 if financial_health.operating_margin > 1.0 else financial_health.operating_margin
            if getattr(financial_health, "net_debt_ebitda", None) is not None:
                debt_to_equity = max(0.1, financial_health.net_debt_ebitda * 0.4)

        base_ebitda = base_revenue * operating_margin
        base_cogs = base_revenue * 0.58
        base_opex = base_revenue - base_cogs - base_ebitda
        total_debt = base_revenue * 0.35 * debt_to_equity
        cash_reserves = total_debt * (0.6 / max(0.5, debt_to_equity))
        annual_interest_expense = max(total_debt * 0.085, 50.0)  # ~8.5% cost of debt

        # 2. Determine shock parameters based on active macro channels
        comm_shock_mean = 0.15
        comm_shock_std = 0.06
        fx_shock_mean = 0.03
        fx_shock_std = 0.02
        demand_shock_mean = -0.02
        demand_shock_std = 0.03

        if channels:
            for ch in channels:
                if "crude" in ch.channel_id.lower() or "commodity" in ch.channel_id.lower():
                    factor = ch.severity * (1.0 if ch.direction == Direction.UP else -1.0)
                    comm_shock_mean = factor * 0.22
                    comm_shock_std = abs(factor) * 0.08 + 0.03
                elif "rupee" in ch.channel_id.lower() or "fx" in ch.channel_id.lower():
                    fx_shock_mean = ch.severity * 0.06
                    fx_shock_std = 0.025
                elif "inflation" in ch.channel_id.lower() or "rates" in ch.channel_id.lower():
                    demand_shock_mean = -0.04 * ch.severity

        # 3. Company elasticity from profile
        pricing_power = 0.45  # Default ability to pass through 45% of cost increase
        import_share = 0.40   # 40% of COGS imported/dollar-linked

        if profile:
            exposures = getattr(profile, "exposures", []) or []
            for exp in exposures:
                ch_name = (getattr(exp, "channel_name", "") or "").lower()
                if "cost" in ch_name or "crude" in ch_name:
                    sens = abs(getattr(exp, "historical_sensitivity", 2.0))
                    import_share = min(0.85, max(0.15, sens * 0.15))

        # 4. Generate 10,000 vectorized paths using NumPy
        comm_shocks = np.random.normal(comm_shock_mean, comm_shock_std, size=simulations_count)
        fx_shocks = np.random.normal(fx_shock_mean, fx_shock_std, size=simulations_count)
        demand_shocks = np.random.normal(demand_shock_mean, demand_shock_std, size=simulations_count)

        # Vectorized COGS shock
        shocked_cogs = base_cogs * (1.0 + (import_share * comm_shocks) + (0.25 * fx_shocks))
        cost_inflation = (shocked_cogs - base_cogs) / base_cogs

        # Revenue with price pass-through and volume elasticity
        shocked_revenue = base_revenue * (1.0 + (pricing_power * cost_inflation) + demand_shocks)

        # Shocked EBITDA and Margins
        shocked_ebitda = shocked_revenue - shocked_cogs - base_opex
        shocked_margin_pct = (shocked_ebitda / np.maximum(shocked_revenue, 1.0)) * 100.0

        # Debt Service Coverage (DSCR / ICR)
        interest_coverage = shocked_ebitda / annual_interest_expense

        # 5. Extract summary metrics
        expected_ebitda = float(np.mean(shocked_ebitda))
        expected_margin = float(np.mean(shocked_margin_pct))
        base_margin = (base_ebitda / base_revenue) * 100.0
        margin_contraction_bps = int(round((base_margin - expected_margin) * 100.0))

        # VaR percentiles
        ebitda_p5 = float(np.percentile(shocked_ebitda, 5))
        ebitda_p1 = float(np.percentile(shocked_ebitda, 1))

        var_95_pct = float(max(0.0, (base_ebitda - ebitda_p5) / base_ebitda * 100.0))
        var_99_pct = float(max(0.0, (base_ebitda - ebitda_p1) / base_ebitda * 100.0))

        prob_negative_ebitda = float(np.mean(shocked_ebitda < 0) * 100.0)
        prob_covenant_breach = float(np.mean(interest_coverage < 1.5) * 100.0)

        ic_base = base_ebitda / annual_interest_expense
        ic_p5 = max(0.1, ebitda_p5 / annual_interest_expense)

        monthly_opex_burn = (base_opex + annual_interest_expense) / 12.0
        cash_runway_p5 = round(float(cash_reserves / max(1.0, monthly_opex_burn)), 1)

        # 6. Build 12 histogram distribution bins for Recharts
        counts, bin_edges = np.histogram(shocked_margin_pct, bins=12)
        distribution_bins: List[MonteCarloBin] = []
        for i in range(len(counts)):
            low = bin_edges[i]
            high = bin_edges[i + 1]
            center = (low + high) / 2.0
            prob = float(counts[i] / simulations_count * 100.0)
            distribution_bins.append(MonteCarloBin(
                bin_label=f"{round(low, 1)}% - {round(high, 1)}%",
                bin_center=round(center, 2),
                count=int(counts[i]),
                probability_pct=round(prob, 2)
            ))

        # 7. Interpretation summary
        interpretation = (
            f"Under 10,000 simulated shock paths, {symbol}'s expected EBITDA margin contracts by "
            f"{margin_contraction_bps} bps (from {round(base_margin, 1)}% to {round(expected_margin, 1)}%). "
            f"Value-at-Risk at 95% confidence indicates a maximum EBITDA drawdown of {round(var_95_pct, 1)}% "
            f"(₹{round(base_ebitda - ebitda_p5, 1)} Cr). Probability of debt covenant breach (ICR < 1.5x) is "
            f"{round(prob_covenant_breach, 1)}% with an estimated {cash_runway_p5} months of liquidity buffer."
        )

        return MonteCarloSimulation(
            simulations_count=simulations_count,
            base_ebitda_cr=round(base_ebitda, 1),
            expected_ebitda_cr=round(expected_ebitda, 1),
            base_margin_pct=round(base_margin, 2),
            expected_margin_pct=round(expected_margin, 2),
            margin_contraction_bps=margin_contraction_bps,
            ebitda_drawdown_p5_cr=round(ebitda_p5, 1),
            ebitda_drawdown_p1_cr=round(ebitda_p1, 1),
            var_95_drawdown_pct=round(var_95_pct, 2),
            var_99_drawdown_pct=round(var_99_pct, 2),
            prob_negative_ebitda_pct=round(prob_negative_ebitda, 2),
            prob_covenant_breach_pct=round(prob_covenant_breach, 2),
            interest_coverage_base=round(ic_base, 2),
            interest_coverage_p5=round(ic_p5, 2),
            cash_runway_months_p5=cash_runway_p5,
            distribution_bins=distribution_bins,
            summary_interpretation=interpretation
        )
