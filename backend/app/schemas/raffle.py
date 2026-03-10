from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class RaffleBase(BaseModel):
    title: str
    description: Optional[str] = None
    prize: str
    cost: int
    entries: Optional[int] = 0
    endDate: datetime = Field(alias="end_date")
    image: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True
    )

class RaffleCreate(RaffleBase):
    pass

class RaffleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    prize: Optional[str] = None
    cost: Optional[int] = None
    entries: Optional[int] = None
    endDate: Optional[datetime] = Field(None, alias="end_date")
    image: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

class Raffle(RaffleBase):
    id: str
    createdAt: datetime = Field(alias="created_at", default_factory=datetime.now)
