import React, { useState, useEffect } from 'react';

const NotificationDisplay = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetches from your backend server port 5000
    fetch('http://localhost:5000/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error("Error fetching notifications:", err));
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '10px 0' }}>
      <h3>🔔 Your Notifications</h3>
      {notifications.length === 0 ? <p>No new notifications.</p> : (
        <ul>
          {notifications.map(notif => (
            <li key={notif.id} style={{ margin: '8px 0' }}>
              <strong>[{notif.type}]</strong> {notif.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDisplay;
