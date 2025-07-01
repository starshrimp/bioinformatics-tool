import os
import sqlite3
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=(Path(__file__).resolve().parent.parent / 'analysis' / '.env'))


# File paths
DATA_DIR = Path("data")
OUT_PATH = Path("data.sqlite3")

# Input CSVs
files = {
    "expression_median": os.getenv("MEDIAN_TIDY"),
    "expression_zscored": os.getenv("ZSCORED_TIDY"),
    "clinical_metadata": os.getenv("CLINICAL"),
}

# Connect to database (overwrite if exists)
if OUT_PATH.exists():
    OUT_PATH.unlink()

conn = sqlite3.connect(OUT_PATH)
print(f"Creating SQLite DB at: {OUT_PATH.resolve()}")

for table_name, file_path in files.items():
    print(f"Loading {file_path} into table '{table_name}'...")
    df = pd.read_csv(file_path)
    df.to_sql(table_name, conn, index=False)
    print(f"  ✅ Inserted {len(df)} rows into '{table_name}'")

# Optional: Create indexes (e.g., on sample_id or gene)
with conn:
    conn.execute("CREATE INDEX IF NOT EXISTS idx_clinical_sample ON clinical_metadata(sample_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_expr_gene ON expression_median(gene)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_expr_gene_z ON expression_zscored(gene)")

conn.close()
print("✅ Done!")
