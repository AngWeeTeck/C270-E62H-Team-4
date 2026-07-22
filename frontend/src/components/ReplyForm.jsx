import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { resolveUploadedUrl } from '../utils/upload';
import { requireAuthenticatedUser } from '../utils/authUser';
import { showAchievementToasts } from '../utils/achievementToast';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
  const [embedUrl, setEmbedUrl] = useState('');
  const [embeds, setEmbeds] = useState([]);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const determineEmbedType = (url) => {
    const normalized = url.toLowerCase();
    if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) return 'youtube';
    if (normalized.match(/\.(png|jpe?g|gif|webp)$/)) return 'image';
    return 'link';
  };

  const isImageUrl = (url) => new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      if (img.complete) {
        resolve(true);
      }
    } catch (e) {
      resolve(false);
    }
  });

  const addEmbed = async () => {
    if (!embedUrl) return;

    const normalizedUrl = embedUrl.trim();
    let embedType = determineEmbedType(normalizedUrl);

    if (embedType === 'link') {
      setStatus('Checking link to see if it is an image...');
      const looksLikeYoutube = /youtube\.com|youtu\.be/.test(normalizedUrl.toLowerCase());
      if (looksLikeYoutube) {
        embedType = 'youtube';
      } else {
        const isImage = await isImageUrl(normalizedUrl);
        if (isImage) embedType = 'image';
      }
    }

    if (embedType === 'link') {
      setStatus('Paste a YouTube or image URL here. For PDFs, please use Upload a file instead.');
      return;
    }

    setEmbeds((current) => [
      ...current,
      { type: embedType, url: normalizedUrl, title: '' }
    ]);
    setEmbedUrl('');
    setStatus('');
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
      let data = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (err) {
          data = {};
        }
      } else {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (err) {
          data = text ? { url: text } : {};
        }
      }

      if (!response.ok) {
        throw new Error((data && (data.detail || data.error)) || 'Upload failed');
      }

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
    const auth = requireAuthenticatedUser();
    if (!auth) return;

    if (!content.trim()) {
      setStatus('Please write a reply before posting.');
      return;
    }

    setStatus('Publishing reply...');

    try {
      const response = await fetch(`${API_BASE}/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({
          requestId: window.crypto.randomUUID(),
          content,
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
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) {
        throw new Error(
          data.detail || data.error || `Unable to post reply (HTTP ${response.status})`
        );
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Reply server returned an unexpected non-JSON response.');
      }

      const createdReply = data.reply || data;
      setContent('');
      setEmbeds([]);
      setStatus('Reply posted!');
      onReplyCreated?.(createdReply);
      showAchievementToasts(data.gamification?.unlockedAchievements || []);
    } catch (error) {
      setStatus(error.message || 'Unable to post reply.');
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
          <p>Paste a YouTube or image URL to attach it to your reply.</p>
        </div>
        <div className="embed-actions">
          <input
            className="embed-input"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="YouTube or image URL"
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
      <button className="pill-button" type="submit">🤝 Post reply</button>
      {status && <p className="status-text">{status}</p>}
    </form>
  );
}
