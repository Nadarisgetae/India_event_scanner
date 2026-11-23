import argparse
import asyncio
import json
import sys
from typing import Optional

from app.db import init_db, get_reports, get_report_by_id
from app.engines.mode_a import ModeAEngine
from app.engines.mode_b import ModeBEngine
from app.gateway.key_pool import key_pool
from app.eval.run_backtest import run_historical_backtest
from app.models.enums import TimeHorizon, DepthMode


def print_banner():
    print("""
===================================================================
     INDIA EVENT-IMPACT INTELLIGENCE SCANNER (CLI v2.4)
        Institutional Macro Reasoning for Indian Equities
===================================================================
""")


async def run_market_cli(event_text: str, depth: str):
    await init_db()
    print(f"\n[CLI] Running Mode A Market Scan for: \"{event_text}\" (Depth: {depth})...\n")

    def stream_cb(step):
        status_symbol = "✓" if step["status"] == "completed" else "..."
        print(f"  [{step['step_id']}] {step['label']} ({status_symbol}) - {step['summary']}")

    engine = ModeAEngine()
    depth_enum = DepthMode.DEEP if depth == "deep" else (DepthMode.QUICK if depth == "quick" else DepthMode.STANDARD)
    report = await engine.run(
        event_text=event_text,
        depth=depth_enum,
        stream_callback=stream_cb
    )

    print("\n-------------------------------------------------------------------")
    print(f"VERDICT: {report.verdict.get('overall_bias', 'Neutral').upper()}")
    print(f"Net Market Impact: {report.verdict.get('net_market_impact', 0.0):+0.2f}")
    print(f"Sectors: {report.verdict.get('negative_sectors_count', 0)} Impaired, {report.verdict.get('positive_sectors_count', 0)} Beneficiary")
    print("-------------------------------------------------------------------")
    print(f"\nExecutive Summary:\n{report.executive_summary}\n")

    print("TOP IMPACTED SECTORS:")
    for s in report.sectors[:3]:
        print(f"  [-] {s.sector:<22} Score: {s.score:+0.1f} | Reason: {s.reason}")
    for s in report.sectors[-3:]:
        print(f"  [+] {s.sector:<22} Score: {s.score:+0.1f} | Reason: {s.reason}")

    print("\nREPRESENTATIVE COMPANIES:")
    for c in report.companies[:4]:
        print(f"  * {c.symbol:<12} ({c.sector:<18}) Bucket: {c.bucket.value.upper():<10} Score: {c.impact_score:+0.2f}")

    print(f"\nReport ID: {report.id} (Saved to SQLite database)")
    print("-------------------------------------------------------------------\n")


async def run_company_cli(symbol: str, event_text: str, depth: str):
    await init_db()
    clean_symbol = symbol.upper().replace(".NS", "")
    print(f"\n[CLI] Running Mode B Company Strategy for: {clean_symbol} on \"{event_text}\"...\n")

    def stream_cb(step):
        status_symbol = "✓" if step["status"] == "completed" else "..."
        print(f"  [{step['step_id']}] {step['label']} ({status_symbol}) - {step['summary']}")

    engine = ModeBEngine()
    depth_enum = DepthMode.DEEP if depth == "deep" else (DepthMode.QUICK if depth == "quick" else DepthMode.STANDARD)
    report = await engine.run(
        symbol=clean_symbol,
        event_text=event_text,
        depth=depth_enum,
        stream_callback=stream_cb
    )

    print("\n-------------------------------------------------------------------")
    print(f"COMPANY: {report.company.name} ({report.company.symbol})")
    print(f"SECTOR: {report.company.sector} | PRICE: Rs. {report.company.price:,.2f}")
    print(f"IMPACT SCORE: {report.company.impact_score:+0.2f} | STANCE: {report.strategy.stance.value.upper()}")
    print(f"RESILIENCE: {report.resilience.score}/100 ({report.resilience.band.upper()})")
    print("-------------------------------------------------------------------")

    print("\nIMMEDIATE ACTIONS (0-30 Days):")
    for act in report.strategy.immediate_0_30d:
        print(f"  [!] {act.action} (Owner: {act.owner})")
        print(f"      Why: {act.why}")

    print("\nSHORT-TERM ACTIONS (1-6 Months):")
    for act in report.strategy.short_term_1_6m:
        print(f"  [>] {act.action} (Owner: {act.owner})")

    print("\nLONG-TERM CAPITALIZE ACTIONS (6-24 Months):")
    for act in report.strategy.long_term_6_24m:
        print(f"  [+] {act.action} (Owner: {act.owner})")

    print(f"\nReport ID: {report.id} (Saved to SQLite database)")
    print("-------------------------------------------------------------------\n")


