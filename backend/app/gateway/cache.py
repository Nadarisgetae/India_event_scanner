import hashlib
import json
from typing import Optional, Any
import aiosqlite
from app.config import settings

def compute_cache_key(messages: list, schema_name: Optional[str] = None) -> str:
    """Computes a deterministic SHA-256 hash for LLM prompt caching."""
    serialized = json.dumps({"m": messages, "s": schema_name or ""}, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

async def get_cached_response(cache_key: str) -> Optional[str]:
    """Retrieves cached response from SQLite if present."""
    try:
        async with aiosqlite.connect(settings.SQLITE_PATH) as db:
            cursor = await db.execute("SELECT response_json FROM llm_cache WHERE cache_key = ?", (cache_key,))
            row = await cursor.fetchone()
            if row:
                return row[0]
    except Exception:
        pass
    return None

async def put_cached_response(cache_key: str, model: str, prompt: str, response_json: str):
    """Caches response in SQLite."""
    try:
        async with aiosqlite.connect(settings.SQLITE_PATH) as db:
            await db.execute("""
                INSERT INTO llm_cache (cache_key, model, prompt, response_json)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET response_json=excluded.response_json
            """, (cache_key, model, prompt[:500], response_json))
            await db.commit()
    except Exception:
        pass
