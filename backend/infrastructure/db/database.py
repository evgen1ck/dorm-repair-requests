from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


class Database:
    def __init__(self, url: str | URL) -> None:
        self._engine = create_async_engine(url, pool_pre_ping=True)
        self.session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            self._engine, expire_on_commit=False
        )

    async def __aenter__(self) -> Database:
        return self

    async def __aexit__(self, *exc_info: object) -> None:
        await self.dispose()

    async def dispose(self) -> None:
        await self._engine.dispose()
