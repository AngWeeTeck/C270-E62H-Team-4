import React, { useState, useEffect } from 'react';

const SocialFeatures = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = '/api';

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_BASE}/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFollow = (targetId) => {
    fetch(`${API_BASE}/users/${targetId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
        // Refresh user list to see updated follower counts
        fetchUsers();
      })
      .catch(err => console.error('Error updating follow state:', err));
  };

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Loading community profiles...</div>;
  if (error) return <div style={{ padding: '20px', color: '#e53935' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#333' }}>
        👥 Community Profiles
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginTop: '15px' }}>
        {users.map(user => (
          <div 
            key={user.id} 
            style={{ 
              border: '1px solid #e0e0e0', 
              padding: '16px', 
              borderRadius: '8px', 
              background: '#f9f9f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', color: '#1a73e8' }}>{user.username}</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', fontWeight: 'bold' }}>
              {user.diploma}
            </p>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0', fontStyle: 'italic' }}>
              {user.year}
            </p>
            <p style={{ fontSize: '13px', color: '#3c4043', margin: '8px 0', fontStyle: 'italic' }}>
              "{user.bio}"
            </p>
            <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
              <strong>Followers:</strong> {user.followers.length} | <strong>Following:</strong> {user.following.length}
            </p>
            {user.id !== currentUserId && (
              <button 
                onClick={() => handleFollow(user.id)} 
                style={{ 
                  padding: '8px 12px', 
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                Toggle Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeatures;
