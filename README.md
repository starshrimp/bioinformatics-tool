# bioinformatics-tool

# Analysis
## 1. Data Download & Preprocessing

**Overview & Reasoning**  


### Key Steps & Insights**
To download, understand and preprocess the data, these steps were taken:
- Downloaded [gene expression](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE96058) and clinical metadata as SOFT (Simple Omnibus Format in Text) using the GEOparse package.
- Read [original study of the dataset](https://pubmed.ncbi.nlm.nih.gov/32913985/) and the [paper on the preprocessing](https://pubmed.ncbi.nlm.nih.gov/32913985/)



#### Gene Expression Data:
1. Transposition: despite common practice of gene x samples default for most microarray, RNA-seq, and general bioinformatics data formats -> but for ML more practical
2. Removal of Constant & Low Expression Genes
3. Quality Check:
  - Distribution of Expression accross Samples: remove top 1% highest and 1% lowest expression samples
  - Highest number of unexpressed Genes -> remove 1% of lowest 
  - Analyse Technical Replicates: Strategy
    - good agreement (>0.95 pearson): average the original and the technical replicate
    - bad agreement: (<0.95 pearson): only keep original (this applies only to two samples)
4. Z-Scoring: used for some used, for others just filtered



**Notebooks & Scripts**
- [01_data_preprocessing_expr.ipynb`](analysis/01_data_preprocessing_expr.ipynb) — Gene expression data download & cleaning
- [`00_data_download_preprocessing_clinical.ipynb`](notebooks/00_data_download_preprocessing_clinical.ipynb) — Clinical metadata download & cleaning

**Outputs**
- [`data/processed/expression_clean.csv`](data/processed/expression_clean.csv)
- [`data/processed/clinical_clean.csv`](data/processed/clinical_clean.csv)

---

## [N]. [Next Section Title]

**Overview & Reasoning**  
Brief explanation of the aims, logic, and choices.

**Key Steps & Insights**
- Main actions/decisions
- Major findings or issues noted here

**Notebooks & Scripts**
- `[notebook/script name and link]`

**Outputs**
- `[relevant files, e.g., figures, processed data, etc.]`

---
