import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

async function validateAndStart() {
  const token = window.localStorage.getItem('threadquest_auth_token');

  if (!token) {
    window.location.replace('/login.html');
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Unauthorized');

    // token is valid — render the app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    // invalid token — clear and redirect to login
    try {
      window.localStorage.removeItem('threadquest_auth_token');
      window.localStorage.removeItem('threadquest_auth_user');
    } catch (e) {
      /* ignore */
    }
    window.location.replace('/login.html');
  }
}

validateAndStart();
