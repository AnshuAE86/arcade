from typing import List, Optional
from supabase import Client
from app.schemas.shop import ShopItemCreate, ShopItemUpdate

class CRUDShopItem:
    def get_multi(self, db: Client, skip: int = 0, limit: int = 100) -> List[dict]:
        try:
            response = db.table("arcade_shop_items").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def get(self, db: Client, id: str) -> Optional[dict]:
        try:
            response = db.table("arcade_shop_items").select("*").eq("id", id).execute()
            return response.data[0] if hasattr(response, 'data') and response.data else None
        except Exception:
            return None

    def create(self, db: Client, *, obj_in: ShopItemCreate) -> dict:
        data = obj_in.model_dump(exclude_none=True)
        try:
            response = db.table("arcade_shop_items").insert(data).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def update(self, db: Client, *, id: str, obj_in: ShopItemUpdate) -> dict:
        data = obj_in.model_dump(exclude_unset=True)
        try:
            response = db.table("arcade_shop_items").update(data).eq("id", id).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def delete(self, db: Client, *, id: str) -> Optional[dict]:
        try:
            response = db.table("arcade_shop_items").delete().eq("id", id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            raise e

class CRUDPurchase:
    def create_rpc(self, db: Client, *, item_id: str, user_id: str) -> dict:
        try:
            # Call the purchase_shop_item RPC
            response = db.rpc("purchase_shop_item", {
                "p_item_id": item_id,
                "p_user_id": user_id
            }).execute()
            
            # Since the SQL returns a TABLE, response.data will be a list
            if hasattr(response, 'data') and response.data:
                return response.data[0]
            
            raise Exception("No data returned from purchase RPC")
        except Exception as e:
            raise e

    def get_user_purchases(self, db: Client, user_id: str) -> List[dict]:
        try:
            response = db.table("arcade_purchases").select("*, arcade_shop_items(*)").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

shop_item = CRUDShopItem()
purchase = CRUDPurchase()
