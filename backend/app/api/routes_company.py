import uuid
import asyncio
from typing import Optional, Dict, Any
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.models.enums import DepthMode
from app.models.company_report import CompanyReport
from app.engines.mode_b import ModeBEngine
from app.api.websocket import broadcaster
from app.data.fundamentals import fundamentals_manager
from app.data.universe import universe_manager
from app.enrichment.resilience import calculate_resilience_breakdown
from app.db import save_report

router = APIRouter()
mode_b_engine = ModeBEngine()

class CompanyAnalysisRequest(BaseModel):
    symbol: str
    event_text: str
    category: Optional[str] = "macro"
    depth: Optional[str] = "standard"
    synchronous: Optional[bool] = True

async def _run_mode_b_task(run_id: str, req: CompanyAnalysisRequest):
    depth_map = {
        "quick": DepthMode.QUICK,
        "standard": DepthMode.STANDARD,
        "deep": DepthMode.DEEP
    }

    async def callback(step_data: Dict[str, Any]):
        await broadcaster.broadcast(run_id, step_data)

    report = await mode_b_engine.run(
        symbol=req.symbol.upper(),
        event_text=req.event_text,
        category=req.category,
        depth=depth_map.get(req.depth.lower(), DepthMode.STANDARD),
        stream_callback=callback
    )

    # Save to SQLite database
    await save_report(
        report_id=report.id,
        report_type="company",
        title=f"Company Strategy: {req.symbol.upper()} - {report.event.title}",
        symbol=req.symbol.upper(),
        data_json=report.model_dump_json(),
        depth=req.depth
    )

    # Broadcast completion
    await broadcaster.broadcast(run_id, {
        "step_id": "COMPLETE",
        "status": "completed",
        "report_id": report.id,
        "report": report.model_dump()
    })
    return report

@router.post("/analyze/company")
async def analyze_company(req: CompanyAnalysisRequest, background_tasks: BackgroundTasks):
    run_id = f"RUN-CO-{uuid.uuid4().hex[:8]}"
    if req.synchronous:
        report = await _run_mode_b_task(run_id, req)
        return {
            "run_id": run_id,
            "report_id": report.id,
            "report": report
        }
    else:
        background_tasks.add_task(_run_mode_b_task, run_id, req)
        return {
            "run_id": run_id,
            "status": "processing",
            "message": "Company strategy deep-dive started. Stream events at /api/v1/runs/{run_id}/stream"
        }

@router.get("/companies/{symbol}/ratios")
async def get_company_ratios(symbol: str):
    clean = symbol.upper().replace(".NS", "")
    fh = await fundamentals_manager.get_financial_health(clean)
    breakdown = calculate_resilience_breakdown(fh)
    return {
        "symbol": clean,
        "financial_health": fh.model_dump(),
        "resilience_breakdown": breakdown
    }
