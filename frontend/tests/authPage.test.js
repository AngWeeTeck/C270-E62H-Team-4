const fs = require('fs');
const path = require('path');
const authPageScript = fs.readFileSync(path.resolve(__dirname, '../../auth.js'), 'utf8');

function loadAuthPageScript() {
  window.eval(authPageScript);
}

function makeResponse(body, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body)
  });
}

function renderAuthDom() {
  document.body.innerHTML = `
    <div id="auth-view">
      <p class="eyebrow">Welcome back</p>
      <h1 id="form-title">Log in</h1>
      <p id="form-intro"></p>
      <form id="auth-form">
        <div class="register-only"><input id="username" /></div>
        <div id="email-field"><input id="email" type="email" /></div>
        <input id="password" type="password" />
        <div id="confirm-field" class="register-only"><input id="confirm-password" type="password" /></div>
        <div class="form-options">
          <input id="remember" type="checkbox" />
          <button id="forgot-btn" type="button">Forgot password?</button>
        </div>
        <div id="message"></div>
        <button id="submit-btn" type="submit">Log in</button>
      </form>
      <p class="switch-copy">Do not have an account? <button id="mode-switch" type="button">Create one</button></p>
    </div>
    <div id="user-view">
      <div id="avatar"></div>
      <p id="user-email"></p>
      <button id="logout-btn" type="button">Log out</button>
      <button id="stay-btn" type="button">Stay signed in</button>
    </div>
    <button id="toggle-password" type="button">Show</button>
    <div id="logout-modal" aria-hidden="true">
      <button id="cancel-logout" type="button">Cancel</button>
      <button id="confirm-logout" type="button">Yes, log out</button>
    </div>
  `;
}

describe('redesigned authentication page', () => {
  let store;

  beforeEach(() => {
    jest.resetModules();
    window.history.replaceState({}, '', '/');
    renderAuthDom();
    store = {};
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: jest.fn((key) => store[key] ?? null),
        setItem: jest.fn((key, value) => { store[key] = String(value); }),
        removeItem: jest.fn((key) => { delete store[key]; })
      }
    });
    global.localStorage = window.localStorage;
    global.fetch = jest.fn();
  });

  test('logs in through the API and saves the returned session', async () => {
    const user = { id: 'user-1', username: 'janelle', email: 'janelle@example.com' };
    fetch.mockReturnValue(makeResponse({ message: 'Login successful.', token: 'jwt-token', user }));
    loadAuthPageScript();

    document.getElementById('email').value = user.email;
    document.getElementById('password').value = 'Password123!';
    document.getElementById('auth-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ login: user.email, password: 'Password123!' })
    }));
    expect(store.threadquest_auth_token).toBe('jwt-token');
    expect(JSON.parse(store.threadquest_auth_user)).toEqual(user);
  });

  test('calls logout and clears the saved session', async () => {
    const user = { id: 'user-1', username: 'janelle', email: 'janelle@example.com' };
    store.threadquest_auth_token = 'jwt-token';
    store.threadquest_auth_user = JSON.stringify(user);
    fetch.mockImplementation((url) => {
      if (url.endsWith('/auth/me')) return makeResponse({ user });
      if (url.endsWith('/auth/logout')) return makeResponse({ message: 'Logged out successfully.' });
      return makeResponse({}, false);
    });
    loadAuthPageScript();
    await new Promise((resolve) => setTimeout(resolve, 0));

    document.getElementById('logout-btn').click();
    document.getElementById('confirm-logout').click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
    expect(store.threadquest_auth_token).toBeUndefined();
    expect(store.threadquest_auth_user).toBeUndefined();
    expect(document.getElementById('auth-view').style.display).toBe('');
  });

  test('requests a password-reset email for the entered address', async () => {
    fetch.mockReturnValue(makeResponse({
      message: 'If that email belongs to an account, a reset link has been sent.'
    }));
    loadAuthPageScript();

    document.getElementById('email').value = 'janelle@example.com';
    document.getElementById('forgot-btn').click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'janelle@example.com' })
    }));
    expect(document.getElementById('message').textContent).toContain('reset link has been sent');
  });

  test('submits a new password when opened from a reset link', async () => {
    window.history.replaceState({}, '', '/?resetToken=secure-reset-token');
    fetch.mockReturnValue(makeResponse({ message: 'Password reset successfully.' }));
    loadAuthPageScript();

    document.getElementById('password').value = 'NewPassword123!';
    document.getElementById('confirm-password').value = 'NewPassword123!';
    document.getElementById('auth-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        token: 'secure-reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      })
    }));
    expect(window.location.search).toBe('');
    expect(document.getElementById('message').textContent).toContain('Password reset successfully');
  });
});
