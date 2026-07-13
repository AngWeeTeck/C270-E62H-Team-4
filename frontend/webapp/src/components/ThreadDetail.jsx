import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import ReplyForm from './ReplyForm';
import { resolveReplyCount } from '../utils/replyCount';
import { getEmbedsFromRichContent, getYoutubeEmbedUrl, inferEmbedType } from '../utils/mediaEmbeds';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function MediaRenderer({ payload }) {
  const embeds = getEmbedsFromRichContent(payload || {});
  const [imageError, setImageError] = useState(false);

  if (embeds.length === 0) {
    return null;
  }

  return (
    <div className="media-embed-list">
      {embeds.map((embed, index) => {
        const type = embed.type || inferEmbedType(embed.url || '');
        if (type === 'image' && embed.url && !imageError) {
          return (
            <div key={`${embed.url}-${index}`} className="media-embed-card">
              <img
                className="media-image"
                src={embed.url}
                alt={embed.title || 'Embedded media'}
                onError={() => setImageError(true)}
              />
            </div>
          );
        }

        if (type === 'youtube' && embed.url) {
          const iframeUrl = getYoutubeEmbedUrl(embed.url);
          return (
            <div key={`${embed.url}-${index}`} className="media-embed-card">
              {iframeUrl ? (
                <iframe
                  className="media-video"
                  src={iframeUrl}
                  title={embed.title || 'Embedded video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="media-fallback">Unable to load media</div>
              )}
            </div>
          );
        }

        if (type === 'pdf' && embed.url) {
          return (
            <div key={`${embed.url}-${index}`} className="media-embed-card">
              <a className="media-link" href={embed.url} target="_blank" rel="noreferrer">
                View PDF
              </a>
            </div>
          );
        }

        return (
          <div key={`${embed.url}-${index}`} className="media-embed-card">
            <div className="media-fallback">Unable to load media</div>
          </div>
        );
      })}
    </div>
  );
}

export default function ThreadDetail({ thread, onClose, onThreadUpdated }) {
  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(thread.reply_count || 0);

  const loadReplies = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads/${thread.id}/replies`);
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

  return (
    <div className="thread-detail-card">
      <div className="thread-detail-header">
        <div>
          <p className="eyebrow">🧠 Thread details</p>
          <h2>{thread.title}</h2>
          <p className="thread-meta">{thread.author} • {replyCount} replies</p>
        </div>
        <button className="icon-pill" onClick={onClose}><AiOutlineClose /> Close</button>
      </div>
      <div className="thread-detail-body">
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
