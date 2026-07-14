from pathlib import Path
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = "sqlite:///./forum.db"
BASE_DIR = Path(__file__).resolve().parent
ENGINE = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)


def get_session() -> Generator[Session, None, None]:
    with Session(ENGINE) as session:
        yield session


def init_db() -> None:
    SQLModel.metadata.create_all(ENGINE)
