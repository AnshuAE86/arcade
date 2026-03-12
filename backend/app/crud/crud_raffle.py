from typing import List, Optional
from supabase import Client
from app.schemas.raffle import RaffleCreate, RaffleUpdate

class CRUDRaffle:
    def get_multi(self, db: Client, skip: int = 0, limit: int = 100) -> List[dict]:
        try:
            response = db.table("arcade_raffles").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
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

class CRUDRaffleEntry:
    def create_rpc(self, db: Client, *, raffle_id: str, user_id: str) -> dict:
        try:
            # Call the RPC function we just created
            response = db.rpc("enter_raffle_transaction", {
                "p_raffle_id": raffle_id,
                "p_user_id": user_id
            }).execute()
            
            if hasattr(response, 'data') and response.data:
                return response.data
            
            raise Exception("No data returned from RPC")
        except Exception as e:
            raise e

    def create(self, db: Client, *, obj_in: dict) -> dict:
        try:
            response = db.table("arcade_raffle_entries").insert(obj_in).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def get_by_raffle(self, db: Client, raffle_id: str) -> List[dict]:
        try:
            response = db.table("arcade_raffle_entries").select("*, arcade_users(*)").eq("raffle_id", raffle_id).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def check_entry(self, db: Client, raffle_id: str, user_id: str) -> bool:
        try:
            response = db.table("arcade_raffle_entries").select("id").eq("raffle_id", raffle_id).eq("user_id", user_id).execute()
            return len(response.data) > 0 if hasattr(response, 'data') else False
        except Exception:
            return False

    def get_user_entries(self, db: Client, user_id: str) -> List[str]:
        try:
            response = db.table("arcade_raffle_entries").select("raffle_id").eq("user_id", user_id).execute()
            return [item["raffle_id"] for item in response.data] if hasattr(response, 'data') else []
        except Exception:
            return []

    def pick_winner(self, db: Client, raffle_id: str) -> Optional[dict]:
        try:
            # 1. Get all entries for this raffle
            entries = db.table("arcade_raffle_entries").select("user_id").eq("raffle_id", raffle_id).execute()
            if not entries.data:
                return None
            
            # 2. Pick a random winner
            import random
            winner_entry = random.choice(entries.data)
            winner_id = winner_entry["user_id"]
            
            # 3. Update raffle with winner_id
            db.table("arcade_raffles").update({"winner_id": winner_id}).eq("id", raffle_id).execute()
            
            # 4. Get winner user details
            winner_response = db.table("arcade_users").select("*").eq("id", winner_id).execute()
            return winner_response.data[0] if winner_response.data else None
        except Exception as e:
            raise e

raffle = CRUDRaffle()
raffle_entry = CRUDRaffleEntry()
