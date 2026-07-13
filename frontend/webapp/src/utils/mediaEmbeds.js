export function inferEmbedType(url = '') {
  const normalized = (url || '').trim().toLowerCase();
  if (!normalized) return 'link';

  if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) return 'youtube';

  if (normalized.match(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/)) return 'image';
  if (normalized.match(/\.(pdf)(\?.*)?$/)) return 'pdf';

  if (normalized.includes('gstatic.com') || normalized.includes('googleusercontent.com')) return 'image';

  return 'link';
}

export function getYoutubeEmbedUrl(url = '') {
  const normalized = (url || '').trim();
  if (!normalized) return '';

  const match = normalized.match(/[?&]v=([^&#]+)/) || normalized.match(/youtu\.be\/([^?#]+)/);
  const videoId = match?.[1];
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getEmbedsFromRichContent(payload = {}) {
  const richContent = payload?.richContent || payload?.rich_content || {};
  const embeds = Array.isArray(richContent.embeds) ? richContent.embeds : [];

  return embeds.map((embed) => ({
    ...embed,
    type: embed.type || inferEmbedType(embed.url || '')
  }));
}
