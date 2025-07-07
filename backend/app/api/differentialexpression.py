from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
from utils.data_loader import load_expression, load_clinical
from scipy.stats import ttest_ind
from statsmodels.stats.multitest import multipletests

dea_api = Blueprint('dea_api', __name__, url_prefix='/api')


@dea_api.route('/dea', methods=['POST'])
def api_dea():
    data = request.json
    clinical_variable = data['clinical_variable']
    group_a = data['group_a']
    group_b = data['group_b']

    # Load and align data
    expr_df = load_expression("filtered")
    clinical_df = load_clinical('llm')
    common_samples = expr_df.index.intersection(clinical_df.index)
    expr_df = expr_df.loc[common_samples]
    clinical_df = clinical_df.loc[common_samples]

    group1 = expr_df[clinical_df[clinical_variable] == group_a]
    group2 = expr_df[clinical_df[clinical_variable] == group_b]
    if group1.shape[0] < 2 or group2.shape[0] < 2:
        return jsonify({'error': 'Not enough samples per group.'}), 400

    # Vectorized t-test and log2FC
    t_stat, p_val = ttest_ind(group1, group2, axis=0, nan_policy='omit', equal_var=False)
    p_adj = multipletests(p_val, method="fdr_bh")[1]
    mean1 = group1.mean(axis=0)
    mean2 = group2.mean(axis=0)
    log2fc = mean1 - mean2

    de_results = pd.DataFrame({
        "gene": expr_df.columns,
        "t_stat": t_stat,
        "p_value": p_val,
        "p_adj": p_adj,
        "log2FC": log2fc
    })

    # Replace NaN/inf with None for JSON
    de_results.replace([np.inf, -np.inf], np.nan, inplace=True)
    de_results = de_results.where(pd.notnull(de_results), None)

    # Top 20 genes for table
    table = (
        de_results
        .sort_values('p_adj')
        .head(20)
        .to_dict(orient='records')
    )

    # Send full results for plotting
    volcano_data = {
        "log2fc": de_results["log2FC"].tolist(),
        "neglog10p": [-np.log10(p) if p and p > 0 else 0 for p in de_results["p_value"]],
        "p_adj": de_results["p_adj"].tolist(),
        "gene": de_results["gene"].tolist(),
    }

    # For the heatmap, send top 20 genes expression values (across both groups)
    top_genes = de_results.sort_values('p_adj').head(20)["gene"].tolist()
    heatmap_data = pd.concat([group1, group2])[top_genes].T
    # Send as a dict with genes, sample IDs, and values
    heatmap = {
        "genes": list(heatmap_data.index),
        "samples": list(heatmap_data.columns.astype(str)),
        "values": heatmap_data.values.tolist()
    }

    return jsonify({
        "table": table,
        "volcano_data": volcano_data,
        "heatmap_data": heatmap
    })


@dea_api.route('/clinical_variables', methods=['GET'])
def api_clinical_variables():
    clinical_df = load_clinical('llm')
    clinical_vars = []
    for col in clinical_df.columns:
        values = clinical_df[col].dropna().unique().tolist()
        # Only add categorical variables (not continuous)
        if len(values) > 1 and len(values) < 25 and clinical_df[col].dtype in [object, 'category', 'bool']:
            clinical_vars.append({
                "name": col,
                "groups": sorted([str(v) for v in values])
            })
    return jsonify(clinical_vars)
