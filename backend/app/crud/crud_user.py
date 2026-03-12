from typing import Optional, Any, List
from supabase import Client
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser:
    def get(self, db: Client, id: str) -> Optional[dict]:
        response = db.table("arcade_users").select("*").eq("id", id).execute()
        
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        
        return None

    def get_by_email(self, db: Client, email: str) -> Optional[dict]:
        response = db.table("arcade_users").select("*").eq("email", email).execute()
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        return None

    def create(self, db: Client, *, obj_in: UserCreate) -> dict:
        # Convert to dict using aliases (snake_case) and exclude None values
        data = obj_in.model_dump(by_alias=True, exclude_none=True)
        try:
            # Use insert instead of upsert to prevent overwriting existing data with defaults
            response = db.table("arcade_users").insert(data).execute()
            
            if hasattr(response, 'error') and response.error:
                raise Exception(f"Supabase error: {response.error}")
                
            if not hasattr(response, 'data') or not response.data:
                raise Exception(f"No data returned from Supabase")
            
            return response.data[0]
        except Exception as e:
            # If it's a conflict (user already exists), try to get the existing user
            if "duplicate key" in str(e).lower() or "already exists" in str(e).lower():
                user = self.get(db, id=data.get("id"))
                if user:
                    return user
            raise e

    def update(self, db: Client, *, id: str, obj_in: UserUpdate) -> dict:
        data = obj_in.model_dump(by_alias=True, exclude_unset=True)
        response = db.table("arcade_users").update(data).eq("id", id).execute()
        if hasattr(response, 'data') and response.data:
            return response.data[0]
        
        # If update failed or returned no data, try to get the user
        user = self.get(db, id=id)
        if not user:
            raise Exception("User not found after update")
        return user

    def get_top_players(self, db: Client, limit: int = 10) -> List[dict]:
        try:
            response = db.table("arcade_users").select("*").order("challengePoints", desc=True).limit(limit).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def claim_quest(self, db: Client, *, user_id: str, quest_id: str, reward: int) -> dict:
        try:
            # 1. Get current user
            user = self.get(db, id=user_id)
            if not user:
                raise Exception("User not found")
            
            # 2. Check if already claimed
            completed = user.get("completedQuests") or []
            if quest_id in completed:
                raise Exception("Quest already claimed")
            
            # 3. Update user
            new_coins = (user.get("arcadeCoins") or 0) + reward
            new_completed = completed + [quest_id]
            
            response = db.table("arcade_users").update({
                "arcadeCoins": new_coins,
                "completedQuests": new_completed
            }).eq("id", user_id).execute()
            
            return response.data[0]
        except Exception as e:
            raise e

    def add_reward(self, db: Client, *, user_id: str, amount: int, type: str) -> dict:
        try:
            user = self.get(db, id=user_id)
            if not user:
                raise Exception("User not found")
            
            field = "vibeTokens" if type == "vibe" else "arcadeCoins"
            new_value = (user.get(field) or 0) + amount
            new_games_played = (user.get("gamesPlayed") or 0) + 1
            
            response = db.table("arcade_users").update({
                field: new_value,
                "gamesPlayed": new_games_played
            }).eq("id", user_id).execute()
            
            return response.data[0]
        except Exception as e:
            raise e

user = CRUDUser()
