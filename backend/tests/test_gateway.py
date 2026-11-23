import pytest
import asyncio
import time
from app.gateway.key_pool import KeyPool, AllKeysExhaustedException, KeyState
from app.gateway.model_picker import ModelPicker
from app.gateway.cache import compute_cache_key
from app.models.enums import EventType, Magnitude, Duration, Certainty, Direction
from app.models.event import ParsedEvent

def test_cache_key_deterministic():
    msgs1 = [{"role": "user", "content": "Hello"}]
    msgs2 = [{"role": "user", "content": "Hello"}]
    assert compute_cache_key(msgs1) == compute_cache_key(msgs2)

@pytest.mark.asyncio
async def test_key_pool_acquire_and_cooldown():
    pool = KeyPool()
    pool.daily_cap = 5
    pool.keys = [
        KeyState(alias="key1", key="k1"),
        KeyState(alias="key2", key="k2")
    ]
    pool._initialized = True

    # 1. Acquire key1
    k = await pool.acquire()
    assert k.alias == "key1"
    assert k.used_today == 1

    # 2. Acquire key2 (load balancing)
    k2 = await pool.acquire()
    assert k2.alias == "key2"
    assert k2.used_today == 1

    # 3. Report 429 on key1
    await pool.report_status(k, 429, retry_after=30)
    assert k.cooldown_until > time.time()

    # 4. Next acquire must pick key2 because key1 is cooling down
    k3 = await pool.acquire()
    assert k3.alias == "key2"

@pytest.mark.asyncio
async def test_key_pool_all_exhausted():
    pool = KeyPool()
    pool.daily_cap = 1
    pool.keys = [KeyState(alias="k1", key="key1")]
    pool._initialized = True

    k = await pool.acquire()
    assert k.used_today == 1

    # Second acquire exceeds daily cap
    with pytest.raises(AllKeysExhaustedException):
        await pool.acquire()

def test_model_picker_ranking():
    picker = ModelPicker()
    picker.cached_free_models = [
        "mistralai/mistral-7b-instruct:free",
        "deepseek/deepseek-r1:free",
        "random/unranked-model:free"
    ]
    picker.last_fetch = time.time()
    # deepseek is preferred over mistral
    picker.penalize("deepseek/deepseek-r1:free")
    assert "deepseek" in picker.cached_free_models[1]
