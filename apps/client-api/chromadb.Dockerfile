# Use the official ChromaDB server image
FROM chromadb/chroma:latest

# Expose default Chroma port
EXPOSE 8000

# Start the Chroma server
CMD ["chromadb", "run", "--host", "0.0.0.0", "--port", "8000"]
