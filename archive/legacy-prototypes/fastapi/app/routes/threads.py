from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..models import Thread, User
from ..schemas import ThreadCreate

router = APIRouter()


def get_or_create_user(session: Session, username: str) -> User:
    statement = select(User).where(User.username == username)
    user = session.exec(statement).one_or_none()
    if user:
        return user

    user = User(username=username)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/threads")
def create_thread(data: ThreadCreate, session: Session = Depends(get_session)):
    user = get_or_create_user(session, data.username)
    thread = Thread(
        title=data.title,
        content=data.content,
        rich_content=data.rich_content.dict() if data.rich_content else None,
        user_id=user.id
    )
    session.add(thread)
    session.commit()
    session.refresh(thread)
    return {
        "id": thread.id,
        "title": thread.title,
        "content": thread.content,
        "rich_content": thread.rich_content,
        "author": user.username,
        "reply_count": thread.reply_count,
        "created_at": thread.created_at.isoformat(),
        "updated_at": thread.updated_at.isoformat(),
    }


@router.get("/threads")
def list_threads(session: Session = Depends(get_session)):
    statement = select(Thread).order_by(Thread.created_at.desc())
    threads = session.exec(statement).all()

    results = []
    for thread in threads:
        thread_user = session.get(User, thread.user_id)
        results.append({
            "id": thread.id,
            "title": thread.title,
            "content": thread.content,
            "rich_content": thread.rich_content,
            "author": thread_user.username if thread_user else "Unknown",
            "reply_count": thread.reply_count,
            "created_at": thread.created_at.isoformat(),
            "updated_at": thread.updated_at.isoformat(),
        })
    return {"threads": results}


@router.get("/threads/{thread_id}")
def get_thread(thread_id: str, session: Session = Depends(get_session)):
    thread = session.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    user = session.get(User, thread.user_id)
    return {
        "id": thread.id,
        "title": thread.title,
        "content": thread.content,
        "rich_content": thread.rich_content,
        "author": user.username if user else "Unknown",
        "reply_count": thread.reply_count,
        "created_at": thread.created_at.isoformat(),
        "updated_at": thread.updated_at.isoformat(),
    }
