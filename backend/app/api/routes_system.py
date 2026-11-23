import os
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter
from app.config import settings
from app.gateway.key_pool import key_pool

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "India Event Scanner API",
        "version": "2.4.0",
        "environment": "production",
        "free_mode_only": True
    }

@router.get("/system/keys")
async def get_key_status():
    stats = await key_pool.get_stats()
    return {
        "active_keys_count": len(stats),
        "keys": stats
    }

@router.get("/system/data-status")
async def get_data_status():
    prices_dir = Path(settings.STORAGE_DIR) / "prices"
    parquet_files = list(prices_dir.glob("*.parquet")) if prices_dir.exists() else []
    sqlite_size_kb = round(os.path.getsize(settings.SQLITE_PATH) / 1024, 1) if os.path.exists(settings.SQLITE_PATH) else 0

    return {
        "sqlite_db_path": settings.SQLITE_PATH,
        "sqlite_size_kb": sqlite_size_kb,
        "cached_price_tickers_count": len(parquet_files),
        "free_model_default": settings.DEFAULT_MODEL,
        "storage_dir": settings.STORAGE_DIR
    }
