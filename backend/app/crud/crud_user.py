from typing import Optional, Any, List
from supabase import Client
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser:
    def get(self, db: Client, id: str) -> Optional[dict]:
        try:
            response = db.table("arcade_users").select("*").eq("id", id).execute()
            
            if hasattr(response, 'data') and response.data:
                return response.data[0]
            
            return None
        except Exception:
            return None

    def get_by_email(self, db: Client, email: str) -> Optional[dict]:
        try:
            response = db.table("arcade_users").select("*").eq("email", email).execute()
            if hasattr(response, 'data') and response.data:
                return response.data[0]
            return None
        except Exception:
            return None

    def create(self, db: Client, *, obj_in: UserCreate) -> dict:
        # Convert to dict using aliases (snake_case) and exclude None values
        data = obj_in.model_dump(by_alias=True, exclude_none=True)
        try:
            response = db.table("arcade_users").upsert(data).execute()
            
            if hasattr(response, 'error') and response.error:
                raise Exception(f"Supabase error: {response.error}")
                
            if not hasattr(response, 'data') or not response.data:
                raise Exception(f"No data returned from Supabase")
            
            return response.data[0]
        except Exception as e:
            raise e

    def update(self, db: Client, *, id: str, obj_in: UserUpdate) -> dict:
        data = obj_in.model_dump(by_alias=True, exclude_unset=True)
        response = db.table("arcade_users").update(data).eq("id", id).execute()
        return response.data[0]

    def get_top_players(self, db: Client, limit: int = 10) -> List[dict]:
        try:
            response = db.table("arcade_users").select("*").order("challengePoints", desc=True).limit(limit).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

user = CRUDUser()
