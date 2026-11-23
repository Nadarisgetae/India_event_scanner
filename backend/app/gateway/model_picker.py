import asyncio
import time
import httpx
from typing import List, Dict, Optional
from app.config import settings

class ModelPicker:
    def __init__(self):
        self.lock = asyncio.Lock()
        self.banned_models: Dict[str, float] = {}  # model_id -> ban_until timestamp
        self.model_penalties: Dict[str, int] = {}
        self.cached_free_models: List[str] = []
        self.last_fetch: float = 0.0

    async def get_ranked_models(self) -> List[str]:
        """Returns active zero-cost models ranked by preference and health."""
        async with self.lock:
            now = time.time()
            # Clean expired bans
            self.banned_models = {m: t for m, t in self.banned_models.items() if t > now}

            # Fetch free models catalogue if older than 12 hours
            if not self.cached_free_models or (now - self.last_fetch > 43200):
                await self._fetch_catalogue()

            # Rank available models
            candidates = [m for m in self.cached_free_models if m not in self.banned_models]
            if not candidates:
                # Fallback to configured preferences if fetch returned empty
                candidates = [m for m in settings.model_preferences if m not in self.banned_models]

            # Sort by user preference index, then lowest penalty
            def sort_key(model_name: str):
                pref_score = 999
                for i, pref in enumerate(settings.model_preferences):
                    if pref.lower() in model_name.lower() or model_name.lower().startswith(pref.split(':')[0].lower()):
                        pref_score = i
                        break
                penalty = self.model_penalties.get(model_name, 0)
                return (pref_score, penalty)

            candidates.sort(key=sort_key)
            return candidates or settings.model_preferences

    async def _fetch_catalogue(self):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get("https://openrouter.ai/api/v1/models")
                if r.status_code == 200:
                    data = r.json()
                    free_list = []
                    for m in data.get("data", []):
                        pricing = m.get("pricing", {})
                        p_prompt = str(pricing.get("prompt", "1"))
                        p_compl = str(pricing.get("completion", "1"))
                        m_id = m.get("id", "")
                        if p_prompt in ("0", "0.0") and p_compl in ("0", "0.0") or m_id.endswith(":free"):
                            free_list.append(m_id)
                    if free_list:
                        self.cached_free_models = free_list
                        self.last_fetch = time.time()
        except Exception:
            # Fall back to settings preferences
            if not self.cached_free_models:
                self.cached_free_models = settings.model_preferences

    def ban(self, model: str, duration_seconds: float = 21600):
        """Temporarily bans a model (e.g. 404/service unavailable) for 6 hours."""
        self.banned_models[model] = time.time() + duration_seconds

    def penalize(self, model: str):
        """Increments penalty for malformed responses or timeouts."""
        self.model_penalties[model] = self.model_penalties.get(model, 0) + 1

model_picker = ModelPicker()
