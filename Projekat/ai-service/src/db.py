import os
from pathlib import Path
from typing import Any, Mapping, Optional

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


_ENGINE: Optional[Engine] = None


def _load_environment() -> None:
    load_dotenv()

    project_root = Path(__file__).resolve().parents[2]
    backend_env = project_root / "backend" / ".env"
    if backend_env.exists():
        load_dotenv(backend_env, override=False)


def get_database_url() -> str:
    _load_environment()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set.")
    return database_url


def get_engine() -> Engine:
    global _ENGINE

    if _ENGINE is None:
        _ENGINE = create_engine(get_database_url(), pool_pre_ping=True)

    return _ENGINE


def execute_query(sql: str, params: Optional[Mapping[str, Any]] = None) -> list[dict[str, Any]]:
    with get_engine().connect() as connection:
        result = connection.execute(text(sql), params or {})
        return [dict(row._mapping) for row in result]


def query_dataframe(sql: str, params: Optional[Mapping[str, Any]] = None) -> pd.DataFrame:
    return pd.read_sql_query(text(sql), get_engine(), params=params or {})
