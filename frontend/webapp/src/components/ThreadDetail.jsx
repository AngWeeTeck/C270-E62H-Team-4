import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import ReplyForm from './ReplyForm';
import MediaRenderer from './MediaRenderer';
import { resolveReplyCount } from '../utils/replyCount';
import { formatVoteScore, getVoterId } from '../utils/voteHelpers';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function ThreadDetail({ thread, onClose, onThreadUpdated }) {
  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(thread.reply_count || 0);

  const loadReplies = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads/${thread.id}/replies`, {
        headers: {
          'x-voter-id': getVoterId()
        }
      });
      if (!response.ok) {
        throw new Error(`Replies request failed: ${response.status}`);
      }

      const data = await response.json();
      const loadedReplies = Array.isArray(data.replies) ? data.replies : [];
      const nextReplyCount = resolveReplyCount({
        replies: loadedReplies,
        pagination: data.pagination,
        fallbackCount: thread.reply_count || 0,
      });

      setReplies(loadedReplies);
      setReplyCount(nextReplyCount);
      return;
    } catch (error) {
      console.error('Failed to load thread replies:', error);
      setReplies([]);
      setReplyCount(0);
    }

  };

  useEffect(() => {
    loadReplies();
  }, [thread.id]);

  const handleReplyAdded = (newReply) => {
    setReplies((current) => [newReply, ...current]);
    setReplyCount((current) => current + 1);
    onThreadUpdated?.((currentThread) => (
      currentThread
        ? { ...currentThread, reply_count: (currentThread.reply_count || 0) + 1 }
        : currentThread
    ));
  };

  const score = formatVoteScore(thread.score);
  const userVote = thread.userVote ?? 0;

  const voteOnTarget = async (targetType, targetId, value) => {
    try {
      const response = await fetch(`${API_BASE}/votes/${targetType}/${targetId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-voter-id': getVoterId()
        },
        body: JSON.stringify({ voteValue: value })
      });
      if (!response.ok) {
        throw new Error(`Vote request failed: ${response.status}`);
      }
      const summary = await response.json();
      if (targetType === 'thread') {
        onThreadUpdated?.((currentThread) => currentThread ? { ...currentThread, score: summary.score, userVote: summary.userVote } : currentThread);
      } else {
        setReplies((currentReplies) => currentReplies.map((reply) => {
          if (reply.id !== targetId) return reply;
          return { ...reply, score: summary.score, userVote: summary.userVote };
        }));
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const renderVoteButtons = (targetType, targetId, currentVote) => (
    <div className="vote-actions">
      <button
        type="button"
        className={currentVote === 1 ? 'vote-button active' : 'vote-button'}
        onClick={() => voteOnTarget(targetType, targetId, currentVote === 1 ? 0 : 1)}
      >
        ▲
      </button>
      <button
        type="button"
        className={currentVote === -1 ? 'vote-button active' : 'vote-button'}
        onClick={() => voteOnTarget(targetType, targetId, currentVote === -1 ? 0 : -1)}
      >
        ▼
      </button>
    </div>
  );

  return (
    <div className="thread-detail-card">
      <div className="thread-detail-header">
        <div>
          <p className="eyebrow">🧠 Thread details</p>
          <h2>{thread.title}</h2>
          <p className="thread-meta">{thread.author} • {replyCount} replies • {score} votes</p>
        </div>
        <button className="icon-pill" onClick={onClose}><AiOutlineClose /> Close</button>
      </div>
      <div className="thread-detail-body">
        <div className="thread-vote-bar">
          {renderVoteButtons('thread', thread.id, userVote)}
          <div className="thread-vote-summary">
            <strong>{score}</strong> votes
          </div>
        </div>
        <div
          className="thread-content"
          dangerouslySetInnerHTML={{ __html: thread.rich_content?.html || thread.content || '' }}
        />
        <MediaRenderer payload={thread.rich_content || thread.richContent || {}} />
      </div>
      <div className="thread-detail-replies">
        <h3>Replies</h3>
        {replies.length === 0 ? (
          <p className="empty-state">No replies yet. Be the first to share insight!</p>
        ) : (
          replies.map((reply) => (
            <div key={reply.id} className="reply-card">
              <div className="reply-header">
                <p className="reply-author">{reply.author}</p>
                <p className="reply-time">{new Date(reply.created_at).toLocaleString()}</p>
              </div>
              <div className="reply-vote-bar">
                {renderVoteButtons('reply', reply.id, reply.userVote ?? 0)}
                <div className="reply-vote-summary">
                  <span className="vote-score">{reply.score ?? 0}</span>
                  <span className="vote-label">votes</span>
                </div>
              </div>
              <div
                className="thread-content"
                dangerouslySetInnerHTML={{ __html: reply.rich_content?.html || reply.content || '' }}
              />
              <MediaRenderer payload={reply.rich_content || reply.richContent || {}} />
            </div>
          ))
        )}
      </div>
      <ReplyForm threadId={thread.id} onReplyCreated={handleReplyAdded} />
    </div>
  );
}
