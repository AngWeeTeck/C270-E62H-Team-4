import React from 'react';

export default function MediaRenderer({ url }) {
  if (!url) return null;
  
  return (
    <div style={{ marginTop: '8px' }}>
      <img src={url} alt="media" style={{ maxWidth: '100%', borderRadius: '4px' }} />
    </div>
  );
}
