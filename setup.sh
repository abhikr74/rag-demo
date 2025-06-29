#!/bin/bash

# RAG Application Setup Script
echo "🚀 Setting up RAG Application Environment..."

# Create virtual environment
python -m venv rag_env
source rag_env/bin/activate  # On Windows: rag_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Ollama (if not already installed)
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Pull Llama model
echo "Downloading Llama 3 8B model..."
ollama pull llama3:8b

echo "✅ Setup complete! Run the application with:"
echo "streamlit run rag_application.py"
