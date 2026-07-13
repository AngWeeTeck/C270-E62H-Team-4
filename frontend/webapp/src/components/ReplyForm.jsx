import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['code-block', 'link'],
    ['clean']
  ]
};

const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet', 'code-block', 'link'];

export default function ReplyForm({ threadId, onReplyCreated }) {
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('learner1');
  const [embedUrl, setEmbedUrl] = useState('');
  const [embeds, setEmbeds] = useState([]);
  const [status, setStatus] = useState('');

  const determineEmbedType = (url) => {
    const normalized = url.toLowerCase();
    if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) return 'youtube';
    if (normalized.endsWith('.pdf')) return 'pdf';
    if (normalized.match(/\.(png|jpe?g|gif|webp)$/)) return 'image';
    return 'link';
  };

  const addEmbed = () => {
    if (!embedUrl) return;
    setEmbeds((current) => [
      ...current,
      { type: determineEmbedType(embedUrl), url: embedUrl, title: '' }
    ]);
    setEmbedUrl('');
  };

  const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Upload failed');
    setEmbeds((current) => [...current, { type: 'image', url: data.url, title: file.name }]);
  };

  const postReply = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setStatus('Please write a reply before posting.');
      return;
    }

    setStatus('Publishing reply...');

    const fallbackReply = {
      id: Date.now(),
      author: username || 'You',
      content,
      created_at: new Date().toISOString(),
      rich_content: {
        html: content,
        embeds
      }
    };

    try {
      const response = await fetch(`${API_BASE}/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          username,
          rich_content: {
            html: content,
            embeds
          }
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to post reply');
      }

      const createdReply = data.reply || data || fallbackReply;
      setContent('');
      setEmbeds([]);
      setStatus('Reply posted!');
      onReplyCreated?.(createdReply);
    } catch (error) {
      setContent('');
      setEmbeds([]);
      setStatus('Reply posted locally.');
      onReplyCreated?.(fallbackReply);
    }
  };

  return (
    <form className="reply-form" onSubmit={postReply}>
      <div className="reply-form-header">
        <p className="eyebrow">💬 Add your reply</p>
      </div>
      <ReactQuill
        value={content}
        onChange={setContent}
        modules={quillModules}
        formats={quillFormats}
        theme="snow"
        placeholder="Write a helpful explanation or response..."
      />
      <label className="embed-row">
        <span>Embed media</span>
        <div className="embed-actions">
          <input
            className="embed-input"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="YouTube, PDF, or image URL"
          />
          <button type="button" className="small-pill" onClick={addEmbed}>➕ Embed</button>
        </div>
      </label>
      {embeds.length > 0 && (
        <div className="embed-list">
          {embeds.map((embed, index) => (
            <div key={index} className="embed-chip">{embed.type}: {embed.url}</div>
          ))}
        </div>
      )}
      <label>
        <span>Upload image</span>
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0])} />
      </label>
      <label>
        <span>Your name</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <button className="pill-button" type="submit">🤝 Post reply</button>
      {status && <p className="status-text">{status}</p>}
    </form>
  );
}
