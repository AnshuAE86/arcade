from fastapi import APIRouter, Depends, HTTPException
from app import crud, schemas
from app.db.supabase import get_supabase
from supabase import Client
from typing import List, Any, Optional

router = APIRouter()

@router.get("/", response_model=List[schemas.game.Game])
def read_games(
    db: Client = Depends(get_supabase),
    skip: int = 0,
    limit: int = 100,
    genre: Optional[str] = None
) -> Any:
    """
    Retrieve games.
    """
    games = crud.crud_game.game.get_multi(db, skip=skip, limit=limit, genre=genre)
    return games

@router.get("/featured", response_model=List[schemas.game.Game])
def read_featured_games(
    db: Client = Depends(get_supabase),
    limit: int = 5
) -> Any:
    """
    Retrieve top featured games.
    """
    return crud.crud_game.game.get_featured(db, limit=limit)

@router.get("/browse", response_model=List[schemas.game.Game])
def browse_games(
    db: Client = Depends(get_supabase),
    genre: Optional[str] = None
) -> Any:
    """
    Retrieve games for the catalog, optionally prioritizing a genre.
    """
    return crud.crud_game.game.get_catalog(db, genre=genre)

@router.get("/leaderboard", response_model=List[schemas.game.Game])
def read_leaderboard(
    db: Client = Depends(get_supabase),
    limit: int = 5,
    sort_by: str = "plays"
) -> Any:
    """
    Retrieve top games by plays or weeklyPlays.
    """
    return crud.crud_game.game.get_leaderboard(db, limit=limit, sort_by=sort_by)

@router.get("/leaderboard/top-creators", response_model=List[schemas.user.CreatorStats])
def read_top_creators(
    db: Client = Depends(get_supabase),
    limit: int = 10
) -> Any:
    """
    Retrieve top creators by total reach (sum of plays).
    """
    return crud.crud_game.game.get_top_creators(db, limit=limit)

@router.get("/genres", response_model=List[str])
def read_genres(
    db: Client = Depends(get_supabase)
) -> Any:
    """
    Retrieve unique genres.
    """
    return crud.crud_game.game.get_genres(db)

@router.get("/{id}", response_model=schemas.game.Game)
def read_game(
    *,
    db: Client = Depends(get_supabase),
    id: str
) -> Any:
    """
    Get game by ID.
    """
    game = crud.crud_game.game.get(db, id=id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game
