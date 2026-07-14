const AuthService = {
  tokenKey: 'threadquest_auth_token',
  userKey: 'threadquest_auth_user',
  apiUrl: '/api',

  configure(options = {}) {
    this.apiUrl = options.apiUrl || this.apiUrl;
  },

  getToken() {
    return localStorage.getItem(this.tokenKey);
  },

  getUser() {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem(this.userKey);
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(this.getToken() && this.getUser());
  },

  saveSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    window.dispatchEvent(new Event('threadquest-auth-changed'));
  },

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.dispatchEvent(new Event('threadquest-auth-changed'));
  },

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const token = this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.apiUrl}${path}`, {
      ...options,
      headers
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  },

  async register(formData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (data.token && data.user) {
      this.saveSession(data.token, data.user);
    }

    return data;
  },

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (data.token && data.user) {
      this.saveSession(data.token, data.user);
    }

    return data;
  },

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearSession();
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
