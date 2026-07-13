import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import ReplyForm from './ReplyForm';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const fallbackReplies = {
  101: [
    {
      id: 1001,
      author: 'Mina, RP 2A',
      content: 'I can help with a simple structure for the pitch slides.',
      created_at: '2026-07-12T09:00:00.000Z',
      rich_content: { html: '<p>I can help with a simple structure for the pitch slides.</p>' }
    },
    {
      id: 1002,
      author: 'Jared, RP 2B',
      content: 'We should keep the opening to one clear problem statement.',
      created_at: '2026-07-12T10:15:00.000Z',
      rich_content: { html: '<p>We should keep the opening to one clear problem statement.</p>' }
    }
  ],
  102: [
    {
      id: 1003,
      author: 'Ravi, RP 3B',
      content: 'A short story-based example usually lands well with classmates.',
      created_at: '2026-07-12T08:30:00.000Z',
      rich_content: { html: '<p>A short story-based example usually lands well with classmates.</p>' }
    }
  ],
  103: [
    {
      id: 1004,
      author: 'Nora, RP 1C',
      content: 'I shared a sketch with the group; it might help with the review.',
      created_at: '2026-07-12T07:45:00.000Z',
      rich_content: { html: '<p>I shared a sketch with the group; it might help with the review.</p>' }
    }
  ]
};

const getFallbackReplies = (threadId) => fallbackReplies[threadId] || [];

export default function ThreadDetail({ thread, onClose, onThreadUpdated }) {
  const [replies, setReplies] = useState([]);
  const [status, setStatus] = useState('');

  const loadReplies = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads/${thread.id}/replies`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.replies) && data.replies.length > 0) {
        setReplies(data.replies);
        setStatus('');
        return;
      }
    } catch (error) {
      // fall back to sample replies below
    }

    setReplies(getFallbackReplies(thread.id));
    if (getFallbackReplies(thread.id).length > 0) {
      setStatus('Showing sample replies while the server is unavailable.');
    } else {
      setStatus('');
    }
  };

  useEffect(() => {
    loadReplies();
  }, [thread.id]);

  const handleReplyAdded = (newReply) => {
    setReplies((current) => [newReply, ...current]);
    onThreadUpdated?.((currentThread) => (
      currentThread
        ? { ...currentThread, reply_count: (currentThread.reply_count || 0) + 1 }
        : currentThread
    ));
    setStatus('');
  };

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
      <ReplyForm threadId={thread.id} onReplyCreated={handleReplyAdded} />
    </div>
  );
}
