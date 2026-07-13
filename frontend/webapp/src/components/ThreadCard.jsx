import { AiOutlineMessage } from 'react-icons/ai';

export default function ThreadCard({ thread, onClick }) {
  return (
    <button className="thread-card" onClick={onClick}>
      <div className="thread-card-header">
        <div>
          <p className="thread-title">{thread.title}</p>
          <p className="thread-meta">{thread.author} · {thread.reply_count} replies</p>
        </div>
        <AiOutlineMessage size={24} />
      </div>
      <p className="thread-body">{thread.content}</p>
    </button>
  );
}
