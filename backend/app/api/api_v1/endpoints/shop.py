from fastapi import APIRouter, Depends, HTTPException, status
from app import crud, schemas
from app.db.supabase import get_supabase
from app.api.deps import get_current_user
from supabase import Client
from typing import List, Any

router = APIRouter()

@router.get("/items", response_model=List[schemas.shop.ShopItem])
def read_shop_items(
    db: Client = Depends(get_supabase),
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Retrieve shop items.
    """
    items = crud.crud_shop.shop_item.get_multi(db, skip=skip, limit=limit)
    return items

@router.post("/items", response_model=schemas.shop.ShopItem, status_code=status.HTTP_201_CREATED)
def create_shop_item(
    *,
    db: Client = Depends(get_supabase),
    item_in: schemas.shop.ShopItemCreate,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Create new shop item.
    """
    item = crud.crud_shop.shop_item.create(db, obj_in=item_in)
    return item

@router.post("/purchase/{item_id}", response_model=schemas.shop.PurchaseResponse)
def purchase_item(
    *,
    db: Client = Depends(get_supabase),
    item_id: str,
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Purchase a shop item using an atomic RPC transaction.
    """
    try:
        result = crud.crud_shop.purchase.create_rpc(
            db, item_id=item_id, user_id=current_user["id"]
        )
        return result
    except Exception as e:
        error_msg = str(e)
        if "Not enough arcade coins" in error_msg:
            raise HTTPException(status_code=400, detail="Not enough arcade coins")
        if "Item not found" in error_msg:
            raise HTTPException(status_code=404, detail="Item not found")
        
        raise HTTPException(status_code=500, detail=f"Purchase failed: {error_msg}")

@router.get("/my-purchases", response_model=List[Any])
def read_my_purchases(
    db: Client = Depends(get_supabase),
    current_user: dict = Depends(get_current_user)
) -> Any:
    """
    Retrieve current user's purchase history.
    """
    purchases = crud.crud_shop.purchase.get_user_purchases(db, user_id=current_user["id"])
    return purchases
