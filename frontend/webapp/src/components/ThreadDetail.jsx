import { useEffect, useState } from 'react';
import { AiOutlineClose, AiOutlineSend } from 'react-icons/ai';
import ReplyForm from './ReplyForm';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export default function ThreadDetail({ thread, onClose }) {
  const [replies, setReplies] = useState([]);
  const [status, setStatus] = useState('');

  const loadReplies = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads/${thread.id}/replies`);
      const data = await response.json();
      setReplies(data.replies || []);
    } catch (error) {
      setStatus('Unable to load replies.');
    }
  };

  useEffect(() => {
    loadReplies();
  }, [thread.id]);

  return (
    <div className="thread-detail-card">
      <div className="thread-detail-header">
        <div>
          <p className="eyebrow">🧠 Thread details</p>
          <h2>{thread.title}</h2>
          <p className="thread-meta">{thread.author} • {thread.reply_count} replies</p>
        </div>
        <button className="icon-pill" onClick={onClose}><AiOutlineClose /> Close</button>
      </div>
      <div className="thread-detail-body">
        <div
          className="thread-content"
          dangerouslySetInnerHTML={{ __html: thread.rich_content?.html || thread.content || '' }}
        />
      </div>
      <div className="thread-detail-replies">
        <h3>Replies</h3>
        {status && <div className="alert-card">{status}</div>}
        {replies.length === 0 ? (
          <p className="empty-state">No replies yet. Be the first to share insight!</p>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="reply-card">
              <div className="reply-header">
                <p className="reply-author">{reply.author}</p>
                <p className="reply-time">{new Date(reply.created_at).toLocaleString()}</p>
              </div>
              <div
                className="thread-content"
                dangerouslySetInnerHTML={{ __html: reply.rich_content?.html || reply.content || '' }}
              />
            </div>
          ))
        )}
      </div>
      <ReplyForm threadId={thread.id} onReplyCreated={loadReplies} />
    </div>
  );
}
