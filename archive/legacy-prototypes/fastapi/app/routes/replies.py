from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..models import Reply, Thread, User
from ..schemas import ReplyCreate

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


@router.post("/threads/{thread_id}/replies")
def create_reply(thread_id: str, data: ReplyCreate, session: Session = Depends(get_session)):
    thread = session.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    user = get_or_create_user(session, data.username)
    reply = Reply(
        thread_id=thread.id,
        user_id=user.id,
        content=data.content,
        rich_content=data.rich_content.dict() if data.rich_content else None,
    )
    session.add(reply)
    thread.reply_count += 1
    session.add(thread)
    session.commit()
    session.refresh(reply)

    return {
        "id": reply.id,
        "thread_id": reply.thread_id,
        "content": reply.content,
        "author": user.username,
        "rich_content": reply.rich_content,
        "created_at": reply.created_at.isoformat(),
        "updated_at": reply.updated_at.isoformat(),
    }


@router.get("/threads/{thread_id}/replies")
def list_replies(thread_id: str, session: Session = Depends(get_session)):
    thread = session.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    statement = select(Reply).where(Reply.thread_id == thread_id).order_by(Reply.created_at)
    replies = session.exec(statement).all()

    results = []
    for reply in replies:
        user = session.get(User, reply.user_id)
        results.append({
            "id": reply.id,
            "thread_id": reply.thread_id,
            "content": reply.content,
            "author": user.username if user else "Unknown",
            "rich_content": reply.rich_content,
            "created_at": reply.created_at.isoformat(),
            "updated_at": reply.updated_at.isoformat(),
        })
    return {"replies": results}
