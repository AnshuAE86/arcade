from typing import List, Optional
from supabase import Client
from app.schemas.raffle import RaffleCreate, RaffleUpdate

class CRUDRaffle:
    def get_multi(self, db: Client, skip: int = 0, limit: int = 100) -> List[dict]:
        try:
            response = db.table("arcade_raffles").select("*").range(skip, skip + limit - 1).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def get(self, db: Client, id: str) -> Optional[dict]:
        try:
            response = db.table("arcade_raffles").select("*").eq("id", id).execute()
            return response.data[0] if hasattr(response, 'data') and response.data else None
        except Exception:
            return None

    def create(self, db: Client, *, obj_in: RaffleCreate) -> dict:
        data = obj_in.model_dump(by_alias=True, exclude_none=True)
        try:
            response = db.table("arcade_raffles").insert(data).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def update(self, db: Client, *, id: str, obj_in: RaffleUpdate) -> dict:
        data = obj_in.model_dump(by_alias=True, exclude_unset=True)
        try:
            response = db.table("arcade_raffles").update(data).eq("id", id).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def enter_raffle(self, db: Client, *, id: str) -> dict:
        try:
            # First get current entries
            raffle = self.get(db, id=id)
            if not raffle:
                return None
            
            new_entries = (raffle.get("entries") or 0) + 1
            response = db.table("arcade_raffles").update({"entries": new_entries}).eq("id", id).execute()
            return response.data[0]
        except Exception as e:
            raise e

raffle = CRUDRaffle()
