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

export default function ThreadForm({ onCreate, setSelectedThread }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('student1');
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

  const createThread = async (event) => {
    event.preventDefault();
    setStatus('Creating thread...');

    try {
      const response = await fetch(`${API_BASE}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
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
        throw new Error(data.detail || 'Unable to create thread');
      }

      setTitle('');
      setContent('');
      setEmbeds([]);
      setStatus('Thread created successfully!');
      await onCreate();
      setSelectedThread(data);
    } catch (error) {
      setStatus(error.message);
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
      <label>
        <span>Content</span>
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={quillModules}
          formats={quillFormats}
          theme="snow"
          placeholder="Share your question or idea..."
        />
      </label>
      <label className="embed-row">
        <span>Add media embed</span>
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
      <button className="pill-button" type="submit">✍️ Post thread</button>
      {status && <p className="status-text">{status}</p>}
    </form>
  );
}
