import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.core.logging import log_config
from backend.core.settings import Settings
from backend.domains.errors import ForbiddenError, NotFoundError
from backend.domains.fault_types.router import router as fault_types_router
from backend.domains.requests.router import router as requests_router
from backend.domains.rooms.router import router as rooms_router
from backend.infrastructure.db.database import Database

logger = logging.getLogger(__name__)

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.database = Database(Settings().database_url)
    logger.info("API started")
    yield
    await app.state.database.dispose()
    logger.info("API stopped")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Dormitory repair requests",
        lifespan=lifespan,
        generate_unique_id_function=lambda route: route.name,
    )

    @app.get(f"{API_PREFIX}/health", include_in_schema=False)
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.exception_handler(NotFoundError)
    async def handle_not_found(_: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": exc.detail})

    @app.exception_handler(ForbiddenError)
    async def handle_forbidden(_: Request, exc: ForbiddenError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": exc.detail})

    @app.exception_handler(Exception)
    async def handle_unexpected(_: Request, __: Exception) -> JSONResponse:
        return JSONResponse(status_code=500, content={"detail": "Внутренняя ошибка сервера"})

    app.include_router(requests_router, prefix=API_PREFIX)
    app.include_router(rooms_router, prefix=API_PREFIX)
    app.include_router(fault_types_router, prefix=API_PREFIX)
    return app


def run_api(reload: bool = False) -> None:
    settings = Settings()
    uvicorn.run(
        "backend.application.api.app:create_app",
        factory=True,
        host=settings.host,
        port=settings.port,
        reload=reload,
        log_config=log_config(settings.log_level),
        proxy_headers=True,
        forwarded_allow_ips="*",
    )
