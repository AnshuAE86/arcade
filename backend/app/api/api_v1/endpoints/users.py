from fastapi import APIRouter, Depends, HTTPException, status
from app import crud, schemas
from app.db.supabase import get_supabase
from app.api.deps import get_current_user
from supabase import Client
from typing import Any, List
import random
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/leaderboard/top-players", response_model=List[schemas.user.User])
def read_top_players(
    db: Client = Depends(get_supabase),
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Retrieve top players by challenge points.
    """
    return crud.crud_user.user.get_top_players(db, limit=limit)

@router.post("/login", response_model=schemas.user.User)
def login_user(
    *,
    db: Client = Depends(get_supabase),
    user_in: schemas.user.UserCreate,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Login user: add to database if not exists, else return existing user.
    """
    # Verify the token belongs to the user being logged in
    if current_user["id"] != user_in.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to login as this user"
        )
    
    try:
        # 1. Try to find by ID (Auth UUID)
        user = crud.crud_user.user.get(db, id=user_in.id)
        
        # 2. If not found by ID, try finding by Email (to link legacy/mismatched accounts)
        if not user and user_in.email:
            user = crud.crud_user.user.get_by_email(db, email=user_in.email)
            
            if user:
                # Update the record to use the correct Auth UUID as the primary key
                user = crud.crud_user.user.update(db, id=user.get('id'), obj_in=schemas.user.UserUpdate(id=user_in.id))

        if not user:
            user = crud.crud_user.user.create(db, obj_in=user_in)
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Backend Error: {str(e)}"
        )

@router.get("/{user_id}", response_model=schemas.user.User)
def get_user_profile(
    *,
    db: Client = Depends(get_supabase),
    user_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Get user profile. If not found in arcade_users, try to fetch from Supabase Auth 
    and create the profile automatically.
    """
    # Optional: Allow users to view other profiles, but only if they are logged in
    # For now, let's just ensure they are logged in. 
    # If you want it to be STRICT (only see own profile), uncomment below:
    # if current_user["id"] != user_id:
    #     raise HTTPException(status_code=403, detail="Not authorized")

    try:
        # 1. Try to find in our database
        user = crud.crud_user.user.get(db, id=user_id)
        if user:
            # Stats (gamesCreated, totalPlays) are automatically maintained 
            # by database triggers for high performance.
            return user

        # 2. If not found, try to fetch from Supabase Auth (using service role)
        auth_user = db.auth.admin.get_user_by_id(user_id)
        
        if not auth_user or not auth_user.user:
            raise HTTPException(status_code=404, detail="User not found in Auth")

        # 3. Create the profile in our table
        sb_user = auth_user.user
        new_user = schemas.user.UserCreate(
            id=sb_user.id,
            name=sb_user.user_metadata.get("full_name") or sb_user.email.split("@")[0] or "Gamer",
            avatar=sb_user.user_metadata.get("avatar_url") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={sb_user.id}",
            email=sb_user.email,
            referralCode=f"ARC-{sb_user.id[:5].upper()}",
            role="Player"
        )
        
        user = crud.crud_user.user.create(db, obj_in=new_user)
        return user
        
    except Exception as e:
        # If it was already a 404 from Auth, re-raise it
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}", response_model=schemas.user.User)
def update_user(
    *,
    db: Client = Depends(get_supabase),
    user_id: str,
    user_in: schemas.user.UserUpdate,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Update user profile. Only the owner can update their profile.
    """
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    user = crud.crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = crud.crud_user.user.update(db, id=user_id, obj_in=user_in)
    return updated_user

def get_user_spin_status(user: Any) -> schemas.user.SpinStatus:
    if not user.get("lastSpinDate"):
        return schemas.user.SpinStatus(canSpin=True, hoursLeft=0, message="Ready to spin!")
    
    try:
        last_spin = datetime.fromisoformat(user.get("lastSpinDate"))
        now = datetime.now()
        diff = now - last_spin
        hours_passed = diff.total_seconds() / 3600
        hours_left = max(0, 24 - hours_passed)
        
        if hours_left <= 0:
            return schemas.user.SpinStatus(canSpin=True, hoursLeft=0, message="Ready to spin!")
        else:
            return schemas.user.SpinStatus(canSpin=False, hoursLeft=round(hours_left, 1), message=f"Wait {round(hours_left, 1)} hours")
    except Exception:
        return schemas.user.SpinStatus(canSpin=True, hoursLeft=0, message="Error checking status, assuming ready.")

@router.get("/{user_id}/spin-status", response_model=schemas.user.SpinStatus)
def read_spin_status(
    *,
    db: Client = Depends(get_supabase),
    user_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Check if user can spin and how long they have to wait.
    """
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = crud.crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return get_user_spin_status(user)

@router.post("/{user_id}/spin", response_model=schemas.user.SpinResult)
def spin_wheel(
    *,
    db: Client = Depends(get_supabase),
    user_id: str,
    is_paid: bool = False,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Spin the wheel and get a random prize.
    Supports:
    1. Free daily spin (is_paid=False)
    2. Paid spin (is_paid=True, costs 50 coins)
    3. Extra spin ticket (handled automatically if user has extraSpins > 0 and is_paid is false but daily spin is used)
    """
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = crud.crud_user.user.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_coins = user.get("arcadeCoins") or 0
    extra_spins = user.get("extraSpins") or 0
    last_spin_date = user.get("lastSpinDate")
    
    cost = 0
    use_extra_ticket = False
    now_str = datetime.now().isoformat()
    
    if is_paid:
        if current_coins < 50:
            raise HTTPException(status_code=400, detail="Not enough coins for a paid spin.")
        cost = 50
    else:
        status = get_user_spin_status(user)
        if not status.canSpin:
            # Check if they have an extra spin ticket
            if extra_spins > 0:
                use_extra_ticket = True
            else:
                raise HTTPException(status_code=400, detail=f"Cannot spin yet. {status.message}")
        else:
            # Free daily spin
            pass

    prizes = [10, 20, 50, 100, 200, 500, 10, 50]
    random_index = random.randint(0, len(prizes) - 1)
    won_amount = prizes[random_index]
    
    new_balance = (current_coins - cost) + won_amount
    
    # Update data
    update_data = {"arcadeCoins": new_balance}
    
    if use_extra_ticket:
        update_data["extraSpins"] = extra_spins - 1
        new_extra_spins = extra_spins - 1
        return_spin_date = last_spin_date or ""
    elif is_paid:
        new_extra_spins = extra_spins
        return_spin_date = last_spin_date or ""
    else:
        # Free spin
        update_data["lastSpinDate"] = now_str
        new_extra_spins = extra_spins
        return_spin_date = now_str

    try:
        crud.crud_user.user.update(
            db, 
            id=user_id, 
            obj_in=schemas.user.UserUpdate(**update_data)
        )
    except Exception as e:
        pass

    return {
        "randomIndex": random_index, 
        "wonAmount": won_amount, 
        "newBalance": new_balance,
        "lastSpinDate": return_spin_date,
        "extraSpins": new_extra_spins
    }

@router.post("/{user_id}/reward", response_model=schemas.user.User)
def reward_user(
    *,
    db: Client = Depends(get_supabase),
    user_id: str,
    amount: int,
    type: str = "arcade",
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Reward user for playing or completing tasks.
    """
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        updated_user = crud.crud_user.user.add_reward(
            db, user_id=user_id, amount=amount, type=type
        )
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
