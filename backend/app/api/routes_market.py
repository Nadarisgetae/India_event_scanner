import uuid
import asyncio
from typing import Optional, Dict, Any
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.models.enums import TimeHorizon, DepthMode
from app.models.market_report import MarketReport
from app.models.event import MacroSnapshot
from app.engines.mode_a import ModeAEngine
from app.api.websocket import broadcaster
from app.data.macro import macro_manager
from app.db import save_report

router = APIRouter()
mode_a_engine = ModeAEngine()

class MarketAnalysisRequest(BaseModel):
    event_text: str
    category: Optional[str] = "macro"
    time_horizon: Optional[str] = "short"
    depth: Optional[str] = "standard"
    synchronous: Optional[bool] = True

async def _run_mode_a_task(run_id: str, req: MarketAnalysisRequest):
    horizon_map = {
        "immediate": TimeHorizon.IMMEDIATE,
        "short": TimeHorizon.SHORT,
        "long": TimeHorizon.LONG
    }
    depth_map = {
        "quick": DepthMode.QUICK,
        "standard": DepthMode.STANDARD,
        "deep": DepthMode.DEEP
    }

    async def callback(step_data: Dict[str, Any]):
        await broadcaster.broadcast(run_id, step_data)

    report = await mode_a_engine.run(
        event_text=req.event_text,
        category=req.category,
        time_horizon=horizon_map.get(req.time_horizon.lower(), TimeHorizon.SHORT),
        depth=depth_map.get(req.depth.lower(), DepthMode.STANDARD),
        stream_callback=callback
    )

    # Save to SQLite database
    await save_report(
        report_id=report.id,
        report_type="market",
        title=report.title,
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

@router.post("/analyze/market")
async def analyze_market(req: MarketAnalysisRequest, background_tasks: BackgroundTasks):
    run_id = f"RUN-MKT-{uuid.uuid4().hex[:8]}"
    if req.synchronous:
        report = await _run_mode_a_task(run_id, req)
        return {
            "run_id": run_id,
            "report_id": report.id,
            "report": report
        }
    else:
        background_tasks.add_task(_run_mode_a_task, run_id, req)
        return {
            "run_id": run_id,
            "status": "processing",
            "message": "Analysis started in background. Stream events at /api/v1/runs/{run_id}/stream"
        }

@router.get("/macro/snapshot", response_model=MacroSnapshot)
async def get_macro_snapshot():
    return await macro_manager.get_latest_macro_snapshot()
