from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_snake
from typing import List, Optional
from datetime import datetime

class GameBase(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    genre: str
    plays: Optional[int] = 0
    weeklyPlays: Optional[int] = 0
    rating: Optional[float] = 0.0
    creator: str
    iframeUrl: str
    tags: Optional[List[str]] = []
    isFeatured: Optional[bool] = False

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

class GameCreate(GameBase):
    pass

class GameUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    genre: Optional[str] = None
    plays: Optional[int] = None
    weeklyPlays: Optional[int] = None
    rating: Optional[float] = None
    creator: Optional[str] = None
    iframeUrl: Optional[str] = None
    tags: Optional[List[str]] = None
    isFeatured: Optional[bool] = None

    model_config = ConfigDict(populate_by_name=True)

class Game(GameBase):
    id: str
    createdAt: datetime = Field(default_factory=datetime.now)
