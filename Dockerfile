# Use an official lightweight Python image
FROM python:3.10-slim

# System dependencies for unstructured, PDF, and DOCX parsing
RUN apt-get update && \
    apt-get install -y \
        build-essential \
        poppler-utils \
        tesseract-ocr \
        libmagic1 \
        python3-pip \
        && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Pre-download the SentenceTransformer model to avoid repeated downloads
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Copy application code
COPY . .

# Expose Streamlit default port
EXPOSE 8501

# Streamlit config (optional: disables telemetry, sets browser server address)
# ENV STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Run the Streamlit app
CMD ["streamlit", "run", "rag_application.py", "--server.port=8501", "--server.address=0.0.0.0"]