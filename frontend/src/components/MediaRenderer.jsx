import { useState } from 'react';
import { getEmbedsFromRichContent, getYoutubeEmbedUrl, inferEmbedType } from '../utils/mediaEmbeds';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function MediaRenderer({ payload }) {
  const embeds = getEmbedsFromRichContent(payload || {});
  const [imageErrors, setImageErrors] = useState({});

  if (embeds.length === 0) {
    return null;
  }

  const handleImageError = (embedKey) => {
    setImageErrors((current) => ({ ...current, [embedKey]: true }));
  };

  return (
    <div className="media-embed-list">
      {embeds.map((embed, index) => {
        const type = embed.type || inferEmbedType(embed.url || '');
        const embedKey = `${embed.url || 'embed'}-${index}`;

        if (type === 'image' && embed.url) {
          if (imageErrors[embedKey]) {
            return (
              <div key={embedKey} className="media-embed-card">
                <div className="media-fallback">Unable to load image</div>
              </div>
            );
          }

          return (
            <div key={embedKey} className="media-embed-card">
              <img
                className="media-image"
                src={embed.url}
                alt={embed.title || 'Embedded media'}
                loading="lazy"
                decoding="async"
                onError={() => handleImageError(embedKey)}
              />
            </div>
          );
        }

        if (type === 'youtube' && embed.url) {
          const iframeUrl = getYoutubeEmbedUrl(embed.url);
          return (
            <div key={embedKey} className="media-embed-card">
              {iframeUrl ? (
                <iframe
                  className="media-video"
                  src={iframeUrl}
                  title={embed.title || 'Embedded video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="media-fallback">Unable to load media</div>
              )}
            </div>
          );
        }

        if (type === 'pdf' && embed.url) {
          const pdfUrl = (embed.url || '').trim();
          const resolvedPdfUrl = pdfUrl.startsWith('http')
            ? pdfUrl
            : /^\//.test(pdfUrl)
              ? `${API_BASE}`.replace(/\/api\/?$/, '') + pdfUrl
              : pdfUrl;

          const handlePdfClick = (event) => {
            event.preventDefault();
            if (!pdfUrl) return;
            window.open(resolvedPdfUrl, '_blank', 'noopener,noreferrer');
          };

          return (
            <div key={embedKey} className="media-embed-card">
              <a
                className="media-link"
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePdfClick}
              >
                View PDF
              </a>
            </div>
          );
        }

        return (
          <div key={embedKey} className="media-embed-card">
            <div className="media-fallback">Unable to load media</div>
          </div>
        );
      })}
    </div>
  );
}
