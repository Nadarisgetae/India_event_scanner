import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from app.data.prices import price_manager
from app.data.news import news_manager
from app.gateway.key_pool import key_pool
from app.db import cleanup_old_cache

logger = logging.getLogger("india_event_scanner.scheduler")


class ProductionScheduler:
    """
    Background scheduler for automated data synchronization, cache maintenance,
    and key pool health monitoring. Runs within FastAPI lifespan.
    """

    def __init__(self):
        self._running = False
        self._task: Optional[asyncio.Task] = None

    def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._scheduler_loop())
        logger.info("Production Background Scheduler started.")

    def stop(self):
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("Production Background Scheduler stopped.")

    async def _scheduler_loop(self):
        """
        Runs periodic maintenance cycles without blocking API request threads.
        """
        cycle_count = 0
        while self._running:
            try:
                cycle_count += 1
                logger.info(f"Running maintenance cycle #{cycle_count}")

                # 1. News Ingestion Cycle (Every 30 minutes / cycle)
                try:
                    articles = await news_manager.fetch_recent_news(limit=25)
                    logger.info(f"Ingested and deduplicated {len(articles)} RSS financial news articles.")
                except Exception as e:
                    logger.warning(f"News sync warning: {e}")

                # 2. Key Pool Health Check
                try:
                    key_summary = key_pool.get_status_summary()
                    active_keys = key_summary.get("active_keys", 0)
                    total_keys = key_summary.get("total_keys", 0)
                    if active_keys == 0 and total_keys > 0:
                        logger.warning("KEY POOL ALERT: All OpenRouter API keys in cooldown or exhausted.")
                except Exception as e:
                    logger.warning(f"Key pool check warning: {e}")

                # 3. Weekly Cache Cleanup (Every ~48 cycles / 24 hours)
                if cycle_count % 48 == 0:
                    try:
                        await cleanup_old_cache(days=7)
                        logger.info("Cleaned up expired SQLite LLM response cache records.")
                    except Exception as e:
                        logger.warning(f"Cache cleanup warning: {e}")

                # Sleep 30 minutes between cycles
                await asyncio.sleep(1800)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler maintenance cycle: {e}")
                await asyncio.sleep(60)


scheduler = ProductionScheduler()
