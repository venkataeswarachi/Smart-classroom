from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Load environment variables from .env
load_dotenv()

from data_ingestion import ingest_path
from embeddings import EmbeddingManager
from llm import GroqLLM
from retreival import RAGRetriever
from vector_db import VectorStore

app = FastAPI(title="RAG API", version="1.0.0")

# Initialize managers
embedding_manager = EmbeddingManager()
vector_store = VectorStore()
retriever = RAGRetriever(vector_store, embedding_manager)

# Initialize LLM
try:
    llm = GroqLLM()
    print("✓ Groq LLM initialized successfully!")
except ValueError as e:
    print(f"✗ Warning: {e}")
    llm = None
except Exception as e:
    print(f"✗ Error initializing LLM: {e}")
    llm = None


class IngestRequest(BaseModel):
    path: str
    chunk_size: int = 1000
    chunk_overlap: int = 200


class IngestResponse(BaseModel):
    status: str
    total_chunks: int
    message: str


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    score_threshold: float = 0.0


class RetrievedDocument(BaseModel):
    id: str
    content: str
    metadata: dict
    similarity_score: float
    rank: int


class QueryResponse(BaseModel):
    query: str
    results: List[RetrievedDocument]
    count: int


class RAGRequest(BaseModel):
    query: str
    top_k: int = 5
    score_threshold: float = 0.0


class RAGResponse(BaseModel):
    query: str
    answer: str
    sources: List[dict]
    source_count: int


@app.get("/")
def read_root():
    return {"status": "RAG API is running", "version": "1.0.0"}


@app.post("/ingest", response_model=IngestResponse)
def ingest_documents(request: IngestRequest):
    """
    Ingest PDF files from a path (file or directory).
    
    Args:
        path: Path to PDF file or directory containing PDFs
        chunk_size: Size of text chunks (default: 1000)
        chunk_overlap: Overlap between chunks (default: 200)
    
    Returns:
        IngestResponse with status and total chunks ingested
    """
    try:
        total_chunks = ingest_path(
            request.path,
            vector_store,
            embedding_manager,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap,
        )
        return IngestResponse(
            status="success",
            total_chunks=total_chunks,
            message=f"Successfully ingested {total_chunks} chunks from {request.path}",
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail=f"Path not found: {request.path}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during ingestion: {str(e)}",
        )


@app.post("/query", response_model=QueryResponse)
def query_documents(request: QueryRequest):
    """
    Query the vector store for relevant documents.
    
    Args:
        query: Search query
        top_k: Number of top results (default: 5)
        score_threshold: Minimum similarity score (default: 0.0)
    
    Returns:
        QueryResponse with retrieved documents
    """
    try:
        results = retriever.retrieve(
            request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
        )
        
        retrieved_docs = [
            RetrievedDocument(
                id=doc["id"],
                content=doc["content"],
                metadata=doc["metadata"],
                similarity_score=doc["similarity_score"],
                rank=doc["rank"],
            )
            for doc in results
        ]
        
        return QueryResponse(
            query=request.query,
            results=retrieved_docs,
            count=len(retrieved_docs),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during query: {str(e)}",
        )


@app.post("/rag", response_model=RAGResponse)
def rag_pipeline(request: RAGRequest):
    """
    Full RAG pipeline: retrieve relevant documents and generate answer using Groq LLM.
    
    Args:
        query: Search query
        top_k: Number of top results (default: 5)
        score_threshold: Minimum similarity score (default: 0.0)
    
    Returns:
        RAGResponse with generated answer and sources
    """
    if not llm:
        raise HTTPException(
            status_code=503,
            detail="LLM not initialized. Set GROQ_API_KEY environment variable.",
        )
    
    try:
        # Retrieve relevant documents
        results = retriever.retrieve(
            request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold,
        )
        
        if not results:
            return RAGResponse(
                query=request.query,
                answer="No relevant documents found to answer the question.",
                sources=[],
                source_count=0,
            )
        
        # Prepare context from retrieved documents
        context = "\n\n".join([doc["content"] for doc in results])
        
        # Generate answer using LLM
        answer = llm.generate(request.query, context)
        
        # Prepare sources
        sources = [
            {
                "source": doc["metadata"].get("source_file", "unknown"),
                "page": doc["metadata"].get("page", "N/A"),
                "similarity_score": doc["similarity_score"],
            }
            for doc in results
        ]
        
        return RAGResponse(
            query=request.query,
            answer=answer,
            sources=sources,
            source_count=len(sources),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during RAG pipeline: {str(e)}",
        )


@app.get("/status")
def get_status():
    """Get vector store status."""
    try:
        doc_count = vector_store.collection.count()
        return {
            "status": "okay",
            "documents_in_store": doc_count,
            "collection_name": vector_store.collection_name,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting status: {str(e)}",
        )
