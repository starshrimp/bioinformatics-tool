# bioinformatics-tool

# Analysis
## 1. Data Download & Preprocessing

**Overview & Reasoning**  


### Key Steps & Insights**
To download, understand and preprocess the data, these steps were taken:
- Downloaded [gene expression](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE96058) and clinical metadata as SOFT (Simple Omnibus Format in Text) using the GEOparse package.
- Read [original study of the dataset](https://pubmed.ncbi.nlm.nih.gov/32913985/) and the [paper on the preprocessing](https://pubmed.ncbi.nlm.nih.gov/32913985/)



#### Gene Expression Data
1. Transposition: despite common practice of gene x samples default for most microarray, RNA-seq, and general bioinformatics data formats -> but for ML more practical
2. Removal of Constant & Low Expression Genes
3. Quality Check:
  - Distribution of Expression across Samples: remove top 1% highest and 1% lowest expression samples
  - Highest number of unexpressed Genes -> remove 1% of lowest 
  - Analyse Technical Replicates: Strategy
    - good agreement (>0.95 pearson): average the original and the technical replicate
    - bad agreement: (<0.95 pearson): only keep original (this applies only to two samples)
4. Z-Scoring: used for some used, for others just filtered

#### Clinical Metadata
1. Removal of constant columns, duplicate columns & identifiers
2. Preprocessing:
  - replace "NA" strings with np.nan
  - Numeric Columns: transformation to numeric
  - Binary Columns: encode so all are 0 or 1
  - Ordinal Columns: label encode
  - Non-ordinal Columns: one-hot encode (but keep originals for now) -> "OG_" columns are the originals and "OHE_" the one hot encoded ones
3. List Columns we might remove later (e.g. "prediction" columns)
4. Analyse Missingness of Data
4. Imputation: kNN



**Notebooks & Scripts**
- [`01_data_preprocessing_expr.ipynb`](analysis/01_data_preprocessing_expr.ipynb) — Gene expression data download & cleaning
- [`02_data_preprocessing_clinical.ipynb`](analysis/02_data_preprocessing_clinical.ipynb) — Clinical metadata download & cleaning

**Outputs**
- [`backend/data/GSE96058_filtered.csv`] - Filtered (no z-scoring / median-centering )
- [`backend/data/GSE96058_collapsed.csv`] - Collapsed (no more technical replicates)
- [`backend/data/GSE96058_zscored_quality_checked.csv`] - Collapsed (no more technical replicates) & Z-scored

---

## [2]. Clinical Metadata Analysis

**Overview & Reasoning**  
Characterize and compare clinical variables & uncover clinical patterns.

**Key Steps & Insights**
- Explored distributions of continuous, categorical, and ordinal clinical features.
- Visualized key variables (age, tumor size, lymph node group, NHG, survival) overall and by PAM50 subtype.
- Converted ordinal features to proper categorical types for robust analysis.
- Used Kruskal-Wallis tests to assess group differences, finding all key variables differed significantly between subtypes.
- Identified notable clinical heterogeneity among breast cancer subtypes.

**Notebooks & Scripts**
- [`03_data_analysis.ipynb`](analysis/03_data_analysis.ipynb) — Data Analysis of Clinical Metadata


---

## 3. Principal Component Analysis (PCA)

**Overview & Reasoning**  
Applied PCA to gene expression data to reduce dimensionality, visualize sample structure, and identify major sources of variation.

**Key Steps & Insights**
- Standardized gene expression data prior to PCA.
- Computed principal components and explained variance ratios.
- Visualized samples in PC1 vs PC2 space, colored by clinical subtypes.
- Identified clustering patterns and outliers.
- Assessed contribution of top genes to principal components.

**Note:**  
PCA was not very successful in explaining the variance; the first few principal components captured only a small fraction of the total variance, indicating high complexity and heterogeneity in the gene expression data.

**Notebooks & Scripts**
- [`04_PCA.ipynb`](analysis/04_PCA.ipynb) — Principal Component Analysis

**Outputs**
- PCA plots (e.g., PC1 vs PC2 colored by subtype)
- Explained variance summary
- Top contributing genes per principal component


---

## 4. UMAP Visualization

**Overview & Reasoning**  
Used UMAP (Uniform Manifold Approximation and Projection) to visualize high-dimensional gene expression data, aiming to uncover sample structure, clusters, and relationships not captured by PCA.

**Key Steps & Insights**
- Applied UMAP to gene expression data filtered for key biomarkers and PAM50 genes.
- Tuned UMAP parameters (n_neighbors, min_dist) for optimal separation and cluster clarity.
- Visualized samples in 2D UMAP space, colored by clinical subtypes and biomarker status.
- Compared UMAP results to PCA, observing improved separation of subtypes and clearer cluster boundaries.

**Notebooks & Scripts**
- [`05_UMAP_Biomarkers.ipynb`](analysis/05_UMAP_Biomarkers.ipynb) — UMAP on biomarker genes
- [`05_UMAP_PAM50.ipynb`](analysis/05_UMAP_PAM50.ipynb) — UMAP on PAM50 genes

**Outputs**
- UMAP plots (colored by subtype, biomarker status)
- Cluster assignments and outlier lists
- Parameter tuning summary

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