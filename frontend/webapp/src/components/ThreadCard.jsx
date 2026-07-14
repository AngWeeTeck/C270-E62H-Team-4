import { AiOutlineMessage } from 'react-icons/ai';

export default function ThreadCard({ thread, onClick }) {
  const replyCount = thread.reply_count ?? 0;
  const score = thread.score ?? 0;
  const userVote = thread.userVote ?? 0;

  const displayContent = thread.rich_content?.html || thread.richContent?.html || thread.content || '';

  return (
    <button className="thread-card" onClick={onClick}>
      <div className="thread-card-header">
        <div className="thread-card-content">
          <h3 className="thread-card-title">{thread.title}</h3>
          <p className="thread-meta">{thread.author} · {replyCount} replies</p>
        </div>
        <div className="thread-card-vote">
          <span className="vote-score">{score}</span>
          <span className="vote-label">votes</span>
        </div>
        <AiOutlineMessage size={24} />
      </div>
      <div className="thread-body" dangerouslySetInnerHTML={{ __html: displayContent }} />
    </button>
  );
}
