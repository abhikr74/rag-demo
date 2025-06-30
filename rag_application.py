
import os
import streamlit as st
from langchain_community.document_loaders.unstructured import UnstructuredFileLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain.vectorstores import FAISS
# from langchain.llms import Ollama
from langchain_community.llms import Ollama
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import tempfile
import logging
from langchain_community.document_loaders import PyPDFLoader


# Configure logging
logging.basicConfig(level=logging.INFO)

class DocumentRAGSystem:
    """
    A complete RAG (Retrieval-Augmented Generation) system for document Q&A
    using open-source models and tools.
    """

    def __init__(self):
        """Initialize the RAG system with default configurations."""
        self.embeddings = None
        self.vector_store = None
        self.llm = None
        self.qa_chain = None
        self.setup_models()

    # def setup_models(self):
    #     """Setup the embedding model and LLM."""
    #     try:
    #         # Initialize HuggingFace embeddings (open source)
    #         self.embeddings = HuggingFaceEmbeddings(
    #             model_name="sentence-transformers/all-MiniLM-L6-v2",
    #             model_kwargs={'device': 'cpu'}
    #         )

    #         # Initialize Ollama with Llama model (open source)
    #         self.llm = Ollama(
    #             model="llama3:8b",
    #             temperature=0.1
    #         )

    #         logging.info("Models initialized successfully")

    #     except Exception as e:
    #         logging.error(f"Error initializing models: {e}")
    #         st.error(f"Error initializing models: {e}")

    def setup_models(self):
        """Setup the embedding model and LLM."""
        try:
            # Initialize HuggingFace embeddings (open source)
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'}
            )

            # Use OLLAMA_HOST env variable if set, else default to http://localhost:11434
            ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
            self.llm = Ollama(
                model="llama3:8b",
                temperature=0.1,
                base_url=ollama_host
            )

            logging.info("Models initialized successfully")

        except Exception as e:
            logging.error(f"Error initializing models: {e}")
            st.error(f"Error initializing models: {e}")

    def load_documents(self, uploaded_files):
        """Load and process uploaded documents."""
        documents = []

        for uploaded_file in uploaded_files:
            try:
                # Save uploaded file temporarily
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{uploaded_file.name.split('.')[-1]}") as tmp_file:
                    tmp_file.write(uploaded_file.getvalue())
                    tmp_file_path = tmp_file.name

                # Load document based on file type
                if uploaded_file.name.endswith('.pdf'):
                    loader = PyPDFLoader(tmp_file_path)
                elif uploaded_file.name.endswith('.txt'):
                    loader = TextLoader(tmp_file_path)
                # elif uploaded_file.name.endswith('.docx'):
                #     loader = UnstructuredWordDocumentLoader(tmp_file_path)
                elif uploaded_file.name.endswith('.docx'):
                    loader = UnstructuredFileLoader(tmp_file_path)
                else:
                    st.warning(f"Unsupported file type: {uploaded_file.name}")
                    continue

                docs = loader.load()
                documents.extend(docs)

                # Clean up temporary file
                os.unlink(tmp_file_path)

                logging.info(f"Loaded document: {uploaded_file.name}")

            except Exception as e:
                logging.error(f"Error loading {uploaded_file.name}: {e}")
                st.error(f"Error loading {uploaded_file.name}: {e}")

        return documents

    def create_vector_store(self, documents):
        """Create vector store from documents."""
        try:
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )

            texts = text_splitter.split_documents(documents)

            # Create vector store
            self.vector_store = FAISS.from_documents(
                texts,
                self.embeddings
            )

            # Setup QA chain
            self.setup_qa_chain()

            logging.info(f"Vector store created with {len(texts)} chunks")
            return True

        except Exception as e:
            logging.error(f"Error creating vector store: {e}")
            st.error(f"Error creating vector store: {e}")
            return False

    def setup_qa_chain(self):
        """Setup the question-answering chain."""
        # Custom prompt template for better responses
        prompt_template = """
        You are an AI assistant helping employees find information in company documents. 
        Use the following pieces of context to answer the question at the end. 
        If you don't know the answer based on the context, just say "I don't have enough information in the provided documents to answer that question."

        Context:
        {context}

        Question: {question}

        Helpful Answer:
        """

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )

        # Create retrieval QA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3}
            ),
            chain_type_kwargs={"prompt": PROMPT},
            return_source_documents=True
        )

    def query(self, question):
        """Query the RAG system."""
        if not self.qa_chain:
            return "Please upload and process documents first.", []

        try:
            result = self.qa_chain({"query": question})
            answer = result["result"]
            sources = result["source_documents"]

            return answer, sources

        except Exception as e:
            logging.error(f"Error querying: {e}")
            return f"Error processing query: {e}", []

