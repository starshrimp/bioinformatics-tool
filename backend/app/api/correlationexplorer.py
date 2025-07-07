from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from utils.data_loader import load_expression, load_clinical

correlation_api = Blueprint('correlation_api', __name__, url_prefix='/api')

@correlation_api.route('/top_correlations', methods=['GET'])
def top_correlations():
    corr_type = request.args.get('type', 'gene_gene')
    expr_df = load_expression("filtered")
    clinical_onehot = load_clinical('onehot')  # or your actual one-hot filename

    results = []

    if corr_type == 'gene_gene':
        # High variance genes only for speed
        top_genes = expr_df.var().sort_values(ascending=False).head(100).index
        corr_matrix = expr_df[top_genes].corr()
        for i, gene1 in enumerate(top_genes):
            for gene2 in top_genes[i+1:]:
                corr = corr_matrix.loc[gene1, gene2]
                if not np.isnan(corr):
                    results.append({"feature_1": gene1, "feature_2": gene2, "correlation": corr})
        results = sorted(results, key=lambda x: abs(x["correlation"]), reverse=True)[:20]

    elif corr_type == 'gene_clinical':
        clinical_num = clinical_onehot.select_dtypes(include=[np.number])
        for gene in expr_df.columns:
            for clin in clinical_num.columns:
                try:
                    corr = np.corrcoef(expr_df[gene], clinical_num[clin])[0,1]
                except Exception:
                    corr = None
                if corr is not None and not np.isnan(corr):
                    results.append({"feature_1": gene, "feature_2": clin, "correlation": corr})
        results = sorted(results, key=lambda x: abs(x["correlation"]), reverse=True)[:20]

    elif corr_type == 'clinical_clinical':
        clinical_num = clinical_onehot.select_dtypes(include=[np.number])
        cols = clinical_num.columns
        for i, col1 in enumerate(cols):
            for j, col2 in enumerate(cols):
                if j <= i:
                    continue
                # Exclude subfeatures with the same prefix
                prefix1 = col1.split("__")[0]
                prefix2 = col2.split("__")[0]
                if prefix1 == prefix2:
                    continue
                try:
                    corr = np.corrcoef(clinical_num[col1], clinical_num[col2])[0,1]
                except Exception:
                    corr = None
                if corr is not None and not np.isnan(corr):
                    results.append({"feature_1": col1, "feature_2": col2, "correlation": corr})
        results = sorted(results, key=lambda x: abs(x["correlation"]), reverse=True)[:5]

    else:
        return jsonify({'error': 'Invalid type'}), 400

    # No NAs
    filtered = [r for r in results if r["correlation"] is not None and not np.isnan(r["correlation"]) and not np.isinf(r["correlation"])]
    return jsonify(filtered)
