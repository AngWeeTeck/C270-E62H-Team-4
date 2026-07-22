from typing import List, Optional

from sqlmodel import Field, SQLModel


class RichEmbed(SQLModel):
    type: str
    url: str
    title: Optional[str] = None


class RichContent(SQLModel):
    html: str
    embeds: Optional[List[RichEmbed]] = None


class UserCreate(SQLModel):
    username: str
    display_name: Optional[str] = None


class ThreadCreate(SQLModel):
    title: str
    content: str
    username: str
    rich_content: Optional[RichContent] = None


class ReplyCreate(SQLModel):
    content: str
    username: str
    rich_content: Optional[RichContent] = None