def main():
    """Main Streamlit application."""
    st.set_page_config(
        page_title="Enterprise Document Q&A System",
        page_icon="📚",
        layout="wide"
    )

    st.title("🏢 Enterprise Document Q&A System")
    st.subheader("RAG-powered Internal Knowledge Management")

    # Initialize session state
    if 'rag_system' not in st.session_state:
        st.session_state.rag_system = DocumentRAGSystem()

    if 'documents_processed' not in st.session_state:
        st.session_state.documents_processed = False

    # Sidebar for document upload
    with st.sidebar:
        st.header("📁 Document Upload")

        uploaded_files = st.file_uploader(
            "Upload documents",
            type=['pdf', 'txt', 'docx'],
            accept_multiple_files=True,
            help="Upload PDF, TXT, or DOCX files"
        )

        if uploaded_files and st.button("Process Documents"):
            with st.spinner("Processing documents..."):
                documents = st.session_state.rag_system.load_documents(uploaded_files)

                if documents:
                    success = st.session_state.rag_system.create_vector_store(documents)

                    if success:
                        st.session_state.documents_processed = True
                        st.success(f"Processed {len(documents)} documents!")
                    else:
                        st.error("Failed to process documents")
                else:
                    st.error("No documents were loaded")

        # Display processing status
        if st.session_state.documents_processed:
            st.success("✅ Documents ready for querying")
        else:
            st.info("📤 Upload documents to get started")

    # Main chat interface
    col1, col2 = st.columns([2, 1])

    with col1:
        st.header("💬 Ask Questions")

        # Sample questions for demo
        sample_questions = [
            "What is our company's leave policy?",
            "How do I submit an expense report?", 
            "What are the safety procedures?",
            "Who should I contact for IT support?",
            "What are the working hours?"
        ]

        # Question input
        question = st.text_input(
            "Enter your question:",
            placeholder="Ask anything about the uploaded documents..."
        )

        # Sample questions buttons
        st.write("**Sample Questions:**")
        cols = st.columns(3)
        for i, sample_q in enumerate(sample_questions):
            if cols[i % 3].button(sample_q, key=f"sample_{i}"):
                question = sample_q

        # Process question
        if question and st.session_state.documents_processed:
            with st.spinner("Searching documents..."):
                answer, sources = st.session_state.rag_system.query(question)

                st.subheader("📝 Answer")
                st.write(answer)

                if sources:
                    st.subheader("📚 Sources")
                    for i, source in enumerate(sources):
                        with st.expander(f"Source {i+1}"):
                            st.write(source.page_content[:500] + "...")
                            if hasattr(source, 'metadata') and source.metadata:
                                st.write("**Metadata:**", source.metadata)

        elif question and not st.session_state.documents_processed:
            st.warning("Please upload and process documents first!")

    with col2:
        st.header("ℹ️ System Info")

        st.markdown("""
        **🔧 Technology Stack:**
        - **LLM:** Llama 3 8B (via Ollama)
        - **Embeddings:** Sentence Transformers
        - **Vector Store:** FAISS
        - **Framework:** LangChain
        - **Interface:** Streamlit

        **✨ Features:**
        - Multi-format document support
        - Semantic search
        - Source attribution
        - Real-time processing

        **🎯 Use Cases:**
        - Employee handbook Q&A
        - Policy documentation
        - Technical documentation
        - Training materials
        - Process guides
        """)

if __name__ == "__main__":
    main()
