# Dockerfile (in /backend)
FROM python:3.10-slim

WORKDIR /app

# Build argument to specify environment (defaults to production)
ARG ENV=production

# Copy application code
COPY app/ ./app/
COPY requirements.txt .

# Copy only essential data files (controlled by .dockerignore)
# This will copy only:
# - data/parquet/*.parquet files  
# - data/GSE96058_clinical_metadata_cleaned.csv
COPY data/parquet/ ./data/parquet/
COPY data/GSE96058_clinical_metadata_cleaned.csv ./data/

# Copy appropriate environment configuration
COPY .env.${ENV} ./.env.production


# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

CMD ["python", "app/main.py"]
