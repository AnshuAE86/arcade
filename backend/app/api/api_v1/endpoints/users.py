from fastapi import APIRouter, Depends, HTTPException
from app import crud, schemas
from app.db.supabase import get_supabase
from supabase import Client
from typing import Any

router = APIRouter()

@router.post("/login", response_model=schemas.user.User)
def login_user(
    *,
    db: Client = Depends(get_supabase),
    user_in: schemas.user.UserCreate
) -> Any:
    """
    Login user: add to database if not exists, else return existing user.
    """
    print(f"Syncing user: {user_in.id}")
    try:
        user = crud.crud_user.user.get(db, id=user_in.id)
        if not user:
            print(f"User {user_in.id} not found, creating...")
            user = crud.crud_user.user.create(db, obj_in=user_in)
            print(f"User {user_in.id} created successfully")
        else:
            print(f"User {user_in.id} found in database")
        return user
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error syncing user: {error_details}")
        raise HTTPException(
            status_code=500, 
            detail=f"Backend Error: {str(e)}"
        )

@router.get("/{user_id}", response_model=schemas.user.User)
def get_user_profile(
    *,
    db: Client = Depends(get_supabase),
    user_id: str
) -> Any:
    """
    Get user profile from database.
    """
    user = crud.crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
