from pydantic import BaseModel
from typing import List, Optional, Dict

class UserBase(BaseModel):
    name: str
    avatar: str
    role: str = "Player"
    walletAddress: Optional[str] = None
    email: Optional[str] = None
    vibeTokens: Optional[int] = 0
    arcadeCoins: Optional[int] = 0
    gamesPlayed: Optional[int] = 0
    gamesCreated: Optional[int] = 0
    challengePoints: Optional[int] = 0
    library: Optional[List[str]] = []
    lastSpinDate: Optional[str] = None
    questProgress: Optional[Dict[str, int]] = {}
    completedQuests: Optional[List[str]] = []
    isPremium: Optional[bool] = False
    referralCode: str
    referralCount: Optional[int] = 0
    exp: Optional[int] = 0
    recentlyPlayed: Optional[List[str]] = []

class UserCreate(UserBase):
    id: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = None
    walletAddress: Optional[str] = None
    email: Optional[str] = None
    vibeTokens: Optional[int] = None
    arcadeCoins: Optional[int] = None
    gamesPlayed: Optional[int] = None
    gamesCreated: Optional[int] = None
    challengePoints: Optional[int] = None
    library: Optional[List[str]] = None
    lastSpinDate: Optional[str] = None
    questProgress: Optional[Dict[str, int]] = None
    completedQuests: Optional[List[str]] = None
    isPremium: Optional[bool] = None
    referralCode: Optional[str] = None
    referralCount: Optional[int] = None
    exp: Optional[int] = None
    recentlyPlayed: Optional[List[str]] = None

class UserInDBBase(UserBase):
    id: str

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
