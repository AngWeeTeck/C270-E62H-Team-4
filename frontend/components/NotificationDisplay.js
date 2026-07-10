import React, { useState, useEffect } from 'react';

const NotificationDisplay = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded for testing on your branch—this will automatically hook into 
  // the shared global login system once the project is fully merged!
  const currentUser = "Faris"; 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Hits your brand new backend route: /api/notifications/Faris
        const response = await fetch(`/api/notifications/${currentUser}`);
        
        if (!response.ok) {
          throw new Error('Could not retrieve notifications from database');
        }
        
        const data = await response.json();
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Loading your notifications...</div>;
  if (error) return <div style={{ padding: '20px', color: '#e53935' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', fontFamily: 'sans-serif' }}>
      <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#333' }}>
        Activity Notifications ({notifications.length})
      </h3>
      
      {notifications.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>No updates right now. You're all caught up!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: notif.isRead ? '#f8f9fa' : '#e8f0fe',
                borderLeft: notif.isRead ? '4px solid #adb5bd' : '4px solid #1a73e8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  color: notif.isRead ? '#6c757d' : '#1a73e8' 
                }}>
                  {notif.type}
                </span>
                <span style={{ fontSize: '11px', color: '#9aa0a6' }}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#3c4043' }}>
                {notif.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDisplay;