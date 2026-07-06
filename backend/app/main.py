"""
DataSpark Backend — FastAPI Application Entry Point
Enterprise-grade configuration: CORS, middleware, routers, health check.
"""
import time
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import auth_router, users_router, projects_router, files_router, edi_router
from app.core.config import get_settings

settings = get_settings()
logger = structlog.get_logger(__name__)


# ── Lifespan (startup / shutdown) ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "DataSpark API starting",
        version=settings.app_version,
        env=settings.app_env,
    )
    yield
    logger.info("DataSpark API shutting down")


# ── Application Factory ────────────────────────────────────────────────────────
def create_application() -> FastAPI:
    app = FastAPI(
        title="DataSpark API",
        description=(
            "Enterprise AI Platform API — Developer Studio, "
            "Architecture Studio, and EDI Automation Studio."
        ),
        version=settings.app_version,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ── Middleware ─────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    # ── Request Timing & Prefix Middleware ──────────────────────────────────────
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        if request.scope["path"].startswith("/api/backend"):
            request.scope["path"] = request.scope["path"].replace("/api/backend", "", 1)
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
        return response

    # ── Routers ────────────────────────────────────────────────────────────────
    api_prefix = "/api/v1"
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(users_router, prefix=api_prefix)
    app.include_router(projects_router, prefix=api_prefix)
    app.include_router(files_router, prefix=api_prefix)
    app.include_router(edi_router, prefix=api_prefix)

    # ── Health Checks ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
    async def health_check():
        """Basic liveness probe."""
        return {"status": "ok", "version": settings.app_version}

    @app.get("/health/ready", tags=["Health"])
    async def readiness_check():
        """Readiness probe — verifies DB connectivity."""
        from app.core.database import engine
        try:
            async with engine.connect() as conn:
                await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            return {"status": "ready", "db": "connected"}
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"status": "not ready", "db": str(e)},
            )

    return app


app = create_application()
