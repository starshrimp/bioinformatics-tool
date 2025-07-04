# Dockerfile (in /backend)
FROM python:3.10-slim

WORKDIR /app

COPY app/ ./app/
COPY requirements.txt .

COPY data/parquet/ ./data/parquet/
COPY data/GSE96058_clinical_metadata_cleaned.csv ./data/
COPY .env /app/.env



RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "app/main.py"]
