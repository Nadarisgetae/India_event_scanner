from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from app.data.universe import universe_manager
from app.kb.kb_manager import KBManager

router = APIRouter()
kb_manager = KBManager()

@router.get("/universe")
async def get_universe(search: Optional[str] = None):
    companies = universe_manager.search(search) if search else universe_manager.get_all()
    return {
        "count": len(companies),
        "companies": [c.model_dump() for c in companies]
    }

@router.get("/sectors/matrix")
async def get_sector_matrix():
    return {
        "matrix": kb_manager.get_all_sector_sensitivities()
    }

@router.get("/channels")
async def get_transmission_channels():
    return {
        "channels": kb_manager.get_channels()
    }

@router.get("/levers")
async def get_strategic_levers(strategy: Optional[str] = None):
    return {
        "levers": kb_manager.get_levers(strategy_type=strategy)
    }

@router.get("/past-events")
async def get_past_events(category: Optional[str] = None):
    events = kb_manager.get_past_events(category=category)
    return {
        "count": len(events),
        "events": events
    }

@router.get("/companies/{symbol}/profile")
async def get_company_profile(symbol: str):
    clean = symbol.upper().replace(".NS", "")
    comp = universe_manager.get_by_symbol(clean)
    name = comp.name if comp else clean
    sector = comp.sector if comp else "General"
    sub_industry = comp.sub_industry if comp and comp.sub_industry else "Manufacturing"

    profile = kb_manager.build_company_exposure_profile(
        symbol=clean,
        name=name,
        sector=sector,
        sub_industry=sub_industry
    )
    return profile.model_dump()
