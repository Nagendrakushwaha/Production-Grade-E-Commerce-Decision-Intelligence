import duckdb
from pathlib import Path
from typing import Optional
from backend.app.core.config import settings


class DuckDBManager:
    _instance: Optional["DuckDBManager"] = None
    _con: Optional[duckdb.DuckDBPyConnection] = None

    def __init__(self):
        self._init_connection()

    def _init_connection(self):
        self._con = duckdb.connect(database=":memory:", read_only=False)
        self._con.execute(f"SET memory_limit = '{settings.DUCKDB_MEMORY_LIMIT}'")
        self._con.execute(f"SET threads = {settings.DUCKDB_THREADS}")
        self._register_views()

    def _register_views(self):
        """Register views pointing to parquet files if they exist, or raw CSVs if not."""
        parquet_dir = settings.PARQUET_DIR
        data_dir = settings.resolve_data_path()

        tables = [
            "aisles",
            "departments",
            "products",
            "orders",
            "order_products__train",
            "order_products__prior",
        ]

        for table in tables:
            pq_file = parquet_dir / f"{table}.parquet"
            csv_file = data_dir / f"{table}.csv"

            if pq_file.exists():
                escaped_path = str(pq_file).replace("\\", "/")
                self._con.execute(f"CREATE OR REPLACE VIEW {table} AS SELECT * FROM read_parquet('{escaped_path}')")
            elif csv_file.exists():
                escaped_path = str(csv_file).replace("\\", "/")
                self._con.execute(f"CREATE OR REPLACE VIEW {table} AS SELECT * FROM read_csv_auto('{escaped_path}')")

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        if self._con is None:
            self._init_connection()
        return self._con

    def refresh_views(self):
        """Call after parquet ingestion completes to switch from CSV to Parquet views."""
        self._register_views()

    def query(self, sql: str, params: Optional[list] = None):
        """Execute query and return list of dicts."""
        con = self.get_connection()
        if params:
            rel = con.execute(sql, params)
        else:
            rel = con.execute(sql)
        df = rel.fetchdf()
        return df.to_dict(orient="records")

    def query_df(self, sql: str, params: Optional[list] = None):
        """Execute query and return pandas DataFrame."""
        con = self.get_connection()
        if params:
            return con.execute(sql, params).fetchdf()
        return con.execute(sql).fetchdf()

    def query_arrow(self, sql: str, params: Optional[list] = None):
        """Execute query and return PyArrow Table."""
        con = self.get_connection()
        if params:
            return con.execute(sql, params).fetch_arrow_table()
        return con.execute(sql).fetch_arrow_table()


db_manager = DuckDBManager()
