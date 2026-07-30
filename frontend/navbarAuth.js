document.querySelectorAll('.logout').forEach((logoutLink) => {
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    localStorage.removeItem('threadquest_auth_token');
    localStorage.removeItem('threadquest_auth_user');
    window.location.href = '/login.html';
  });
});
