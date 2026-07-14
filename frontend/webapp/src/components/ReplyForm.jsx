import React, { useState } from 'react';

export default function ReplyForm({ threadId, onReply }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReply(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <textarea
        placeholder="Write a reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', marginBottom: '8px', padding: '8px', minHeight: '60px' }}
      />
      <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Reply
      </button>
    </form>
  );
}
