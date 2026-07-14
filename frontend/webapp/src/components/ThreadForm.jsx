import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { resolveUploadedUrl } from '../utils/upload';

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

export default function ThreadForm({ onCreate, setSelectedThread }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('student1');
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
      // In case browser already cached/loaded
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
      // try to detect if it's actually an image by attempting to load it
      setStatus('Checking link to see if it is an image...');
      // if it's youtube-ish later we'll treat as youtube
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
        // fallback: try to parse text body (some servers return plain path)
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

  const createThread = async (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setStatus('Please add a thread title and some content.');
      return;
    }

    setStatus('Creating thread...');

    const fallbackThread = {
      id: Date.now(),
      title: title.trim(),
      content: content.replace(/<[^>]+>/g, '').trim() || 'Shared from the forum',
      author: username || 'student1',
      reply_count: 0,
      rich_content: {
        html: content,
        embeds
      },
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content,
          author: username || 'student1',
          username: username || 'student1',
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
        throw new Error(data.detail || 'Unable to create thread');
      }

      const createdThread = data.thread || data || fallbackThread;
      setTitle('');
      setContent('');
      setEmbeds([]);
      setStatus('Thread created successfully!');
      await onCreate(createdThread);
      setSelectedThread(createdThread);
    } catch (error) {
      setTitle('');
      setContent('');
      setEmbeds([]);
      setStatus('Thread posted locally.');
      await onCreate(fallbackThread);
      setSelectedThread(fallbackThread);
    }
  };

  return (
    <form className="thread-form" onSubmit={createThread}>
      <label>
        <span>Thread title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. How to solve this math problem?"
        />
      </label>
      <label className="content-editor-field">
        <span>Content</span>
        <div className="quill-shell">
          <ReactQuill
            value={content}
            onChange={setContent}
            modules={quillModules}
            formats={quillFormats}
            theme="snow"
            placeholder="Share your question or idea..."
          />
        </div>
      </label>
      <div className="embed-panel">
        <div className="embed-heading">
          <span>Embed a link</span>
          <p>Paste a YouTube or image URL to attach it to your post.</p>
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
      <label>
        <span>Your name</span>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <button className="pill-button" type="submit">✍️ Post thread</button>
      {status && <p className="status-text">{status}</p>}
    </form>
  );
}
