export function getAuthenticatedUser() {
  try {
    const user = JSON.parse(window.localStorage.getItem('threadquest_auth_user') || 'null');
    const username = String(user?.username || '').trim().toLowerCase();
    const token = window.localStorage.getItem('threadquest_auth_token');
    return token && username ? { username, token } : null;
  } catch (_error) {
    return null;
  }
}

export function requireAuthenticatedUser() {
  const auth = getAuthenticatedUser();
  if (!auth) window.location.href = '/login.html';
  return auth;
}
