#!/bin/bash
# Compare data directory sizes

echo "=== Data Directory Size Analysis ==="
echo ""

if [ -z "$DATA_DIR" ]; then
    echo "Error: DATA_DIR environment variable is not set."
    echo "Please set DATA_DIR to the base directory of your data files."
    exit 1
fi
cd "$DATA_DIR"

echo "Total data directory size:"
du -sh . 2>/dev/null

echo ""
echo "Individual file sizes (largest first):"
du -sh * 2>/dev/null | sort -hr

echo ""
echo "=== Files included in Docker image ==="
echo "parquet/ directory:"
du -sh parquet/ 2>/dev/null

echo "GSE96058_clinical_metadata_cleaned.csv:"
du -sh GSE96058_clinical_metadata_cleaned.csv 2>/dev/null

echo ""
echo "=== Files excluded from Docker image ==="
echo "Large files that will NOT be copied to Raspberry Pi:"

# List excluded files with sizes
excluded_files=(
    "GSE96058_family.soft.gz"
    "GSE96058_gene_expression_3273_samples_and_136_replicates_transformed.csv"
    "GSE96058_median_centered.csv"
    "GSE96058_zscored.csv"
    "GSE96058_filtered.csv"
    "GSE96058_combined_expression_and_metadata.csv"
    "expression_median_tidy.csv"
    "expression_zscored_tidy.csv"
    "data.sqlite3"
    "GSE96058-GPL11154_series_matrix.txt"
    "GSE96058_UCSC_hg38_knownGenes_22sep2014.gtf"
    "GSE96058_family.xml"
)

total_excluded=0
for file in "${excluded_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -sh "$file" | cut -f1)
        echo "  - $file: $size"
        # Convert to KB for calculation (rough estimate)
        size_kb=$(du -k "$file" | cut -f1)
        total_excluded=$((total_excluded + size_kb))
    fi
done

echo ""
echo "Estimated space saved: $(echo $total_excluded | awk '{printf "%.1f MB", $1/1024}')"

echo ""
echo "=== Summary ==="
included_size=$(du -sk parquet/ GSE96058_clinical_metadata_cleaned.csv 2>/dev/null | awk '{sum+=$1} END {printf "%.1f MB", sum/1024}')
echo "Data included in Docker image: $included_size"
echo "Data excluded from Docker image: $(echo $total_excluded | awk '{printf "%.1f MB", $1/1024}')"
