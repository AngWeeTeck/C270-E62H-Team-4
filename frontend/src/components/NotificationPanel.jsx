import { useMemo } from 'react';

function NotificationPanel({ notifications, onMarkAllRead }) {
  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  return (
    <div className="community-panel">
      <div className="community-panel-header">
        <div>
          <h3>Notifications</h3>
          <p>Stay updated on replies, reminders, and community activity.</p>
        </div>
        <button type="button" className="pill-button small" onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="empty-state">No notifications yet. Activity from threads, votes, and communities will appear here.</p>
        ) : notifications.map((item) => (
          <article key={item.id} className={`notification-card ${item.unread ? 'unread' : ''}`}>
            <div>
              <h4>{item.title}</h4>
              <p>{item.message}</p>
            </div>
            <span>{item.time}</span>
          </article>
        ))}
      </div>

      <p className="empty-state">Unread: {unreadCount}</p>
    </div>
  );
}

export default NotificationPanel;
