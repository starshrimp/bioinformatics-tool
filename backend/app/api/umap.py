from flask import Blueprint, request, jsonify
import numpy as np
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
    if include_clinical:
        clinical_df = load_clinical()
        numeric = clinical_df.select_dtypes(include=[np.number])
        imp = SimpleImputer(strategy="mean")
        clinical_np = imp.fit_transform(numeric.loc[expr_df.index])
        clinical_np = StandardScaler().fit_transform(clinical_np)
    else:
        clinical_np = None

    if matrix_choice == "median_centered":
        expr_df = pd.DataFrame(
            StandardScaler().fit_transform(expr_df),
            index=expr_df.index,
            columns=expr_df.columns
        )

    pca = PCA(n_components=min(100, expr_df.shape[1]), random_state=42)
    X_pca = pca.fit_transform(expr_df)

    if include_clinical and clinical_np is not None:
        X = np.hstack([X_pca, clinical_np])
    else:
        X = X_pca

    reducer = umap.UMAP(random_state=42)
    X_umap = reducer.fit_transform(X)

    kmeans = KMeans(n_clusters=5, random_state=42)
    clusters = kmeans.fit_predict(X_umap)
    sil = silhouette_score(X_umap, clusters)

    # Optionally include sample IDs
    sample_ids = expr_df.index.tolist()

    return jsonify({
        "umap_coords": X_umap.tolist(),       # shape (n_samples, 2)
        "clusters": clusters.tolist(),         # shape (n_samples,)
        "sample_ids": sample_ids,              # e.g. for tooltips/hover
        "silhouette": round(float(sil), 3),
        "n_clusters": int(np.unique(clusters).size)
    })
