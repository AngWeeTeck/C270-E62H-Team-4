export function resolveUploadedUrl(url = '', apiBase = '') {
  if (!url) return '';

  const trimmedUrl = String(url).trim();
  if (!trimmedUrl) return '';

  if (/^https?:\/\//i.test(trimmedUrl) || /^data:/i.test(trimmedUrl) || /^mailto:/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith('/')) {
    const baseUrl = apiBase?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${baseUrl}${trimmedUrl}`;
  }

  return trimmedUrl;
}
