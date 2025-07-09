from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from utils.data_loader import load_expression, load_clinical
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import umap

umap_api = Blueprint('umap_api', __name__)

@umap_api.route('/api/umap', methods=['POST'])
def api_umap():
    data = request.json
    matrix_choice = data['matrix']
    include_clinical = data['include_clinical']

    expr_df = load_expression(matrix_choice)
    clinical_df = load_clinical('onehot')  

    # Align
    common_samples = expr_df.index.intersection(clinical_df.index)
    expr_df = expr_df.loc[common_samples]
    clinical_df = clinical_df.loc[common_samples]

    # Z-score if needed
    if matrix_choice == "median_centered":
        expr_df = pd.DataFrame(
            StandardScaler().fit_transform(expr_df),
            index=expr_df.index,
            columns=expr_df.columns
        )

    # Handle clinical features for integration if requested (as in your notebook)
    id_columns = [
        'last_update_date__Mar 12 2018', 'last_update_date__May 04 2022',
        'instrument model__HiSeq 2000', 'instrument model__NextSeq 500',
        "er prediction mgc", "pgr prediction mgc", "her2 prediction mgc", "ki67 prediction mgc",
        "nhg prediction mgc", "er prediction sgc", "pgr prediction sgc", "her2 prediction sgc", "ki67 prediction sgc"
    ]
    clinical_features = clinical_df.select_dtypes(include=[np.number]).drop(
        columns=[col for col in id_columns if col in clinical_df.columns],
        errors='ignore'
    )
    clinical_features = clinical_features.loc[expr_df.index]
    onehot_cols = [col for col in clinical_features.columns if set(clinical_features[col].dropna().unique()) <= {0, 1}]
    numeric_cols = [col for col in clinical_features.columns if col not in onehot_cols]
    imp_num = SimpleImputer(strategy="mean")
    imp_bin = SimpleImputer(strategy="constant", fill_value=0)
    clinical_numeric = pd.DataFrame(
        imp_num.fit_transform(clinical_features[numeric_cols]),
        columns=numeric_cols, index=clinical_features.index
    )
    clinical_onehot = pd.DataFrame(
        imp_bin.fit_transform(clinical_features[onehot_cols]),
        columns=onehot_cols, index=clinical_features.index
    )
    clinical_imputed = pd.concat([clinical_numeric, clinical_onehot], axis=1)
    clinical_scaled = StandardScaler().fit_transform(clinical_imputed)

    # PCA on gene expression
    pca = PCA(n_components=min(100, expr_df.shape[1]), random_state=42)
    X_pca = pca.fit_transform(expr_df)

    # Combine as needed
    if include_clinical:
        X = np.hstack([X_pca, clinical_scaled])
    else:
        X = X_pca

    reducer = umap.UMAP(random_state=42)
    X_umap = reducer.fit_transform(X)

    # --- PAM50 Subtype extraction ---
    # Try single column first
    if "pam50_subtype" in clinical_df.columns:
        pam50 = clinical_df["pam50_subtype"].astype(str).tolist()
    else:
        # Reconstruct from one-hot columns
        subtype_cols = [col for col in clinical_df.columns if col.startswith("pam50 subtype__")]
        if subtype_cols:
            onehot = clinical_df[subtype_cols]
            pam50 = onehot.idxmax(axis=1).str.replace("pam50 subtype__", "").tolist()
        else:
            pam50 = ["Unknown"] * expr_df.shape[0]

    sample_ids = expr_df.index.tolist()

    # Optional: return the unique subtypes for the legend
    unique_subtypes = sorted(list(set(pam50)))

    return jsonify({
        "umap_coords": X_umap.tolist(),
        "pam50_subtypes": pam50,
        "unique_subtypes": unique_subtypes,
        "sample_ids": sample_ids
    })
