import os
import pandas as pd
import logging

import os

# (assuming backend/app/utils/)
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_full_path(relative_path):
    return os.path.join(BACKEND_ROOT, relative_path)


def load_expression(matrix_choice):
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Current working directory: {os.getcwd()}")
    if matrix_choice == "median_centered":
        path = os.getenv("MEDIAN_CENTERED_PARQUET")
    elif matrix_choice == "zscored":
        path = os.getenv("ZSCORED_PARQUET")
    else:
        raise ValueError("Unknown matrix choice")
    if not path:
        raise ValueError(f"File path for {matrix_choice} is not set!")
    # Use the correct reader for the file type

    path = get_full_path(path)

    if path.endswith('.parquet'):
        return pd.read_parquet(path)
    elif path.endswith('.csv'):
        return pd.read_csv(path, index_col=0)
    else:
        raise ValueError("Unsupported file format for expression matrix: " + path)

def load_clinical():
    path = os.getenv("CLINICAL")
    if not path:
        raise ValueError("File path for clinical data is not set!")
    path = get_full_path(path)
    if path.endswith('.parquet'):
        return pd.read_parquet(path)
    elif path.endswith('.csv'):
        return pd.read_csv(path, index_col=0)
    else:
        raise ValueError("Unsupported file format for clinical data: " + path)
