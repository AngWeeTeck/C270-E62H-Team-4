(() => {
  const isLocalhost = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  const usingStaticServer = isLocalhost && ['8000', '5173', ''].includes(window.location.port);
  const API_URL = window.location.protocol === 'file:' || usingStaticServer
    ? 'http://127.0.0.1:5000/api'
    : '/api';
  console.log('AuthService API_URL:', API_URL, 'location:', window.location.href);
  const TOKEN_KEY = 'threadquest_auth_token';
  const USER_KEY = 'threadquest_auth_user';
  const authView = document.getElementById('auth-view');
  const userView = document.getElementById('user-view');
  const authForm = document.getElementById('auth-form');
  const emailInput = document.getElementById('email');
  const emailField = document.getElementById('email-field');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const rememberInput = document.getElementById('remember');
  const submitButton = document.getElementById('submit-btn');
  const message = document.getElementById('message');
  const modal = document.getElementById('logout-modal');
  const formOptions = document.querySelector('.form-options');
  const switchCopy = document.querySelector('.switch-copy');
  const MAIN_APP_URL = 'http://127.0.0.1:5173/';
  let resetToken = new URLSearchParams(window.location.search).get('resetToken');
  let mode = 'login';

  async function apiRequest(path, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);
    let response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {})
        }
      });
    } catch (error) {
      throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
    }

    const data = await response.json().catch(() => ({}));
    
    // If we get a 401, clear the invalid session
    if (response.status === 401) {
      clearSession();
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
    return data;
  }

  function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('threadquest-auth-changed'));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('threadquest-auth-changed'));
  }

  function getSavedUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (error) {
      return null;
    }
  }

  function showMessage(text, type = 'error') {
    message.textContent = text;
    message.className = `message show ${type}`;
  }

  function clearMessage() {
    message.textContent = '';
    message.className = 'message';
  }

  function setMode(nextMode) {
    mode = nextMode;
    const registering = mode === 'register';
    const resetting = mode === 'reset';
    
    // Reset form and clear messages when switching modes
    authForm.reset();
    clearMessage();
    
    document.querySelector('#auth-view .eyebrow').textContent = resetting ? 'Secure your account' : registering ? 'Join the community' : 'Welcome back';
    document.getElementById('form-title').textContent = resetting ? 'Reset password' : registering ? 'Create account' : 'Log in';
    document.getElementById('form-intro').textContent = resetting
      ? 'Choose a new password with at least eight characters.'
      : registering
        ? 'Start sharing ideas and discovering new perspectives.'
        : 'Continue the conversations that matter to you.';
    submitButton.textContent = resetting ? 'Save new password' : registering ? 'Create account' : 'Log in';
    document.getElementById('mode-switch').textContent = resetting ? 'Back to login' : registering ? 'Log in instead' : 'Create one';
    switchCopy.firstChild.textContent = resetting ? 'Remembered your password? ' : registering ? 'Already have an account? ' : 'Do not have an account? ';
    document.getElementById('forgot-btn').style.visibility = registering || resetting ? 'hidden' : 'visible';
    document.querySelectorAll('.register-only').forEach((field) => field.classList.toggle('visible', registering));
    document.getElementById('confirm-field').classList.toggle('visible', registering || resetting);
    emailField.style.display = resetting ? 'none' : '';
    formOptions.style.display = resetting ? 'none' : '';
    usernameInput.required = registering;
    emailInput.required = !resetting;
    confirmPasswordInput.required = registering || resetting;
    passwordInput.autocomplete = registering || resetting ? 'new-password' : 'current-password';
  }

  function leaveResetMode() {
    resetToken = null;
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('resetToken');
    window.history.replaceState({}, '', cleanUrl);
    setMode('login');
  }

  function showUser(user) {
    authView.style.display = 'none';
    userView.classList.add('active');
    document.getElementById('user-email').textContent = `${user.username} · ${user.email}`;
    document.getElementById('avatar').textContent = (user.username || user.email).charAt(0).toUpperCase();
  }

  function showLogin() {
    userView.classList.remove('active');
    authView.style.display = '';
    authForm.reset();
    passwordInput.type = 'password';
    setMode('login');

    const savedEmail = localStorage.getItem('threadquest-email');
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberInput.checked = true;
    }
  }

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('cancel-logout').focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.getElementById('logout-btn').focus();
  }

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const registering = mode === 'register';
    const resetting = mode === 'reset';

    if (!resetting && (!email || !emailInput.value.trim())) {
      showMessage('Please enter your email address or username.');
      return emailInput.focus();
    }
    if (registering && usernameInput.value.trim().length < 3) {
      showMessage('Your username must contain at least 3 characters.');
      return usernameInput.focus();
    }
    if (password.length < 8) {
      showMessage('Your password must contain at least 8 characters.');
      return passwordInput.focus();
    }
    if ((registering || resetting) && password !== confirmPasswordInput.value) {
      showMessage('Your passwords do not match.');
      return confirmPasswordInput.focus();
    }

    submitButton.disabled = true;
    submitButton.textContent = resetting ? 'Saving password…' : registering ? 'Creating account…' : 'Logging in…';

    try {
      if (resetting) {
        const data = await apiRequest('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            token: resetToken,
            password,
            confirmPassword: confirmPasswordInput.value
          })
        });
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        leaveResetMode();
        showMessage(data.message || 'Password reset successfully.', 'success');
        return;
      }

      const data = await apiRequest(registering ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify(registering ? {
          username: usernameInput.value.trim(),
          email,
          password,
          confirmPassword: confirmPasswordInput.value
        } : { login: email, password })
      });

      saveSession(data.token, data.user);
      if (rememberInput.checked) localStorage.setItem('threadquest-email', email);
      else localStorage.removeItem('threadquest-email');
      showMessage(data.message || 'Success! Redirecting to the app…', 'success');
      window.setTimeout(() => {
        window.location.href = `${MAIN_APP_URL}?authToken=${encodeURIComponent(data.token)}`;
      }, 350);
    } catch (error) {
      showMessage(error.message);
      // If we get auth errors, always clear the session to prepare for account switch
      if (error.message.includes('session') || error.message.includes('expired')) {
        clearSession();
      }
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = mode === 'reset' ? 'Save new password' : mode === 'register' ? 'Create account' : 'Log in';
    }
  });

  document.getElementById('toggle-password').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    button.setAttribute('aria-pressed', String(!showing));
  });

  document.getElementById('forgot-btn').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const email = emailInput.value.trim();

    if (!email || !emailInput.validity.valid) {
      showMessage('Enter your account email first.');
      return emailInput.focus();
    }

    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      showMessage(data.message, 'success');

      if (data.developmentResetUrl) {
        const link = document.createElement('a');
        link.href = data.developmentResetUrl;
        link.textContent = ' Open development reset link';
        message.appendChild(link);
      }
    } catch (error) {
      showMessage(error.message);
    } finally {
      button.disabled = false;
      button.textContent = 'Forgot password?';
    }
  });

  document.getElementById('mode-switch').addEventListener('click', () => {
    if (mode === 'reset') leaveResetMode();
    else setMode(mode === 'login' ? 'register' : 'login');
  });
  document.getElementById('logout-btn').addEventListener('click', openModal);
  document.getElementById('cancel-logout').addEventListener('click', closeModal);
  document.getElementById('stay-btn').addEventListener('click', closeModal);
  document.getElementById('confirm-logout').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Logging out…';

    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn(error.message);
    } finally {
      clearSession();
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      button.disabled = false;
      button.textContent = 'Yes, log out';
      showLogin();
      emailInput.focus();
    }
  });

  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

  // Listen for storage changes (account switch in another tab)
  window.addEventListener('storage', (event) => {
    if (event.key === TOKEN_KEY || event.key === USER_KEY) {
      // Session changed in another tab - refresh current view
      if (!localStorage.getItem(TOKEN_KEY) && !localStorage.getItem(USER_KEY)) {
        // Session cleared - show login form
        showLogin();
        showMessage('You have been logged out.', 'info');
      } else if (event.newValue === null) {
        // Token/user was cleared - logout locally
        clearSession();
        showLogin();
        showMessage('Session ended. Please log in again.', 'info');
      }
    }
  });

  async function restoreSession() {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = getSavedUser();
    const savedEmail = localStorage.getItem('threadquest-email');

    if (resetToken) {
      clearSession();
      setMode('reset');
      passwordInput.focus();
      return;
    }

    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberInput.checked = true;
    }

    // If no token/user, stay on login
    if (!token || !savedUser) return;

    // Validate token with backend before showing user view
    try {
      showUser(savedUser);
      const data = await apiRequest('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      showUser(data.user);
    } catch (error) {
      // Token invalid or expired - clear and show login
      clearSession();
      showLogin();
      if (!error.message.includes('session')) {
        showMessage('Your session expired. Please log in again.', 'info');
      }
    }
  }

  restoreSession();
})();
