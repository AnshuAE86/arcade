from fastapi import APIRouter
from app.api.api_v1.endpoints import users, games, raffles

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(raffles.router, prefix="/raffles", tags=["raffles"])
