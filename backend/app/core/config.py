import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
env_path = ROOT_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings(BaseModel):
    PROJECT_NAME: str = "E-Commerce Decision Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    ROOT_DIR: Path = ROOT_DIR
    DATA_DIR: Path = Path(os.getenv("DATA_DIR", "./Dataset")).resolve() if not Path(os.getenv("DATA_DIR", "./Dataset")).is_absolute() else Path(os.getenv("DATA_DIR", "./Dataset"))
    PARQUET_DIR: Path = (ROOT_DIR / os.getenv("PARQUET_DIR", "./data/parquet")).resolve()
    MODEL_DIR: Path = (ROOT_DIR / os.getenv("MODEL_DIR", "./models")).resolve()
    CACHE_DIR: Path = (ROOT_DIR / os.getenv("CACHE_DIR", "./data/processed")).resolve()

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")
    ]

    DUCKDB_MEMORY_LIMIT: str = os.getenv("DUCKDB_MEMORY_LIMIT", "8GB")
    DUCKDB_THREADS: int = int(os.getenv("DUCKDB_THREADS", "6"))
    RANDOM_STATE: int = int(os.getenv("RANDOM_STATE", "42"))

    def resolve_data_path(self) -> Path:
        """Resolve actual path where CSV dataset files reside."""
        if self.DATA_DIR.exists() and (self.DATA_DIR / "orders.csv").exists():
            return self.DATA_DIR
        # Fallback to local ./Dataset relative to ROOT_DIR
        alt = (self.ROOT_DIR / "Dataset").resolve()
        if alt.exists() and (alt / "orders.csv").exists():
            return alt
        return self.DATA_DIR


settings = Settings()
