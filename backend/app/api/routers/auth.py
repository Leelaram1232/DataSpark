"""
DataSpark Backend — Authentication Router
Endpoints: /register, /login, /refresh, /logout, /me
"""
from fastapi import APIRouter, status, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    RefreshRequest,
    UserMeResponse,
    UserUpdate,
    UserResponse,
    MessageResponse,
)
from app.services import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: DbSession):
    """Register a new user account and receive JWT tokens."""
    try:
        service = AuthService(db)
        user, tokens = await service.register(data)
        return tokens
    except Exception:
        # Fallback to direct Supabase REST insert
        try:
            from app.core.database import get_supabase_client
            from app.core.security import hash_password, create_access_token, create_refresh_token
            from app.core.config import get_settings
            from app.core.exceptions import ConflictError
            import uuid
            
            settings = get_settings()
            client = get_supabase_client()
            
            email = data.email.lower()
            # Check if email exists
            res = client.table("users").select("id").eq("email", email).execute()
            if res.data:
                raise ConflictError("Email already registered")
                
            new_user_id = str(uuid.uuid4())
            payload = {
                "id": new_user_id,
                "email": email,
                "hashed_password": hash_password(data.password),
                "full_name": data.full_name,
                "is_active": True,
                "is_verified": False,
                "is_superuser": False
            }
            
            ins_res = client.table("users").insert(payload).execute()
            
            token_data = {"sub": new_user_id}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=settings.access_token_expire_minutes * 60,
            )
        except ConflictError as ce:
            raise HTTPException(status_code=409, detail=str(ce))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DbSession):
    """Authenticate with email and password."""
    try:
        service = AuthService(db)
        user, tokens = await service.login(data)
        return tokens
    except Exception:
        # Fallback to direct Supabase Auth REST call or DB lookup
        try:
            from app.core.database import get_supabase_client
            from app.core.security import verify_password, create_access_token, create_refresh_token
            from app.core.config import get_settings
            from app.core.exceptions import UnauthorizedError
            
            settings = get_settings()
            client = get_supabase_client()
            
            # Query the user directly from Supabase REST API
            email = data.email.lower()
            res = client.table("users").select("*").eq("email", email).execute()
            if res.data:
                user_data = res.data[0]
                if user_data.get("hashed_password") and verify_password(data.password, user_data["hashed_password"]):
                    if not user_data.get("is_active", True):
                        raise UnauthorizedError("Account is deactivated")
                        
                    token_data = {"sub": user_data["id"]}
                    access_token = create_access_token(token_data)
                    refresh_token = create_refresh_token(token_data)
                    
                    return TokenResponse(
                        access_token=access_token,
                        refresh_token=refresh_token,
                        expires_in=settings.access_token_expire_minutes * 60,
                    )
            
            raise UnauthorizedError("Invalid email or password")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid email or password")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(data: RefreshRequest, db: DbSession):
    """Exchange a refresh token for a new token pair (rotation)."""
    service = AuthService(db)
    return await service.refresh_tokens(data.refresh_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(data: RefreshRequest, db: DbSession):
    """Revoke a refresh token (logout from current device)."""
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserMeResponse)
async def get_me(current_user: CurrentUser):
    """Get the currently authenticated user's profile."""
    return UserMeResponse.model_validate(current_user)
