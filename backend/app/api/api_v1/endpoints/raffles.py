from fastapi import APIRouter, Depends, HTTPException
from app import crud, schemas
from app.db.supabase import get_supabase
from supabase import Client
from typing import List, Any, Optional

router = APIRouter()

@router.get("/", response_model=List[schemas.raffle.Raffle])
def read_raffles(
    db: Client = Depends(get_supabase),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve raffles.
    """
    return crud.crud_raffle.raffle.get_multi(db, skip=skip, limit=limit)

@router.post("/{raffle_id}/enter", response_model=schemas.raffle.Raffle)
def enter_raffle(
    *,
    db: Client = Depends(get_supabase),
    raffle_id: str,
    user_id: str
) -> Any:
    """
    Enter a raffle. Deducts coins from user and increments raffle entries.
    """
    # 1. Get user
    user = crud.crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Get raffle
    raffle = crud.crud_raffle.raffle.get(db, id=raffle_id)
    if not raffle:
        raise HTTPException(status_code=404, detail="Raffle not found")
    
    # 3. Check coins
    current_coins = user.get("arcadeCoins") or 0
    if current_coins < raffle.get("cost"):
        raise HTTPException(status_code=400, detail="Not enough coins")
    
    # 4. Update user coins
    new_coins = current_coins - raffle.get("cost")
    crud.crud_user.user.update(db, id=user_id, obj_in=schemas.user.UserUpdate(arcadeCoins=new_coins))
    
    # 5. Increment raffle entries
    updated_raffle = crud.crud_raffle.raffle.enter_raffle(db, id=raffle_id)
    
    return updated_raffle
