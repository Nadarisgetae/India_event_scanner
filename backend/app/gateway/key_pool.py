import asyncio
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict
import aiosqlite
from app.config import settings

@dataclass
class KeyState:
    alias: str
    key: str
    cooldown_until: float = 0.0
    dead: bool = False
    exhausted_day: str = ""
    used_today: int = 0
    day: str = ""
    recent: List[float] = field(default_factory=list)
    last_error: str = ""

class AllKeysExhaustedException(Exception):
    def __init__(self, wait_seconds: Optional[float] = None, message: str = "All API keys are exhausted or in cooldown."):
        self.wait_seconds = wait_seconds
        super().__init__(message)

class KeyPool:
    def __init__(self):
        self.lock = asyncio.Lock()
        self.daily_cap = settings.OPENROUTER_DAILY_CAP_PER_KEY
        self.max_rpm = settings.OPENROUTER_MAX_RPM_PER_KEY
        self.keys: List[KeyState] = [
            KeyState(alias=f"key{i+1}", key=k)
            for i, k in enumerate(settings.key_list)
        ]
        self._initialized = False

    def _today(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    async def init(self):
        """Loads persistent stats from SQLite."""
        async with self.lock:
            if self._initialized:
                return
            today = self._today()
            try:
                async with aiosqlite.connect(settings.SQLITE_PATH) as db:
                    cursor = await db.execute("SELECT alias, day, used_today, cooldown_until, is_dead, last_error FROM key_stats")
                    rows = await cursor.fetchall()
                    stat_map = {r[0]: r for r in rows}
                    for k in self.keys:
                        if k.alias in stat_map:
                            row = stat_map[k.alias]
                            if row[1] == today:
                                k.used_today = row[2]
                            else:
                                k.used_today = 0
                            k.day = today
                            k.cooldown_until = row[3]
                            k.dead = bool(row[4])
                            k.last_error = row[5] or ""
            except Exception as e:
                # If database not ready yet, continue with clean state
                pass
            self._initialized = True

    async def acquire(self) -> KeyState:
        """Acquires the least-used available key that is not in cooldown."""
        if not self._initialized:
            await self.init()

        async with self.lock:
            if not self.keys:
                # Mock/Fallback key if none supplied in .env
                return KeyState(alias="default", key="mock-or-key")

            now = time.time()
            today = self._today()
            candidates = []
            waits = []

            for k in self.keys:
                if k.day != today:
                    k.day = today
                    k.used_today = 0
                    k.exhausted_day = ""

                if k.dead:
                    continue
                if k.exhausted_day == today:
                    continue
                if k.used_today >= self.daily_cap:
                    continue

                # RPM sliding window (last 60 seconds)
                k.recent = [t for t in k.recent if now - t < 60]
                if len(k.recent) >= self.max_rpm:
                    waits.append(60 - (now - k.recent[0]))
                    continue

                if k.cooldown_until > now:
                    waits.append(k.cooldown_until - now)
                    continue

                candidates.append(k)

            if not candidates:
                min_wait = min(waits) if waits else None
                raise AllKeysExhaustedException(
                    wait_seconds=min_wait,
                    message=f"All {len(self.keys)} OpenRouter keys are exhausted or in cooldown. Retry in {int(min_wait or 60)}s."
                )

            # Pick least used today for load distribution
            selected = min(candidates, key=lambda x: x.used_today)
            selected.used_today += 1
            selected.recent.append(now)
            await self._save_key(selected)
            return selected

    async def report_status(self, key: KeyState, status_code: int, retry_after: Optional[int] = None, error_msg: str = ""):
        """Reports the outcome of an HTTP call to adjust key health."""
        async with self.lock:
            key.last_error = error_msg
            now = time.time()
            if status_code == 429:
                cooldown_dur = retry_after if retry_after and retry_after > 0 else 60
                key.cooldown_until = now + cooldown_dur
            elif status_code == 402:
                key.exhausted_day = self._today()
            elif status_code in (401, 403):
                key.dead = True
            await self._save_key(key)

    async def _save_key(self, k: KeyState):
        try:
            async with aiosqlite.connect(settings.SQLITE_PATH) as db:
                await db.execute("""
                    INSERT INTO key_stats (alias, day, used_today, cooldown_until, is_dead, last_error)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(alias) DO UPDATE SET
                        day=excluded.day,
                        used_today=excluded.used_today,
                        cooldown_until=excluded.cooldown_until,
                        is_dead=excluded.is_dead,
                        last_error=excluded.last_error
                """, (k.alias, k.day, k.used_today, k.cooldown_until, int(k.dead), k.last_error))
                await db.commit()
        except Exception:
            pass

    async def get_status_summary(self) -> List[Dict]:
        """Returns sanitized status of all configured keys for admin and UI monitoring."""
        if not self._initialized:
            await self.init()
        now = time.time()
        summary = []
        for k in self.keys:
            status = "ok"
            if k.dead:
                status = "dead"
            elif k.exhausted_day == self._today():
                status = "exhausted"
            elif k.cooldown_until > now:
                status = "cooling_down"

            summary.append({
                "alias": k.alias,
                "status": status,
                "used_today": k.used_today,
                "cap": self.daily_cap,
                "cooldown_seconds": max(0, int(k.cooldown_until - now)) if k.cooldown_until > now else 0,
                "cooldown_remaining_sec": max(0, int(k.cooldown_until - now)) if k.cooldown_until > now else 0,
                "rpm_used": len([t for t in k.recent if now - t < 60]),
                "is_dead": k.dead,
                "last_error": k.last_error
            })
        return summary

    async def get_stats(self) -> List[Dict]:
        return await self.get_status_summary()

key_pool = KeyPool()
