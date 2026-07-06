FROM python:3.12-slim

# ── System Dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Python Environment ─────────────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# ── Install Dependencies ───────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy Application Code ──────────────────────────────────────────────────────
COPY . .

# ── Health Check ───────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ── Expose Port ────────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Start Command ──────────────────────────────────────────────────────────────
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
