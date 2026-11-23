import json
import re
import asyncio
import httpx
from typing import Optional, Type, TypeVar, List, Dict, Any, Callable
from pydantic import BaseModel
from app.config import settings
from app.gateway.key_pool import key_pool, AllKeysExhaustedException
from app.gateway.model_picker import model_picker
from app.gateway.cache import compute_cache_key, get_cached_response, put_cached_response

T = TypeVar("T", bound=BaseModel)
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def clean_json_markdown(text: str) -> str:
    """Strips markdown code fences (```json ... ```) and trailing commas."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n", "", text)
        text = re.sub(r"\n```$", "", text)
    # Match outermost JSON object or array
    match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
    if match:
        return match.group(0).strip()
    return text.strip()

class ChatGateway:
    def __init__(self):
        pass

    async def chat(
        self,
        messages: List[Dict[str, str]],
        schema: Optional[Type[T]] = None,
        max_attempts: int = 8,
        temperature: float = 0.2,
        on_event: Optional[Callable[[str], None]] = None
    ) -> Any:
        """
        Executes an LLM chat completion through the central gateway.
        Guarantees key rotation, model fallback, schema self-repair, and caching.
        """
        schema_name = schema.__name__ if schema else None
        cache_key = compute_cache_key(messages, schema_name)

        # 1. Check SQLite Cache
        cached_val = await get_cached_response(cache_key)
        if cached_val:
            if on_event:
                on_event("Cache hit (instant)")
            if schema:
                try:
                    return schema.model_validate_json(cached_val)
                except Exception:
                    pass
            else:
                return cached_val

        last_error = ""

        # 2. Key + Model Retry Loop
        for attempt in range(max_attempts):
            key = await key_pool.acquire()
            ranked_models = await model_picker.get_ranked_models()
            model = ranked_models[min(attempt, len(ranked_models) - 1)]

            headers = {
                "Authorization": f"Bearer {key.key}",
                "HTTP-Referer": settings.APP_REFERER,
                "X-Title": settings.APP_TITLE,
                "Content-Type": "application/json"
            }

            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "response_format": {"type": "json_object"} if schema else None
            }

            if on_event:
                on_event(f"Request via {key.alias} using {model}")

            try:
                async with httpx.AsyncClient(timeout=75.0) as client:
                    resp = await client.post(OPENROUTER_URL, headers=headers, json=payload)

                status = resp.status_code

                if status == 200:
                    data = resp.json()
                    choices = data.get("choices", [])
                    if not choices:
                        model_picker.penalize(model)
                        continue

                    raw_text = choices[0].get("message", {}).get("content", "")
                    if not raw_text.strip():
                        model_picker.penalize(model)
                        continue

                    cleaned = clean_json_markdown(raw_text)

                    # Validate with Pydantic if schema requested
                    if schema:
                        try:
                            parsed_obj = schema.model_validate_json(cleaned)
                            await put_cached_response(cache_key, model, json.dumps(messages), cleaned)
                            await key_pool.report_status(key, 200)
                            return parsed_obj
                        except Exception as val_err:
                            # One-shot self-repair call
                            repaired = await self._repair_json(client, key, model, raw_text, str(val_err), schema)
                            if repaired:
                                await put_cached_response(cache_key, model, json.dumps(messages), repaired.model_dump_json())
                                await key_pool.report_status(key, 200)
                                return repaired
                            model_picker.penalize(model)
                            continue

                    # Plain text response
                    await put_cached_response(cache_key, model, json.dumps(messages), cleaned)
                    await key_pool.report_status(key, 200)
                    return cleaned

                # Handle HTTP Status Failures
                retry_after = None
                if "Retry-After" in resp.headers:
                    try:
                        retry_after = int(resp.headers["Retry-After"])
                    except ValueError:
                        pass

                error_msg = f"HTTP {status}: {resp.text[:200]}"
                last_error = error_msg
                await key_pool.report_status(key, status, retry_after=retry_after, error_msg=error_msg)

                if status == 404:
                    model_picker.ban(model, duration_seconds=21600)
                elif status == 429:
                    if on_event:
                        on_event(f"{key.alias} rate limited (429) -> rotating key")

                # Backoff before next attempt
                await asyncio.sleep(min(2 ** attempt, 8))

            except httpx.RequestError as req_err:
                last_error = str(req_err)
                await key_pool.report_status(key, 500, error_msg=last_error)
                await asyncio.sleep(min(2 ** attempt, 8))

        raise RuntimeError(f"ChatGateway failed after {max_attempts} attempts. Last error: {last_error}")

    async def _repair_json(
        self,
        client: httpx.AsyncClient,
        key: Any,
        model: str,
        bad_json: str,
        error_str: str,
        schema: Type[T]
    ) -> Optional[T]:
        """One-shot prompt to repair schema validation errors."""
        repair_messages = [
            {"role": "system", "content": "You are a JSON repair tool. Output only the corrected valid JSON matching the schema, with no preamble."},
            {"role": "user", "content": f"Schema:\n{json.dumps(schema.model_json_schema())}\n\nInvalid JSON:\n{bad_json}\n\nValidation Error:\n{error_str}\n\nProvide the corrected JSON:"}
        ]
        try:
            r = await client.post(
                OPENROUTER_URL,
                headers={"Authorization": f"Bearer {key.key}", "Content-Type": "application/json"},
                json={"model": model, "messages": repair_messages, "temperature": 0.0},
                timeout=30.0
            )
            if r.status_code == 200:
                repaired_text = clean_json_markdown(r.json()["choices"][0]["message"]["content"])
                return schema.model_validate_json(repaired_text)
        except Exception:
            pass
        return None

gateway = ChatGateway()
