from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_snake
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
    followers: Optional[int] = 0

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

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
    followers: Optional[int] = None

    model_config = ConfigDict(
        populate_by_name=True
    )

class User(UserBase):
    id: str

class SpinResult(BaseModel):
    randomIndex: int
    wonAmount: int
    newBalance: int
    lastSpinDate: str

class SpinStatus(BaseModel):
    canSpin: bool
    hoursLeft: float
    message: str

class CreatorStats(BaseModel):
    name: str
    avatar: Optional[str] = None
    totalPlays: int
    gamesCount: int
