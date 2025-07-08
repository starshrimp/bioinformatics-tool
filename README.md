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



**Notebooks & Scripts**
- [`00_data_download_preprocessing_expression.ipynb`](notebooks/00_data_download_preprocessing_expression.ipynb) — Gene expression data download & cleaning
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
