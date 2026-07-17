class AuthPages {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.mode = options.mode || 'login';

    if (typeof AuthService !== 'undefined') {
      AuthService.configure({ apiUrl: options.apiUrl || '/api' });
    }

    this.render();
  }

  render() {
    const isRegister = this.mode === 'register';

    this.container.innerHTML = `
      <section class="auth-card">
        <div>
          <p class="eyebrow">StudyQuest</p>
          <h2>${isRegister ? 'Create account' : 'Login'}</h2>
          <p class="auth-copy">${isRegister ? 'Join the discussion with a secure account.' : 'Welcome back. Log in to continue.'}</p>
        </div>
        <form id="auth-form" class="auth-form" novalidate>
          ${isRegister ? `
            <label>
              Username
              <input id="auth-username" name="username" autocomplete="username" required />
              <span class="field-error" data-error-for="username"></span>
            </label>
            <label>
              Email
              <input id="auth-email" name="email" type="email" autocomplete="email" required />
              <span class="field-error" data-error-for="email"></span>
            </label>
          ` : `
            <label>
              Email or username
              <input id="auth-login" name="login" autocomplete="username" required />
              <span class="field-error" data-error-for="login"></span>
            </label>
          `}
          <label>
            Password
            <span class="password-row">
              <input id="auth-password" name="password" type="password" autocomplete="${isRegister ? 'new-password' : 'current-password'}" required />
              <button type="button" class="password-toggle" data-toggle-password="auth-password">Show</button>
            </span>
            <span class="field-error" data-error-for="password"></span>
          </label>
          ${isRegister ? `
            <label>
              Confirm password
              <span class="password-row">
                <input id="auth-confirm-password" name="confirmPassword" type="password" autocomplete="new-password" required />
                <button type="button" class="password-toggle" data-toggle-password="auth-confirm-password">Show</button>
              </span>
              <span class="field-error" data-error-for="confirmPassword"></span>
            </label>
          ` : ''}
          <p id="auth-message" class="form-message" aria-live="polite"></p>
          <button id="auth-submit" class="btn btn-primary" type="submit">${isRegister ? 'Create account' : 'Login'}</button>
        </form>
        <p class="auth-switch">
          ${isRegister ? 'Already have an account?' : 'Need an account?'}
          <button type="button" id="auth-switch-btn">${isRegister ? 'Login' : 'Create account'}</button>
        </p>
      </section>
    `;

    this.container.querySelector('#auth-form').addEventListener('submit', (event) => this.submit(event));
    this.container.querySelector('#auth-switch-btn').addEventListener('click', () => {
      this.mode = isRegister ? 'login' : 'register';
      this.render();
    });

    this.container.querySelectorAll('[data-toggle-password]').forEach((button) => {
      button.addEventListener('click', () => this.togglePassword(button));
    });
  }

  togglePassword(button) {
    const input = this.container.querySelector(`#${button.dataset.togglePassword}`);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? 'Show' : 'Hide';
  }

  getValues() {
    const data = new FormData(this.container.querySelector('#auth-form'));
    return Object.fromEntries(data.entries());
  }

  validate(values) {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (this.mode === 'register') {
      if (!values.username?.trim()) errors.username = 'Username is required.';
      if (!values.email?.trim()) errors.email = 'Email is required.';
      else if (!emailPattern.test(values.email.trim())) errors.email = 'Enter a valid email.';
      if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
      if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    } else if (!values.login?.trim()) {
      errors.login = 'Email or username is required.';
    }

    if (!values.password) errors.password = 'Password is required.';
    else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';

    return errors;
  }

  showErrors(errors) {
    this.container.querySelectorAll('.field-error').forEach((field) => {
      field.textContent = errors[field.dataset.errorFor] || '';
    });
  }

  async submit(event) {
    event.preventDefault();
    const values = this.getValues();
    const errors = this.validate(values);
    const submitButton = this.container.querySelector('#auth-submit');
    const message = this.container.querySelector('#auth-message');

    this.showErrors(errors);
    message.textContent = '';
    message.className = 'form-message';

    if (Object.keys(errors).length > 0) return;

    submitButton.disabled = true;
    submitButton.textContent = this.mode === 'register' ? 'Creating...' : 'Logging in...';

    try {
      const response = this.mode === 'register'
        ? await AuthService.register(values)
        : await AuthService.login(values);

      message.textContent = response.message || 'Success.';
      message.classList.add('form-message-success');
      setTimeout(() => {
        document.getElementById('auth-panel').style.display = 'none';
        document.getElementById('forum-section').style.display = 'block';
      }, 250);
    } catch (error) {
      message.textContent = error.message;
      message.classList.add('form-message-error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = this.mode === 'register' ? 'Create account' : 'Login';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthPages;
}
