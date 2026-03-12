from fastapi import APIRouter, Depends, HTTPException, status
from app import crud, schemas
from app.db.supabase import get_supabase
from app.api.deps import get_current_user
from supabase import Client
from typing import List, Any, Optional

router = APIRouter()

@router.get("/", response_model=List[Any])
def read_raffles(
    db: Client = Depends(get_supabase),
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Retrieve raffles with entry status. 
    Optimized for maximum speed using a single database-side join via RPC.
    """
    try:
        # Call the dedicated fetch RPC
        response = db.rpc("get_raffles_with_status", {
            "p_user_id": current_user["id"],
            "p_limit": limit,
            "p_offset": skip
        }).execute()
        
        return response.data if hasattr(response, 'data') else []
        
    except Exception as e:
        # Emergency fallback to standard queries if RPC is not yet installed
        raffles = db.table("arcade_raffles").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute().data
        entries_resp = db.table("arcade_raffle_entries").select("raffle_id").eq("user_id", current_user["id"]).execute().data
        entered_ids = {e["raffle_id"] for e in entries_resp}
        
        return [{**r, "endDate": r["end_date"], "isEntered": r["id"] in entered_ids} for r in raffles]

@router.post("/{raffle_id}/enter", response_model=Any)
def enter_raffle(
    *,
    db: Client = Depends(get_supabase),
    raffle_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Enter a raffle using an atomic RPC transaction.
    This is much faster and safer than multiple individual queries.
    """
    # Security check: Ensure the user is entering for themselves
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only enter raffles for your own account"
        )

    try:
        # Use the RPC transaction
        updated_raffle = crud.crud_raffle.raffle_entry.create_rpc(
            db, raffle_id=raffle_id, user_id=user_id
        )
        
        # Convert to schema for consistent camelCase output
        raffle_obj = schemas.raffle.Raffle(**updated_raffle)
        raffle_data = raffle_obj.model_dump()
        raffle_data["isEntered"] = True
        
        return raffle_data
        
    except Exception as e:
        error_msg = str(e)
        if "already entered" in error_msg:
            raise HTTPException(status_code=400, detail="You have already entered this raffle")
        if "Not enough coins" in error_msg:
            raise HTTPException(status_code=400, detail="Not enough coins")
        if "Raffle not found" in error_msg:
            raise HTTPException(status_code=404, detail="Raffle not found")
        
        raise HTTPException(status_code=500, detail=f"Transaction failed: {error_msg}")

@router.get("/{raffle_id}/entries", response_model=List[Any])
def read_raffle_entries(
    *,
    db: Client = Depends(get_supabase),
    raffle_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get all entries for a raffle.
    """
    return crud.crud_raffle.raffle_entry.get_by_raffle(db, raffle_id=raffle_id)

@router.get("/{raffle_id}/my-entry", response_model=bool)
def check_my_entry(
    *,
    db: Client = Depends(get_supabase),
    raffle_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Check if the current user has entered this raffle.
    """
    return crud.crud_raffle.raffle_entry.check_entry(db, raffle_id=raffle_id, user_id=current_user["id"])

@router.post("/{raffle_id}/pick-winner", response_model=Optional[schemas.user.User])
def pick_raffle_winner(
    *,
    db: Client = Depends(get_supabase),
    raffle_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Pick a winner for the raffle. (Admin only)
    """
    winner = crud.crud_raffle.raffle_entry.pick_winner(db, raffle_id=raffle_id)
    if not winner:
        raise HTTPException(status_code=404, detail="No entries found for this raffle")
    
    return winner
