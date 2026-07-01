class SocialFeatures {
  constructor(elementId) {
    this.rootElement = document.getElementById(elementId);
    this.users = [];
    this.viewedUser = null;
    this.fetchUsers();
  }

  // 1. Fetch live social profiles from your backend route
  async fetchUsers() {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      this.users = await res.json();
      
      // Keep the active profile card updated with new counts
      if (this.viewedUser) {
        this.viewedUser = this.users.find(u => u.id === this.viewedUser.id);
      }
      this.render();
    } catch (err) {
      console.error("Error fetching users from backend:", err);
    }
  }

  // 2. Route the network request when someone clicks Follow/Unfollow
  async handleFollowToggle(targetId) {
    let currentUserId = "3"; // Default Faris
    if (typeof currentUser !== 'undefined') {
      if (currentUser.name === "Wee Teck") currentUserId = "1";
      if (currentUser.name === "Janelle") currentUserId = "2";
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${targetId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId })
      });
      const data = await res.json();
      console.log(data.message);
      
      await this.fetchUsers();
    } catch (err) {
      console.error("Error toggling follow status:", err);
    }
  }

  // 3. Set which card profile is active in the viewer window
  setViewedUser(userId) {
    this.viewedUser = this.users.find(u => u.id === userId);
    this.render();
  }

  render() {
    if (!this.rootElement) return;

    let currentUserId = "3"; 
    if (typeof currentUser !== 'undefined') {
      if (currentUser.name === "Wee Teck") currentUserId = "1";
      if (currentUser.name === "Janelle") currentUserId = "2";
    }

    const activeUser = this.users.find(u => u.id === currentUserId);

    // Build the Directory list HTML template[cite: 1, 2]
    let directoryHtml = this.users.map(user => {
      const isFollowing = activeUser?.following.includes(user.id);
      const isSelf = user.id === currentUserId;
      
      const followButton = !isSelf ? `
        <button onclick="window.socialSystem.handleFollowToggle('${user.id}')" style="background: ${isFollowing ? '#ef4444' : '#2563eb'}; color: white; border: none; padding: 4px 8px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 11px;">
          ${isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      ` : `<span style="font-size: 11px; color: #94a3b8; font-style: italic; padding-right: 5px;">You</span>`;

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <div>
            <strong style="font-size: 13px; color: #111827;">${user.username}</strong>
            <div style="font-size: 11px; color: #6b7280;">${user.diploma}</div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button onclick="window.socialSystem.setViewedUser('${user.id}')" style="padding: 4px 8px; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; font-size: 11px; font-weight: 600;">Profile</button>
            ${followButton}
          </div>
        </div>
      `;
    }).join('');

    // Build the Profile Viewer Details HTML template[cite: 1]
    let profileCardHtml = this.viewedUser ? `
      <div style="background: #fafafa; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h4 style="margin: 0 0 6px 0; color: #111827; font-size: 15px;">${this.viewedUser.username} (${this.viewedUser.year})</h4>
        <div style="font-size: 12px; margin-bottom: 4px;"><strong>School:</strong> ${this.viewedUser.school}</div>
        <div style="font-size: 12px; margin-bottom: 8px;"><strong>Course:</strong> ${this.viewedUser.diploma}</div>
        
        <div style="padding: 8px; background: #fff; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 11px; color: #4b5563; line-height: 1.4;">
          <strong>About Me:</strong><br/>${this.viewedUser.bio}
        </div>
        
        <div style="margin-top: 10px; display: flex; gap: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 12px;">
          <div><strong style="color: #2563eb;">${this.viewedUser.followers.length}</strong> Followers</div>
          <div><strong style="color: #2563eb;">${this.viewedUser.following.length}</strong> Following</div>
        </div>
      </div>
    ` : `<p style="color: #94a3b8; text-align: center; font-size: 12px; margin-top: 20px;">Select a teammate to view their academic profile card.</p>`;

    this.rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>${directoryHtml}</div>
        <div>${profileCardHtml}</div>
      </div>
    `;
  }
}