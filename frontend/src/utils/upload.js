export function resolveUploadedUrl(url = '', apiBase = '') {
  if (!url) return '';

  const trimmedUrl = String(url).trim();
  if (!trimmedUrl) return '';

  if (/^https?:\/\//i.test(trimmedUrl) || /^data:/i.test(trimmedUrl) || /^mailto:/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (trimmedUrl.startsWith('/')) {
    if (!apiBase) return trimmedUrl;

    const normalizedApiBase = String(apiBase).trim();
    if (!normalizedApiBase) return trimmedUrl;

    if (/^https?:\/\//i.test(normalizedApiBase)) {
      const baseUrl = normalizedApiBase.replace(/\/api\/?$/, '');
      return `${baseUrl}${trimmedUrl}`;
    }

    return trimmedUrl;
  }

  return trimmedUrl;
}
