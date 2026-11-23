from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # OpenRouter Multi-Key Configuration
    OPENROUTER_KEYS: str = ""
    OPENROUTER_DAILY_CAP_PER_KEY: int = 45
    OPENROUTER_MAX_RPM_PER_KEY: int = 15
    FREE_MODEL_PREFERENCE: str = (
        "deepseek/deepseek-r1:free,"
        "meta-llama/llama-3.3-70b-instruct:free,"
        "qwen/qwen-2.5-72b-instruct:free,"
        "mistralai/mistral-7b-instruct:free"
    )

    APP_REFERER: str = "http://localhost:5173"
    APP_TITLE: str = "India Event-Impact Intelligence Tool"

    # Persistent Storage
    STORAGE_DIR: str = str(BASE_DIR / "storage")
    SQLITE_PATH: str = str(BASE_DIR / "storage" / "scanner.db")

    HOST: str = "127.0.0.1"
    PORT: int = 8000

    @property
    def key_list(self) -> List[str]:
        if not self.OPENROUTER_KEYS:
            return []
        return [k.strip() for k in self.OPENROUTER_KEYS.split(",") if k.strip()]

    @property
    def model_preferences(self) -> List[str]:
        return [m.strip() for m in self.FREE_MODEL_PREFERENCE.split(",") if m.strip()]

settings = Settings()
