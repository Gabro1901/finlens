import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    edgar_identity: str = os.getenv("EDGAR_IDENTITY", "Default User user@example.com")
    fred_api_key: Optional[str] = os.getenv("FRED_API_KEY")
    congress_api_key: Optional[str] = os.getenv("CONGRESS_API_KEY")
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
