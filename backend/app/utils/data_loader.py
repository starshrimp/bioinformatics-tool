import os
import pandas as pd
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# (assuming backend/app/utils/)
BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_full_path(relative_path):
    return os.path.join(BACKEND_ROOT, relative_path)


def load_expression(matrix_choice):
    logging.basicConfig(level=logging.INFO)
    if matrix_choice == "median_centered":
        path = os.getenv("MEDIAN_CENTERED_PARQUET")
    elif matrix_choice == "zscored":
        path = os.getenv("ZSCORED_PARQUET")
    elif matrix_choice == "filtered":
        path = os.getenv("FILTERED")
    else:
        logging.info(f"Matrix choice: {matrix_choice}")
        raise ValueError(f"Unknown matrix choice {matrix_choice}")
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

def load_clinical(clinical_choice):
    logging.info(f"Loading clinical data with choice: {clinical_choice}")
    if clinical_choice == "onehot":
        path = os.getenv("CLINICAL")
    elif clinical_choice == "llm":
        path = os.getenv("CLINICAL_LLM")
    if not path:
        raise ValueError("File path for clinical data is not set!")
    path = get_full_path(path)
    if path.endswith('.parquet'):
        return pd.read_parquet(path)
    elif path.endswith('.csv'):
        return pd.read_csv(path, index_col=0)
    else:
        raise ValueError("Unsupported file format for clinical data: " + path)
