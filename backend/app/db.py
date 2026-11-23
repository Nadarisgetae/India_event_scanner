import aiosqlite
import os
from pathlib import Path
from app.config import settings

async def init_db():
    """Initializes the SQLite database schema if not present."""
    os.makedirs(os.path.dirname(settings.SQLITE_PATH), exist_ok=True)
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        # 1. LLM Prompt Cache
        await db.execute("""
            CREATE TABLE IF NOT EXISTS llm_cache (
                cache_key TEXT PRIMARY KEY,
                model TEXT NOT NULL,
                prompt TEXT NOT NULL,
                response_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. Key Usage & Cooldown Tracker
        await db.execute("""
            CREATE TABLE IF NOT EXISTS key_stats (
                alias TEXT PRIMARY KEY,
                day TEXT NOT NULL,
                used_today INTEGER DEFAULT 0,
                cooldown_until REAL DEFAULT 0.0,
                is_dead INTEGER DEFAULT 0,
                last_error TEXT
            )
        """)

        # 3. Saved Reports Table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS saved_reports (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                symbol TEXT,
                data_json TEXT NOT NULL,
                depth TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 4. News Feed Archive
        await db.execute("""
            CREATE TABLE IF NOT EXISTS news_feed (
                id TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                summary TEXT,
                published_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 5. Company Fundamentals Snapshot
        await db.execute("""
            CREATE TABLE IF NOT EXISTS fundamentals (
                symbol TEXT PRIMARY KEY,
                ratios_json TEXT NOT NULL,
                resilience_score REAL NOT NULL,
                resilience_band TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.commit()

async def get_db():
    """Async database connection context manager."""
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def save_report(report_id: str, report_type: str, title: str, data_json: str, depth: str = "standard", symbol: str = None):
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        await db.execute("""
            INSERT INTO saved_reports (id, type, title, symbol, data_json, depth)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                data_json=excluded.data_json,
                depth=excluded.depth
        """, (report_id, report_type, title, symbol, data_json, depth))
        await db.commit()

async def get_reports(limit: int = 50):
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT id, type, title, symbol, depth, created_at
            FROM saved_reports
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

async def get_report_by_id(report_id: str):
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM saved_reports WHERE id = ?", (report_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None

async def delete_report(report_id: str) -> bool:
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        cursor = await db.execute("DELETE FROM saved_reports WHERE id = ?", (report_id,))
        await db.commit()
        return cursor.rowcount > 0

async def cleanup_old_cache(days: int = 7):
    """Deletes cached LLM prompt responses older than specified days."""
    async with aiosqlite.connect(settings.SQLITE_PATH) as db:
        await db.execute("""
            DELETE FROM llm_cache
            WHERE created_at < datetime('now', '-' || ? || ' days')
        """, (days,))
        await db.commit()
