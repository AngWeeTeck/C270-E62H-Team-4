import { AiOutlineMessage } from 'react-icons/ai';

export default function ThreadCard({ thread, onClick }) {
  const replyCount = thread.reply_count ?? 0;

  return (
    <button className="thread-card" onClick={onClick}>
      <div className="thread-card-header">
        <div className="thread-card-content">
          <h3 className="thread-card-title">{thread.title}</h3>
          <p className="thread-meta">{thread.author} · {replyCount} replies</p>
        </div>
        <AiOutlineMessage size={24} />
      </div>
      <p className="thread-body">{thread.content}</p>
    </button>
  );
}
