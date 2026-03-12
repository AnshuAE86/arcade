from typing import Optional
from pydantic import BaseModel, UUID4
from datetime import datetime

# Shared properties
class ShopItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    cost: int
    category: Optional[str] = None
    image_url: Optional[str] = None

# Properties to receive via API on creation
class ShopItemCreate(ShopItemBase):
    pass

# Properties to receive via API on update
class ShopItemUpdate(ShopItemBase):
    title: Optional[str] = None
    cost: Optional[int] = None

class ShopItemInDBBase(ShopItemBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

# Additional properties to return via API
class ShopItem(ShopItemInDBBase):
    pass

# Purchase schemas
class PurchaseBase(BaseModel):
    item_id: UUID4

class PurchaseCreate(PurchaseBase):
    user_id: str
    cost_paid: int

class Purchase(PurchaseBase):
    id: UUID4
    user_id: str
    cost_paid: int
    created_at: datetime

    class Config:
        from_attributes = True

class PurchaseResponse(BaseModel):
    success: bool
    message: str
    item_title: str
    new_balance: int
    new_extra_spins: int
