import os
import pandas as pd

def load_expression(matrix_choice):
    if matrix_choice == "median_centered":
        path = os.getenv("EXPR_MEDIAN_CENTERED")
    elif matrix_choice == "zscored":
        path = os.getenv("EXPR_ZSCORED")
    else:
        raise ValueError("Unknown matrix choice")
    return pd.read_csv(path, index_col=0)

def load_clinical():
    path = os.getenv("CLINICAL")
    return pd.read_csv(path, index_col=0)
