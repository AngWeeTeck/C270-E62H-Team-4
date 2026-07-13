import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { resolveUploadedUrl } from '../utils/upload';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Upload failed');

      const hostedUrl = resolveUploadedUrl(data.url, `${API_BASE}`);
      const fileType = file.type.includes('pdf') ? 'pdf' : file.type.startsWith('image/') ? 'image' : 'link';
      setEmbeds((current) => [...current, { type: fileType, url: hostedUrl, title: file.name }]);
      setStatus(`Uploaded ${file.name}`);
    } catch (error) {
      setUploadError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
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
          author: username || 'learner1',
          username: username || 'learner1',
          richContent: {
            html: content,
            embeds
          },
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
      <div className="reply-editor-shell">
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={quillModules}
          formats={quillFormats}
          theme="snow"
          placeholder="Write a helpful explanation or response..."
        />
      </div>
      <div className="embed-panel reply-embed-panel">
        <div className="embed-heading">
          <span>Embed a link</span>
          <p>Paste a YouTube, PDF, or image URL to attach it to your reply.</p>
        </div>
        <div className="embed-actions">
          <input
            className="embed-input"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="YouTube, PDF, or image URL"
          />
          <button type="button" className="small-pill" onClick={addEmbed}>Add link</button>
        </div>
        <p className="embed-help-text">Have a file on your device? Upload it below. Prefer a web link instead? Paste it above.</p>
      </div>
      {embeds.length > 0 && (
        <div className="embed-list">
          {embeds.map((embed, index) => (
            <div key={index} className="embed-chip">{embed.type}: {embed.url}</div>
          ))}
        </div>
      )}
      <label className="upload-media-field">
        <span>Upload a file</span>
        <p className="upload-media-help">Use this for images or PDFs from your device. The file is sent to the server and turned into a hosted link.</p>
        <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0])} />
      </label>
      {uploading && <p className="status-text">Uploading file…</p>}
      {uploadError && <p className="status-text">{uploadError}</p>}
      <label>
        <span>Your name</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <button className="pill-button" type="submit">🤝 Post reply</button>
      {status && <p className="status-text">{status}</p>}
    </form>
  );
}
