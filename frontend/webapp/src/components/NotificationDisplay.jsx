import React, { useEffect, useState } from 'react';

export default function NotificationDisplay({ currentUser = 'User 3' }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/notifications/${currentUser}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  return (
    <div style={{ padding: '12px' }}>
      <h2>Notifications for {currentUser}</h2>
      {loading && <p>Loading...</p>}
      {notifications.length === 0 && !loading && <p>No updates right now. You're all caught up!</p>}
      <div>
        {notifications.map((notif, idx) => (
          <div key={idx} style={{ 
            borderLeft: '4px solid #007bff', 
            padding: '12px', 
            marginBottom: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px'
          }}>
            <p><strong>{notif.sender}</strong> {notif.message}</p>
            <small style={{ color: '#666' }}>{notif.createdAt}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
