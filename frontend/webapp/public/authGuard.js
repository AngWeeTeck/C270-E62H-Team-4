(() => {
  const token = localStorage.getItem('threadquest_auth_token');
  if (!token) window.location.replace('/login.html');
})();
