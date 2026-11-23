from typing import Dict, Any, List
from app.models.profile import FinancialHealth


def calculate_resilience_breakdown(fh: FinancialHealth) -> Dict[str, Any]:
    """
    Computes a deterministic, explainable 0-100 Resilience Score from balance sheet metrics.
    Weights:
      - Leverage (Net Debt / EBITDA): 25 pts
      - Solvency (Interest Coverage): 20 pts
      - Operating Margin Cushion: 20 pts
      - Cash Flow Coverage (CFO / Capex): 20 pts
      - Return on Equity (ROE): 15 pts
    """
    strengths: List[str] = []
    vulnerabilities: List[str] = []

    # 1. Leverage score (max 25)
    # Net Debt / EBITDA <= 0 is pristine (25 pts), >= 4.0 is highly leveraged (0 pts)
    nd_ebitda = fh.net_debt_ebitda
    if nd_ebitda <= 0.0:
        leverage_score = 25.0
        strengths.append("Net-cash positive balance sheet provides strong downside insulation")
    elif nd_ebitda <= 1.0:
        leverage_score = 22.0
        strengths.append("Conservative debt level (< 1.0x EBITDA)")
    elif nd_ebitda <= 2.0:
        leverage_score = 17.0
    elif nd_ebitda <= 3.0:
        leverage_score = 10.0
        vulnerabilities.append("Moderate leverage (2.0x - 3.0x EBITDA) limits aggressive balance sheet flexibility")
    elif nd_ebitda <= 4.0:
        leverage_score = 5.0
        vulnerabilities.append("Elevated debt load (> 3.0x EBITDA) leaves company exposed to interest rate spikes")
    else:
        leverage_score = 0.0
        vulnerabilities.append("Severe indebtedness (> 4.0x EBITDA) presents acute debt servicing strain")

    # 2. Solvency score (max 20)
    # Interest Coverage >= 8.0 is 20 pts, < 1.5 is 0 pts
    ic = fh.interest_coverage
    if ic >= 8.0:
        solvency_score = 20.0
        strengths.append("Robust interest coverage (> 8.0x) comfortably absorbs borrowing cost surges")
    elif ic >= 5.0:
        solvency_score = 16.0
    elif ic >= 3.0:
        solvency_score = 12.0
    elif ic >= 1.5:
        solvency_score = 6.0
        vulnerabilities.append("Tightly stretched interest coverage (1.5x - 3.0x)")
    else:
        solvency_score = 0.0
        vulnerabilities.append("Distressed interest coverage (< 1.5x) requires immediate liquidity monitoring")

    # 3. Margin cushion score (max 20)
    # Operating Margin >= 25% is 20 pts, <= 5% is 3 pts
    op_margin = fh.operating_margin
    if op_margin >= 25.0:
        margin_score = 20.0
        strengths.append("High operating margins (> 25%) provide thick margin buffer against input cost inflation")
    elif op_margin >= 18.0:
        margin_score = 16.0
    elif op_margin >= 12.0:
        margin_score = 12.0
    elif op_margin >= 6.0:
        margin_score = 7.0
        vulnerabilities.append("Thin operating margins (< 12%) sensitive to raw material price inflation")
    else:
        margin_score = 3.0
        vulnerabilities.append("Compressed operating margins (< 6%) leaving negligible absorption capacity")

    # 4. Cash Flow to Capex (max 20)
    # CFO covers Capex well: capex_to_operating_cf <= 50% is 20 pts, > 120% is 2 pts
    capex_ratio = fh.capex_to_operating_cf
    if capex_ratio <= 40.0:
        cf_score = 20.0
        strengths.append("Self-funded organic capex from operating cash flow with abundant free cash flow")
    elif capex_ratio <= 70.0:
        cf_score = 16.0
    elif capex_ratio <= 100.0:
        cf_score = 10.0
    else:
        cf_score = 3.0
        vulnerabilities.append("Capex commitments exceed current operating cash generation, requiring external financing")

    # 5. ROE (max 15)
    roe = fh.roe
    if roe >= 20.0:
        roe_score = 15.0
        strengths.append("Superior return on equity (> 20%) signifies strong pricing power and competitive moat")
    elif roe >= 14.0:
        roe_score = 12.0
    elif roe >= 8.0:
        roe_score = 7.0
    else:
        roe_score = 3.0
        vulnerabilities.append("Sub-par return on equity (< 8%) indicating weak capital productivity")

    total_score = round(leverage_score + solvency_score + margin_score + cf_score + roe_score, 1)
    # Grade assignment
    if total_score >= 85.0:
        grade = "Fortress (AAA)"
    elif total_score >= 70.0:
        grade = "Resilient (AA)"
    elif total_score >= 55.0:
        grade = "Adequate (A)"
    elif total_score >= 40.0:
        grade = "Moderate Vulnerability (BBB)"
    else:
        grade = "High Vulnerability (Sub-BBB)"

    return {
        "resilience_score": total_score,
        "grade": grade,
        "components": {
            "leverage": {"score": leverage_score, "max": 25.0, "metric": f"{nd_ebitda:.2f}x Net Debt/EBITDA"},
            "solvency": {"score": solvency_score, "max": 20.0, "metric": f"{ic:.2f}x Interest Coverage"},
            "margin_cushion": {"score": margin_score, "max": 20.0, "metric": f"{op_margin:.1f}% OPM"},
            "cash_flow": {"score": cf_score, "max": 20.0, "metric": f"{capex_ratio:.1f}% Capex/CFO"},
            "capital_efficiency": {"score": roe_score, "max": 15.0, "metric": f"{roe:.1f}% ROE"},
        },
        "strengths": strengths,
        "vulnerabilities": vulnerabilities
    }
