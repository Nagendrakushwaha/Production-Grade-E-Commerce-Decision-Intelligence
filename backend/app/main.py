import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.api.endpoints import router as api_router
from backend.app.core.config import settings

app = FastAPI(
    title="E-Commerce Decision Intelligence Platform API",
    description="Enterprise-grade decision intelligence, statistical inference, and machine learning observatory for the Instacart dataset.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response


@app.get("/health")
def healthcheck():
    return {
        "status": "HEALTHY",
        "service": "E-Commerce Decision Intelligence Platform",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "engine": "DuckDB + Polars + PyArrow",
    }


@app.get("/")
def root():
    return {
        "message": "Welcome to the E-Commerce Decision Intelligence Platform API.",
        "docs": "/docs",
        "version": settings.VERSION,
    }


# Include main API router
app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
