from typing import List, Optional
from supabase import Client
from app.schemas.game import GameCreate, GameUpdate

class CRUDGame:
    def get_multi(self, db: Client, skip: int = 0, limit: int = 100, genre: Optional[str] = None) -> List[dict]:
        try:
            query = db.table("arcade_games").select("*")
            if genre:
                query = query.eq("genre", genre)
            response = query.range(skip, skip + limit - 1).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def get_featured(self, db: Client, limit: int = 5) -> List[dict]:
        try:
            response = db.table("arcade_games").select("*").eq("isFeatured", True).limit(limit).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def get_catalog(self, db: Client, genre: Optional[str] = None) -> List[dict]:
        try:
            # If a genre is provided, we fetch those first, then the rest
            if genre and genre != "All":
                genre_response = db.table("arcade_games").select("*").eq("genre", genre).execute()
                others_response = db.table("arcade_games").select("*").neq("genre", genre).execute()
                
                genre_data = genre_response.data if hasattr(genre_response, 'data') else []
                others_data = others_response.data if hasattr(others_response, 'data') else []
                
                return genre_data + others_data
            else:
                response = db.table("arcade_games").select("*").execute()
                return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def get_genres(self, db: Client) -> List[str]:
        try:
            # Supabase doesn't have a direct 'DISTINCT' for a single column easily via API, 
            # so we fetch unique genres using a select on the column
            response = db.table("arcade_games").select("genre").execute()
            if hasattr(response, 'data'):
                return sorted(list(set(item['genre'] for item in response.data)))
            return []
        except Exception:
            return []

    def get_leaderboard(self, db: Client, limit: int = 5, sort_by: str = "plays") -> List[dict]:
        try:
            # Only allow specific columns to prevent injection
            allowed_metrics = ["plays", "weeklyPlays"]
            order_column = sort_by if sort_by in allowed_metrics else "plays"
            
            response = db.table("arcade_games").select("*").order(order_column, desc=True).limit(limit).execute()
            return response.data if hasattr(response, 'data') else []
        except Exception:
            return []

    def get(self, db: Client, id: str) -> Optional[dict]:
        try:
            response = db.table("arcade_games").select("*").eq("id", id).execute()
            return response.data[0] if hasattr(response, 'data') and response.data else None
        except Exception:
            return None

    def create(self, db: Client, *, obj_in: GameCreate) -> dict:
        data = obj_in.model_dump(by_alias=True, exclude_none=True)
        try:
            response = db.table("arcade_games").insert(data).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def update(self, db: Client, *, id: str, obj_in: GameUpdate) -> dict:
        data = obj_in.model_dump(by_alias=True, exclude_unset=True)
        try:
            response = db.table("arcade_games").update(data).eq("id", id).execute()
            return response.data[0]
        except Exception as e:
            raise e

    def get_top_creators(self, db: Client, limit: int = 10) -> List[dict]:
        try:
            # Join with arcade_users to get the actual avatar and use UUID (creator_id)
            # Assuming arcade_games.creator_id links to arcade_users.id
            response = db.table("arcade_games").select("plays, arcade_users(id, name, avatar)").execute()
            games = response.data if hasattr(response, 'data') else []
            
            creator_stats = {}
            for game in games:
                user_info = game.get("arcade_users")
                if not user_info:
                    continue
                
                user_id = user_info.get("id")
                name = user_info.get("name")
                avatar = user_info.get("avatar")
                plays = game.get("plays") or 0
                
                if user_id not in creator_stats:
                    creator_stats[user_id] = {
                        "name": name, 
                        "avatar": avatar,
                        "totalPlays": 0, 
                        "gamesCount": 0
                    }
                creator_stats[user_id]["totalPlays"] += plays
                creator_stats[user_id]["gamesCount"] += 1
            
            # Sort by totalPlays and limit
            sorted_creators = sorted(creator_stats.values(), key=lambda x: x["totalPlays"], reverse=True)
            return sorted_creators[:limit]
        except Exception:
            return []

game = CRUDGame()
