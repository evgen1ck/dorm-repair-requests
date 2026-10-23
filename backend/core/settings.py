from datetime import timedelta
from zoneinfo import ZoneInfo

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str
    postgres_password: str
    postgres_db: str
    secret_key: str
    access_token_ttl: timedelta = timedelta(hours=12)
    cookie_secure: bool = False
    timezone: ZoneInfo = ZoneInfo("Europe/Moscow")
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    @property
    def database_url(self) -> URL:
        return URL.create(
            "postgresql+asyncpg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )
