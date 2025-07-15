# Breast Cancer Multi-Omics Analysis Platform

## Deployment & Website

The bioinformatics-tool is deployed as a web application accessible at [YOUR_WEBSITE_URL_HERE].  
The frontend is built with React and Material UI, providing an interactive and user-friendly interface for data exploration and analysis.

The backend runs in a Docker container on a private Raspberry Pi, ensuring lightweight and efficient server-side processing.  
All processed data is stored in Parquet format for fast access and efficient storage.

**Tech Stack:**
- **Frontend:** React, Material UI
- **Backend:** Python (Flask API), Docker, Raspberry Pi
- **Data Storage:** Parquet files


# Analysis
"""
Note: Jupyter notebooks (.ipynb) with numbers at the beginning of their filenames are the cleaned up and final versions. These are located in the 'analysis' folder. Notebooks found in the 'data prep', 'eda', 'supervised ml', and 'unsupervised ml' folders were used during the development process and are included for completeness; however, they may not be cleaned up or finalized.
"""

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

## 2. Clinical Metadata Analysis

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

## 5. Subtype Prediction

**Overview & Reasoning**  
Developed machine learning models to predict breast cancer subtypes from gene expression and clinical data. The goal was to assess predictive accuracy and identify key features driving subtype classification.

**Key Steps & Insights**
- Prepared training and test sets using filtered gene expression and clinical features.
- Evaluated multiple algorithms (e.g., Random Forest, Logistic Regression, SVM) for subtype prediction.
- Performed hyperparameter tuning and cross-validation to optimize model performance.
- Assessed model accuracy, precision, recall, and confusion matrices.
- Identified top predictive genes and clinical variables for each subtype.

**Notebooks & Scripts**
- [`06_subtypes.ipynb`](analysis/06_subtypes.ipynb) — Subtype prediction modeling and evaluation

**Outputs**
- Model performance metrics (accuracy, precision, recall, F1-score)
- Feature importance rankings
- Confusion matrices and prediction plots
- Saved trained models and prediction results

---

## 6. Biomarker Prediction

**Overview & Reasoning**  
Developed models to predict key biomarker status (e.g., ER, PR, HER2) from gene expression and clinical data. The aim was to evaluate predictive accuracy and identify features most associated with biomarker expression.

**Key Steps & Insights**
- Selected relevant biomarker targets for prediction.
- Prepared datasets with filtered gene expression and clinical features.
- Trained and evaluated multiple algorithms (Random Forest, Logistic Regression, SVM) for each biomarker.
- Performed cross-validation and hyperparameter tuning.
- Assessed model performance using accuracy, precision, recall, and ROC curves.
- Identified top predictive genes and clinical features for each biomarker.

**Notebooks & Scripts**
- [`07_biomarkers.ipynb`](analysis/07_biomarkers.ipynb) — Biomarker prediction modeling and evaluation

**Outputs**
- Model performance metrics (accuracy, precision, recall, ROC curves)
- Feature importance rankings for each biomarker
- Confusion matrices and prediction plots
- Saved trained models and prediction results

---