FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy only dependency files first (for layer caching)
COPY pyproject.toml ./

# Install dependencies only (NOT the project itself)
RUN uv pip install --system \
    fastapi \
    uvicorn \
    bcrypt \
    cloudinary \
    email-validator \
    firebase-admin \
    python-dotenv \
    python-multipart \
    razorpay

# Copy the rest of the backend code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