async def run_keys_cli():
    await init_db()
    stats = await key_pool.get_status_summary()
    print("\n---------------- KEY POOL STATUS ----------------")
    print(f"Active Keys Configured: {len(stats)}")
    for k in stats:
        cd_sec = k.get('cooldown_seconds', 0)
        cooldown = f"COOLDOWN ({cd_sec}s remaining)" if cd_sec > 0 else "READY"
        dead = "DEAD" if k.get('is_dead') else "HEALTHY"
        print(f"  * {k['alias']:<10} | Used Today: {k['used_today']}/{k.get('cap', 500)} | RPM: {k.get('rpm_used', 0)}/15 | Status: {k['status'].upper()} / {cooldown}")
    print("-------------------------------------------------\n")


async def run_reports_cli():
    await init_db()
    reports = await get_reports(limit=20)
    print("\n---------------- SAVED REPORTS ----------------")
    print(f"Total Reports Found: {len(reports)}")
    for r in reports:
        sym = f"({r['symbol']})" if r.get('symbol') else ""
        print(f"  [{r['id']}] {r['type'].upper():<8} {r['title'][:45]:<46} {sym:<12} Date: {r['created_at']}")
    print("-----------------------------------------------\n")


async def run_backtest_cli():
    print("\n[CLI] Launching 40-Event Historical Back-Testing Harness...\n")
    res = await run_historical_backtest()
    print("\n---------------- BACK-TEST RESULTS ----------------")
    print(f"Total Events Evaluated: {res['total_events']}")
    print(f"Directional Hits:       {res['successful_predictions']}")
    print(f"Directional Hit Rate:   {res['accuracy_pct']}%")
    print(f"Metrics Output:         {res['metrics_file']}")
    print("---------------------------------------------------\n")


def main():
    print_banner()
    parser = argparse.ArgumentParser(description="India Event Scanner CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # market command
    p_market = subparsers.add_parser("market", help="Run Mode A Market Impact analysis")
    p_market.add_argument("event", type=str, help="Headline or text of the macro event")
    p_market.add_argument("--depth", choices=["quick", "standard", "deep"], default="standard", help="Depth of analysis")

    # company command
    p_company = subparsers.add_parser("company", help="Run Mode B Company Strategy analysis")
    p_company.add_argument("symbol", type=str, help="NSE/BSE stock ticker (e.g. ASIANPAINT, TCS, RELIANCE)")
    p_company.add_argument("event", type=str, help="Headline or text of the macro event")
    p_company.add_argument("--depth", choices=["quick", "standard", "deep"], default="standard", help="Depth of analysis")

    # keys command
    subparsers.add_parser("keys", help="Display KeyPool status and quota consumption")

    # reports command
    subparsers.add_parser("reports", help="List saved market and company reports")

    # backtest command
    subparsers.add_parser("backtest", help="Run historical event-study back-testing harness")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(0)

    if args.command == "market":
        asyncio.run(run_market_cli(args.event, args.depth))
    elif args.command == "company":
        asyncio.run(run_company_cli(args.symbol, args.event, args.depth))
    elif args.command == "keys":
        asyncio.run(run_keys_cli())
    elif args.command == "reports":
        asyncio.run(run_reports_cli())
    elif args.command == "backtest":
        asyncio.run(run_backtest_cli())


if __name__ == "__main__":
    main()
