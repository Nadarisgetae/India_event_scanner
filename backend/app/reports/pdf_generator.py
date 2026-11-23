import html
from typing import Dict, Any


def render_report_printable_html(report_dict: Dict[str, Any], auto_print: bool = False) -> str:
    """
    Renders an institutional-grade, publication-ready printable HTML memo.
    Features @media print styling, SEBI compliance headers, and page break optimization.
    """
    rep_type = report_dict.get("type", "market")
    rep_id = report_dict.get("id", "REPORT")
    title = report_dict.get("title", "Event Impact Analysis")
    appendix = report_dict.get("appendix", {})
    gen_time = appendix.get("generated_at", "")[:19].replace("T", " ")

    if rep_type == "company":
        company = report_dict.get("company", {})
        comp_name = company.get("name", "")
        comp_sym = company.get("symbol", "")
        comp_sector = company.get("sector", "")
        event = report_dict.get("event", {})
        headline = event.get("headline") or event.get("raw_input", "")
        strategy = report_dict.get("strategy", {})
        resilience = report_dict.get("resilience", {})
        dimensions = report_dict.get("dimensions", [])
        monte_carlo = report_dict.get("monte_carlo")

        # HTML Body for Company Mode B
        content_html = f"""
        <div class="header-box">
            <div class="meta-tag">COMPANY STRATEGY REPORT (MODE B)</div>
            <h1>{html.escape(comp_name)} ({html.escape(comp_sym)})</h1>
            <p class="subtitle">Sector: {html.escape(comp_sector)} | Report ID: {rep_id} | Generated: {gen_time} UTC</p>
        </div>

        <div class="alert-box">
            <strong>MACRO SHOCK EVENT:</strong> {html.escape(headline)}
        </div>

        <h2>1. Executive Summary & Resilience Profile</h2>
        <table class="grid-table">
            <tr>
                <th>Resilience Score</th>
                <th>Resilience Band</th>
                <th>Net Impact Score</th>
                <th>Strategy Posture</th>
            </tr>
            <tr>
                <td class="bold">{resilience.get('score', 'N/A')}/100</td>
                <td>{resilience.get('band', 'N/A').title()}</td>
                <td class="bold">{company.get('impact_score', 0):.1f}</td>
                <td class="bold">{strategy.get('stance', 'DEFEND').upper()}</td>
            </tr>
        </table>
        """

        if monte_carlo:
            content_html += f"""
            <h2>2. Parametric Monte Carlo Simulation (10,000 Iterations)</h2>
            <p class="text-sm">{html.escape(monte_carlo.get('summary_interpretation', ''))}</p>
            <table class="grid-table">
                <tr>
                    <th>Base Margin</th>
                    <th>Expected Margin</th>
                    <th>Contraction</th>
                    <th>VaR (95% Drawdown)</th>
                    <th>Covenant Breach Risk</th>
                </tr>
                <tr>
                    <td>{monte_carlo.get('base_margin_pct')}%</td>
                    <td class="bold">{monte_carlo.get('expected_margin_pct')}%</td>
                    <td class="danger">-{monte_carlo.get('margin_contraction_bps')} bps</td>
                    <td class="danger">-{monte_carlo.get('var_95_drawdown_pct')}%</td>
                    <td>{monte_carlo.get('prob_covenant_breach_pct')}%</td>
                </tr>
            </table>
            """

        content_html += """
        <div class="page-break"></div>
        <h2>3. Dimension Impact Breakdown (-3 to +3)</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Dimension</th>
                    <th>Impact</th>
                    <th>Magnitude</th>
                    <th>Confidence</th>
                    <th>Explanation</th>
                </tr>
            </thead>
            <tbody>
        """
        for dim in dimensions[:8]:
            score = dim.get("impact", 0)
            score_class = "danger" if score < 0 else "success"
            content_html += f"""
                <tr>
                    <td class="bold">{html.escape(dim.get('dimension', ''))}</td>
                    <td class="{score_class} bold">{score:+.1f}</td>
                    <td>{html.escape(dim.get('magnitude_estimate', ''))}</td>
                    <td>{dim.get('confidence', '').title()}</td>
                    <td>{html.escape(dim.get('explanation', ''))}</td>
                </tr>
            """
        content_html += """
            </tbody>
        </table>

        <h2>4. Strategic Action Plan (Defend & Capitalize)</h2>
        """
        for period, label in [("immediate_0_30d", "Immediate (0–30 Days)"), ("short_term_1_6m", "Short-Term (1–6 Months)"), ("long_term_6_24m", "Long-Term (6–24 Months)")]:
            items = strategy.get(period, [])
            if items:
                content_html += f"<h3>{label}</h3><ul>"
                for act in items:
                    content_html += f"<li><strong>{html.escape(act.get('action', ''))}</strong> (Lever: <em>{html.escape(act.get('lever', ''))}</em>) — Owner: {html.escape(act.get('owner', ''))}. Expected Effect: {html.escape(act.get('expected_effect', ''))}</li>"
                content_html += "</ul>"

    else:
        # Mode A Market Report
        event = report_dict.get("event", {})
        headline = event.get("headline") or event.get("title", "")
        summary = report_dict.get("executive_summary", "")
        verdict = report_dict.get("verdict", "")
        sectors = report_dict.get("sectors", [])
        companies = report_dict.get("companies", [])

        content_html = f"""
        <div class="header-box">
            <div class="meta-tag">MARKET IMPACT REPORT (MODE A)</div>
            <h1>India Equity Market Impact Analysis</h1>
            <p class="subtitle">Report ID: {rep_id} | Generated: {gen_time} UTC</p>
        </div>

        <div class="alert-box">
            <strong>EVENT HEADLINE:</strong> {html.escape(headline)}
        </div>

        <h2>1. Executive Verdict & Macro Summary</h2>
        <p class="lead">{html.escape(summary)}</p>
        <p><strong>Transmission Verdict:</strong> {html.escape(verdict)}</p>

        <h2>2. Sector Sensitivity Rankings</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Sector</th>
                    <th>Impact Score (-5 to +5)</th>
                    <th>Confidence</th>
                    <th>Reasoning</th>
                </tr>
            </thead>
            <tbody>
        """
        for sec in sectors[:10]:
            sc = sec.get("score", 0)
            sc_class = "danger" if sc < 0 else ("success" if sc > 0 else "neutral")
            content_html += f"""
                <tr>
                    <td class="bold">{html.escape(sec.get('sector', ''))}</td>
                    <td class="{sc_class} bold">{sc:+.1f}</td>
                    <td>{sec.get('confidence', '').title()}</td>
                    <td>{html.escape(sec.get('reason', ''))}</td>
                </tr>
            """
        content_html += """
            </tbody>
        </table>

        <div class="page-break"></div>
        <h2>3. Company Impact Highlights</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Company Name</th>
                    <th>Sector</th>
                    <th>Bucket</th>
                    <th>Score</th>
                    <th>Primary Rationale</th>
                </tr>
            </thead>
            <tbody>
        """
        for co in companies[:15]:
            bucket = co.get("bucket", "little_or_no_effect").replace("_", " ").title()
            content_html += f"""
                <tr>
                    <td class="bold font-mono">{html.escape(co.get('symbol', ''))}</td>
                    <td>{html.escape(co.get('name', ''))}</td>
                    <td>{html.escape(co.get('sector', ''))}</td>
                    <td><span class="badge">{bucket}</span></td>
                    <td class="bold">{co.get('impact_score', 0):+.1f}</td>
                    <td>{html.escape(co.get('reasoning', ''))}</td>
                </tr>
            """
        content_html += "</tbody></table>"

    # Assemble complete HTML with print styles
    print_script = "<script>window.onload = function() { window.print(); };</script>" if auto_print else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>India Event-Impact Intelligence — {rep_id}</title>
