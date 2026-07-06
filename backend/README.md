# DataSpark Backend

Enterprise FastAPI backend for the DataSpark AI Professional Platform.

## Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # JWT dependency injection
│   │   └── routers/
│   │       ├── auth.py          # /api/v1/auth/*
│   │       ├── users.py         # /api/v1/users/*
│   │       ├── projects.py      # /api/v1/projects/*
│   │       └── files.py         # /api/v1/files/*
│   ├── core/
│   │   ├── config.py            # Pydantic-settings configuration
│   │   ├── database.py          # SQLAlchemy async engine + Supabase client
│   │   ├── exceptions.py        # HTTP exception hierarchy
│   │   └── security.py         # JWT + bcrypt utilities
│   ├── models/
│   │   └── models.py            # SQLAlchemy ORM models
│   ├── repositories/
│   │   ├── base.py              # Generic async CRUD repository
│   │   ├── user_repository.py
│   │   └── project_repository.py
│   ├── schemas/
│   │   └── schemas.py           # Pydantic v2 request/response models
│   ├── services/
│   │   ├── auth_service.py      # Registration, login, refresh, session
│   │   ├── project_service.py   # Project CRUD + file tree
│   │   └── storage_service.py   # Supabase Storage wrapper
│   └── main.py                  # FastAPI application factory
├── alembic/
│   ├── versions/
│   │   └── 0001_initial.py      # Initial schema migration
│   └── env.py                   # Async Alembic env
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
copy .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Database Migrations

```bash
alembic upgrade head
```

### 4. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

## Docker

```bash
# Start all services (API + PostgreSQL + Redis + Frontend)
docker-compose up -d

# Run migrations inside container
docker-compose exec api alembic upgrade head
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login with email/password |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/projects` | List user projects |
| POST | `/api/v1/projects` | Create project |
| GET | `/api/v1/projects/{id}` | Get project |
| PATCH | `/api/v1/projects/{id}` | Update project |
| DELETE | `/api/v1/projects/{id}` | Delete project |
| GET | `/api/v1/projects/{id}/files` | Get file tree |
| POST | `/api/v1/projects/{id}/files` | Create file entry |
| POST | `/api/v1/files/upload/{project_id}` | Upload file to storage |
| GET | `/api/v1/files/signed-url/{project_id}` | Get download URL |
| DELETE | `/api/v1/files/{file_id}` | Delete file |
| GET | `/health` | Liveness probe |
| GET | `/health/ready` | Readiness probe |

## Technology Stack

- **FastAPI** — High-performance async Python web framework
- **SQLAlchemy 2.0** — Async ORM with type annotations
- **Alembic** — Database migrations
- **Supabase** — PostgreSQL + Auth + Storage
- **JWT (python-jose)** — Stateless authentication with refresh token rotation
- **bcrypt (passlib)** — Secure password hashing
- **Pydantic v2** — Data validation and serialization
- **structlog** — Structured JSON logging
- **Docker** — Containerized deployment
