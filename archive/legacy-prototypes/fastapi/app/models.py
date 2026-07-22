import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, JSON, String
from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(sa_column=Column(String, unique=True, index=True), nullable=False)
    display_name: Optional[str] = None

    threads: List["Thread"] = Relationship(back_populates="user")
    replies: List["Reply"] = Relationship(back_populates="user")


class Thread(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str
    content: str
    rich_content: Optional[dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reply_count: int = Field(default=0)

    user: Optional[User] = Relationship(back_populates="threads")
    replies: List["Reply"] = Relationship(back_populates="thread")


class Reply(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    thread_id: str = Field(foreign_key="thread.id")
    user_id: int = Field(foreign_key="user.id")
    content: str
    rich_content: Optional[dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    thread: Optional[Thread] = Relationship(back_populates="replies")
    user: Optional[User] = Relationship(back_populates="replies")