<style>
    @page {{
        size: A4;
        margin: 1.5cm;
    }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #111827;
        line-height: 1.5;
        font-size: 11pt;
        background: #ffffff;
        margin: 0;
        padding: 20px;
    }}
    .header-box {{
        border-bottom: 2px solid #1e3a8a;
        padding-bottom: 12px;
        margin-bottom: 20px;
    }}
    .meta-tag {{
        font-size: 9pt;
        font-weight: 700;
        letter-spacing: 1px;
        color: #2563eb;
    }}
    h1 {{
        margin: 4px 0 6px 0;
        font-size: 18pt;
        color: #0f172a;
    }}
    .subtitle {{
        margin: 0;
        font-size: 9pt;
        color: #64748b;
    }}
    .alert-box {{
        background: #f1f5f9;
        border-left: 4px solid #2563eb;
        padding: 10px 14px;
        margin-bottom: 20px;
        font-size: 10pt;
    }}
    h2 {{
        font-size: 13pt;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-top: 24px;
        margin-bottom: 10px;
        color: #1e293b;
    }}
    h3 {{
        font-size: 11pt;
        margin-top: 14px;
        margin-bottom: 6px;
        color: #334155;
    }}
    p {{
        margin: 6px 0 12px 0;
    }}
    .lead {{
        font-size: 11pt;
        color: #1e293b;
        font-weight: 500;
    }}
    table {{
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
        font-size: 9.5pt;
    }}
    th, td {{
        border: 1px solid #cbd5e1;
        padding: 6px 10px;
        text-align: left;
    }}
    th {{
        background: #f8fafc;
        font-weight: 600;
    }}
    .grid-table td {{
        text-align: center;
        padding: 10px;
    }}
    .bold {{ font-weight: 700; }}
    .font-mono {{ font-family: Courier, monospace; }}
    .danger {{ color: #dc2626; }}
    .success {{ color: #16a34a; }}
    .badge {{
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        background: #e2e8f0;
        font-size: 8pt;
    }}
    .page-break {{
        page-break-after: always;
        break-after: page;
    }}
    .footer-disclaimer {{
        margin-top: 30px;
        padding-top: 10px;
        border-top: 1px solid #cbd5e1;
        font-size: 8pt;
        color: #64748b;
        text-align: center;
    }}
    @media print {{
        body {{ padding: 0; }}
        .no-print {{ display: none; }}
    }}
</style>
{print_script}
</head>
<body>
    {content_html}
    <div class="footer-disclaimer">
        CONFIDENTIAL & PROPRIETARY — FOR RESEARCH AND EDUCATIONAL SCENARIO MODELING ONLY.<br>
        This report is generated by an automated intelligence model and does not constitute SEBI-registered investment advice or a buy/sell solicitation.
    </div>
</body>
</html>"""
