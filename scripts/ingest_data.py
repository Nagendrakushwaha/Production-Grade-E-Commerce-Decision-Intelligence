import json
import os
import sys
import time
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

import duckdb
from backend.app.core.config import settings

# Ensure utf-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def run_ingestion():
    print("=" * 70)
    print("E-COMMERCE DECISION INTELLIGENCE PLATFORM: DATA INGESTION ENGINE")
    print("=" * 70)

    data_dir = settings.resolve_data_path()
    parquet_dir = settings.PARQUET_DIR
    cache_dir = settings.CACHE_DIR

    parquet_dir.mkdir(parents=True, exist_ok=True)
    cache_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Raw Dataset Directory:   {data_dir}")
    print(f"[*] Target Parquet Directory: {parquet_dir}")

    required_files = [
        "aisles.csv",
        "departments.csv",
        "products.csv",
        "orders.csv",
        "order_products__train.csv",
        "order_products__prior.csv",
    ]

    missing = [f for f in required_files if not (data_dir / f).exists()]
    if missing:
        print(f"[!] ERROR: Missing required CSV files in {data_dir}: {missing}")
        sys.exit(1)

    con = duckdb.connect()
    con.execute(f"SET memory_limit = '{settings.DUCKDB_MEMORY_LIMIT}'")
    con.execute(f"SET threads = {settings.DUCKDB_THREADS}")

    summary = {
        "tables": {},
        "totals": {},
        "ingestion_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    start_all = time.time()

    for filename in required_files:
        table_name = filename.replace(".csv", "")
        csv_path = str(data_dir / filename).replace("\\", "/")
        parquet_path = str(parquet_dir / f"{table_name}.parquet").replace("\\", "/")

        csv_size_mb = os.path.getsize(data_dir / filename) / (1024 * 1024)
        print(f"\n--> Ingesting {filename} ({csv_size_mb:.2f} MB)...")

        t0 = time.time()

        # Stream CSV to Parquet using DuckDB
        copy_sql = f"""
            COPY (SELECT * FROM read_csv_auto('{csv_path}'))
            TO '{parquet_path}' (FORMAT PARQUET, COMPRESSION 'ZSTD')
        """
        con.execute(copy_sql)
        duration = time.time() - t0

        pq_size_mb = os.path.getsize(parquet_dir / f"{table_name}.parquet") / (1024 * 1024)
        row_count = con.execute(f"SELECT count(*) FROM read_parquet('{parquet_path}')").fetchone()[0]

        schema_res = con.execute(f"DESCRIBE SELECT * FROM read_parquet('{parquet_path}') LIMIT 1").fetchall()
        columns = [{"name": row[0], "type": row[1]} for row in schema_res]

        ratio = (csv_size_mb / pq_size_mb) if pq_size_mb > 0 else 1.0
        print(f"    ✓ Processed {row_count:,} rows in {duration:.2f}s")
        print(f"    ✓ Parquet size: {pq_size_mb:.2f} MB (Compression ratio: {ratio:.1f}x)")

        summary["tables"][table_name] = {
            "row_count": row_count,
            "columns": columns,
            "csv_size_mb": round(csv_size_mb, 2),
            "parquet_size_mb": round(pq_size_mb, 2),
            "compression_ratio": round(ratio, 2),
            "ingestion_duration_sec": round(duration, 2),
        }

    # Calculate high-level core totals
    print("\n--> Calculating core enterprise metrics from actual data...")
    kpi_query = """
        SELECT
            (SELECT count(DISTINCT user_id) FROM read_parquet('{orders_pq}')) AS unique_customers,
            (SELECT count(*) FROM read_parquet('{orders_pq}')) AS total_orders,
            (SELECT count(*) FROM read_parquet('{products_pq}')) AS total_products,
            (SELECT count(*) FROM read_parquet('{aisles_pq}')) AS total_aisles,
            (SELECT count(*) FROM read_parquet('{departments_pq}')) AS total_departments,
            (SELECT count(*) FROM read_parquet('{prior_pq}')) AS total_prior_line_items,
            (SELECT count(*) FROM read_parquet('{train_pq}')) AS total_train_line_items
    """.format(
        orders_pq=str(parquet_dir / "orders.parquet").replace("\\", "/"),
        products_pq=str(parquet_dir / "products.parquet").replace("\\", "/"),
        aisles_pq=str(parquet_dir / "aisles.parquet").replace("\\", "/"),
        departments_pq=str(parquet_dir / "departments.parquet").replace("\\", "/"),
        prior_pq=str(parquet_dir / "order_products__prior.parquet").replace("\\", "/"),
        train_pq=str(parquet_dir / "order_products__train.parquet").replace("\\", "/"),
    )

    kpis = con.execute(kpi_query).fetchone()
    summary["totals"] = {
        "unique_customers": kpis[0],
        "total_orders": kpis[1],
        "total_products": kpis[2],
        "total_aisles": kpis[3],
        "total_departments": kpis[4],
        "total_prior_line_items": kpis[5],
        "total_train_line_items": kpis[6],
        "total_line_items": kpis[5] + kpis[6],
        "total_ingestion_time_sec": round(time.time() - start_all, 2),
    }

    summary_file = cache_dir / "dataset_summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"\n[✓] Ingestion complete in {summary['totals']['total_ingestion_time_sec']:.2f}s!")
    print(f"[✓] Summary saved to: {summary_file}")
    print(f"    - Unique Customers:     {summary['totals']['unique_customers']:,}")
    print(f"    - Total Orders:         {summary['totals']['total_orders']:,}")
    print(f"    - Total Products:       {summary['totals']['total_products']:,}")
    print(f"    - Total Line Items:     {summary['totals']['total_line_items']:,}")
    print("=" * 70)


if __name__ == "__main__":
    run_ingestion()
