import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.db import get_reports, get_report_by_id, delete_report
from app.reports.pdf_generator import render_report_printable_html

router = APIRouter()

@router.get("/reports")
async def list_saved_reports(limit: int = 50):
    reports = await get_reports(limit=limit)
    return {
        "count": len(reports),
        "reports": reports
    }

@router.get("/reports/{report_id}")
async def fetch_report(report_id: str):
    rep = await get_report_by_id(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")
    try:
        data = json.loads(rep["data_json"])
    except Exception:
        data = {}
    return {
        "id": rep["id"],
        "type": rep["type"],
        "title": rep["title"],
        "symbol": rep.get("symbol"),
        "depth": rep["depth"],
        "created_at": rep["created_at"],
        "data": data
    }

@router.delete("/reports/{report_id}")
async def remove_report(report_id: str):
    deleted = await delete_report(report_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")
    return {"status": "deleted", "report_id": report_id}

@router.get("/reports/{report_id}/export-html", response_class=HTMLResponse)
async def export_report_html(report_id: str, auto_print: bool = False):
    rep = await get_report_by_id(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")
    try:
        data = json.loads(rep["data_json"])
    except Exception:
        data = {}
    html_content = render_report_printable_html(data, auto_print=auto_print)
    return HTMLResponse(content=html_content)

@router.get("/reports/{report_id}/pdf", response_class=HTMLResponse)
async def export_report_pdf(report_id: str):
    rep = await get_report_by_id(report_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")
    try:
        data = json.loads(rep["data_json"])
    except Exception:
        data = {}
    html_content = render_report_printable_html(data, auto_print=True)
    return HTMLResponse(
        content=html_content,
        headers={"Content-Disposition": f"inline; filename=India-Event-Impact-{report_id}.html"}
    )
