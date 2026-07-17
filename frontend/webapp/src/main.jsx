import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

if (!window.localStorage.getItem('threadquest_auth_token')) {
  window.location.replace('/login.html');
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
