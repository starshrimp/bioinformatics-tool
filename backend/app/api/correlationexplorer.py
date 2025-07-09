from flask import Blueprint, request, jsonify
import numpy as np
import pandas as pd
import os
import requests
import xml.etree.ElementTree as ET
from openai import OpenAI
from utils.data_loader import load_expression, load_clinical




client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PUBMED_ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

correlation_api = Blueprint('correlation_api', __name__, url_prefix='/api')

@correlation_api.route('/top_correlations', methods=['GET'])
def top_correlations():
    corr_type = request.args.get('type', 'gene_gene')
    preset_feature = request.args.get('feature', None) 
    expr_df = load_expression("filtered")
    clinical_onehot = load_clinical('onehot') 

    clinical_onehot = clinical_onehot[[col for col in clinical_onehot.columns if 'prediction' not in col.lower()]]

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
        if preset_feature:  # If filtering for one gene or one clinical variable
            results = []
            if preset_feature in expr_df.columns:  # Preset is a gene
                for clin in clinical_num.columns:
                    try:
                        corr = np.corrcoef(expr_df[preset_feature], clinical_num[clin])[0, 1]
                    except Exception:
                        corr = None
                    if corr is not None and not np.isnan(corr):
                        results.append({"feature_1": preset_feature, "feature_2": clin, "correlation": corr})
            elif preset_feature in clinical_num.columns:  # Preset is a clinical
                for gene in expr_df.columns:
                    try:
                        corr = np.corrcoef(expr_df[gene], clinical_num[preset_feature])[0, 1]
                    except Exception:
                        corr = None
                    if corr is not None and not np.isnan(corr):
                        results.append({"feature_1": gene, "feature_2": preset_feature, "correlation": corr})
            results = sorted(results, key=lambda x: abs(x["correlation"]), reverse=True)[:20]
        else:
            # Default: all gene-clinical pairs
            results = []
            for gene in expr_df.columns:
                for clin in clinical_num.columns:
                    try:
                        corr = np.corrcoef(expr_df[gene], clinical_num[clin])[0, 1]
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


def search_pubmed(query, max_results=5):
    params = {
        'db': 'pubmed',
        'term': query,
        'retmode': 'json',
        'retmax': max_results
    }
    r = requests.get(PUBMED_ESEARCH_URL, params=params)
    ids = r.json()['esearchresult']['idlist']
    return ids

def fetch_abstracts(pubmed_ids):
    if not pubmed_ids:
        return []
    fetch_params = {
        'db': 'pubmed',
        'id': ','.join(pubmed_ids),
        'retmode': 'xml'
    }
    r = requests.get(PUBMED_EFETCH_URL, params=fetch_params)
    root = ET.fromstring(r.content)
    results = []
    for article in root.findall(".//PubmedArticle"):
        pmid = article.findtext(".//PMID")
        title = article.findtext(".//ArticleTitle")
        abstract = article.findtext(".//Abstract/AbstractText")
        results.append({
            "pmid": pmid,
            "title": title,
            "abstract": abstract
        })
    return results

def summarize_with_openai(prompt):
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=500
    )
    return response.choices[0].message.content


@correlation_api.route('/explore_correlation', methods=['POST'])
def explore_correlation():
    data = request.json
    feature_1 = data.get('feature_1')
    feature_2 = data.get('feature_2')

    query = f'"{feature_1}" AND "{feature_2}" AND human'
    pubmed_ids = search_pubmed(query, max_results=5)
    if not pubmed_ids:
        return jsonify({"summary": f"No relevant publications found in PubMed for {feature_1} and {feature_2}."})

    abstracts = fetch_abstracts(pubmed_ids)
    if not abstracts:
        return jsonify({"summary": "No abstracts found for these PubMed IDs."})

    # Prepare abstracts for prompt
    formatted = "\n\n".join(
        f"Title: {a['title']}\nAbstract: {a['abstract']}" for a in abstracts if a['abstract']
    )
    citation_list = [f"https://pubmed.ncbi.nlm.nih.gov/{a['pmid']}/" for a in abstracts if a['pmid']]

    # LLM prompt
    prompt = (
        f"Given the following abstracts from PubMed, what is currently known about the relationship or correlation between '{feature_1}' and '{feature_2}' in human studies? "
        "Summarize any key findings, and list up to 5 relevant citations (PubMed links) in your answer if possible.\n\n"
        f"{formatted}\n\n"
        f"Citations:\n" + "\n".join(citation_list)
    )

    llm_answer = summarize_with_openai(prompt)

    return jsonify({
        "summary": llm_answer,
        "citations": citation_list
    })

@correlation_api.route('/list_genes', methods=['GET'])
def list_genes():
    expr_df = load_expression("filtered")
    return jsonify(sorted(expr_df.columns.tolist()))

@correlation_api.route('/list_clinical', methods=['GET'])
def list_clinical():
    clinical_onehot = load_clinical('onehot')
    # Optionally filter out predictions or non-user-facing columns
    clinical_cols = [col for col in clinical_onehot.columns if 'prediction' not in col.lower()]
    return jsonify(sorted(clinical_cols))
