"""DataSpark Backend — API Routers Package"""
from app.api.routers.auth import router as auth_router
from app.api.routers.users import router as users_router
from app.api.routers.projects import router as projects_router
from app.api.routers.files import router as files_router
from app.api.routers.edi import router as edi_router

__all__ = ["auth_router", "users_router", "projects_router", "files_router", "edi_router"]
