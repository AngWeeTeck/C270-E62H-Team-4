import React, { useState } from 'react';

export default function ThreadDetail({ thread, onBack }) {
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack}>← Back</button>
      <h2>{thread.title}</h2>
      <p>{thread.content}</p>
      <small>By {thread.author}</small>
    </div>
  );
}
