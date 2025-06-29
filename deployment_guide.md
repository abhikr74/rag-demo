
# RAG Application Deployment Guide

## Quick Start

### Prerequisites
- Python 3.8+
- 8GB RAM minimum
- Ollama installed

### Installation Steps

1. **Clone/Download the application files**
   ```bash
   # Download all files to a directory
   mkdir rag-demo && cd rag-demo
   ```

2. **Run setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start the application**
   ```bash
   streamlit run rag_application.py
   ```

4. **Access the application**
   - Open browser to http://localhost:8501
   - Upload sample documents
   - Start asking questions!

## Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8501

CMD ["streamlit", "run", "rag_application.py"]
```

### Environment Variables
```bash
export OLLAMA_HOST=localhost:11434
export STREAMLIT_SERVER_PORT=8501
export STREAMLIT_SERVER_ADDRESS=0.0.0.0
```

### Scaling Considerations
- Use dedicated GPU for larger models
- Implement caching for frequently asked questions
- Consider distributed vector storage for large document sets
- Add authentication for enterprise deployment

## Monitoring and Maintenance

### Health Checks
- Monitor Ollama service status
- Check vector store integrity
- Monitor response times and accuracy

### Regular Updates
- Keep embedding models updated
- Update base LLM models periodically
- Refresh document index when content changes
