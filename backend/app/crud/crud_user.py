from typing import Optional, Any
from supabase import Client
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser:
    def get(self, db: Client, id: str) -> Optional[dict]:
        try:
            response = db.table("arcade_users").select("*").eq("id", id).execute()
            # The supabase-py client returns data in the .data attribute
            return response.data[0] if hasattr(response, 'data') and response.data else None
        except Exception as e:
            print(f"Error in crud_user.get: {str(e)}")
            return None

    def create(self, db: Client, *, obj_in: UserCreate) -> dict:
        # Convert to dict and exclude None values
        data = obj_in.dict(exclude_none=True)
        print(f"Attempting to insert into arcade_users: {data}")
        try:
            # Use upsert to be safe, though get() check should handle it
            response = db.table("arcade_users").upsert(data).execute()
            
            # Print response for debugging
            print(f"Supabase Response: {response}")
            
            if not hasattr(response, 'data') or not response.data:
                raise Exception(f"No data returned from Supabase. Response: {response}")
            
            print(f"Successfully synced user: {response.data[0].get('id')}")
            return response.data[0]
        except Exception as e:
            print(f"CRITICAL: Supabase Insert Failed: {str(e)}")
            raise e

    def update(self, db: Client, *, id: str, obj_in: UserUpdate) -> dict:
        data = obj_in.dict(exclude_unset=True)
        response = db.table("arcade_users").update(data).eq("id", id).execute()
        return response.data[0]

user = CRUDUser()
