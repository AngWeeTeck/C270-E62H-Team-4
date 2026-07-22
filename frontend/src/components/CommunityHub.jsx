import { useMemo, useRef, useState } from 'react';
import NotificationPanel from './NotificationPanel';
import CommunityList from './CommunityList';

const buildNotification = (title, message, unread = true) => ({
  id: `${title}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title,
  message,
  time: 'just now',
  unread
});

const communitiesSeed = [
  {
    id: 1,
    name: 'DevOps Study Circle',
    description: 'Share tips, resources, and weekly check-ins.',
    members: 184,
    joined: true
  },
  {
    id: 2,
    name: 'Frontend Builders',
    description: 'Discuss React, UI polish, and debugging trends.',
    members: 92,
    joined: false
  },
  {
    id: 3,
    name: 'Cloud & CI/CD',
    description: 'Exchange deployment playbooks and troubleshooting notes.',
    members: 67,
    joined: false
  }
];

function CommunityHub({ onCommunityAction, onNotification }) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [communities, setCommunities] = useState(communitiesSeed);
  const lastNotificationRef = useRef({ key: '', time: 0 });

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  const toggleCommunity = (id) => {
    setCommunities((current) =>
      current.map((community) => {
        if (community.id !== id) return community;
        const nextJoined = !community.joined;
        const nextMembers = Math.max(0, community.members + (nextJoined ? 1 : -1));
        const title = nextJoined ? 'Community joined' : 'Community left';
        const message = `You ${nextJoined ? 'joined' : 'left'} ${community.name}.`;

        addNotification(title, message);
        if (onCommunityAction) {
          onCommunityAction(community.name, nextJoined);
        }

        return { ...community, joined: nextJoined, members: nextMembers };
      })
    );
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  const addNotification = (title, message) => {
    const notificationKey = `${title}::${message}`;
    const now = Date.now();
    const last = lastNotificationRef.current;
    if (last.key === notificationKey && now - last.time < 1000) {
      return;
    }

    lastNotificationRef.current = { key: notificationKey, time: now };
    setNotifications((current) => [buildNotification(title, message), ...current]);
    onNotification?.(message);
  };

  const handleThreadCreated = (threadTitle) => {
    addNotification('New thread created', `A new thread titled “${threadTitle}” is now live.`);
  };

  const handleVoteChanged = (targetTitle, voteValue) => {
    const action = voteValue > 0 ? 'upvoted' : voteValue < 0 ? 'downvoted' : 'cleared a vote on';
    addNotification('Vote update', `${targetTitle} was ${action}.`);
  };

  const feedNotification = (title, message) => {
    addNotification(title, message);
  };

  const handleCommunityJoined = (communityName, joined = true) => {
    const title = joined ? 'Community joined' : 'Community left';
    addNotification(title, `You ${joined ? 'joined' : 'left'} ${communityName}.`);
  };

  const announceActivity = (eventType, payload) => {
    if (eventType === 'thread-created') {
      handleThreadCreated(payload.title);
    } else if (eventType === 'vote-changed') {
      handleVoteChanged(payload.targetTitle, payload.voteValue);
    } else if (eventType === 'community-joined') {
      handleCommunityJoined(payload.communityName, payload.joined !== false);
    }
  };

  const sharedContext = { announceActivity, feedNotification };
  if (typeof window !== 'undefined') {
    window.__communityHub = sharedContext;
  }

  return (
    <div className="community-hub">
      <div className="community-tabs" role="tablist" aria-label="Community tools">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notifications'}
          className={`community-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'communities'}
          className={`community-tab ${activeTab === 'communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('communities')}
        >
          Social Communities
        </button>
      </div>

      {activeTab === 'notifications' ? (
        <NotificationPanel notifications={notifications} onMarkAllRead={markAllRead} />
      ) : (
        <CommunityList communities={communities} onToggleCommunity={toggleCommunity} />
      )}
    </div>
  );
}

export default CommunityHub;
