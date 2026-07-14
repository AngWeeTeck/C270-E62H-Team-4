import React from 'react';

export default function ThreadCard({ thread, onClick }) {
  return (
    <div onClick={onClick} style={{ 
      border: '1px solid #ddd', 
      padding: '12px', 
      marginBottom: '12px',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#fff'
    }}>
      <h3>{thread.title}</h3>
      <p>{thread.content}</p>
      <small style={{ color: '#666' }}>By {thread.author} • {thread.replies?.length || 0} replies</small>
    </div>
  );
}
