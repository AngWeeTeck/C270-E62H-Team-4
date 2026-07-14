function CommunityList({ communities, onToggleCommunity }) {
  return (
    <div className="community-panel">
      <div className="community-panel-header">
        <div>
          <h3>Social Communities</h3>
          <p>Find study circles and join the ones that match your goals.</p>
        </div>
      </div>

      <div className="community-list">
        {communities.map((community) => (
          <article key={community.id} className="community-card">
            <div>
              <h4>{community.name}</h4>
              <p>{community.description}</p>
              <span>{community.members} members</span>
            </div>
            <button type="button" className={`pill-button small ${community.joined ? 'secondary' : ''}`} onClick={() => onToggleCommunity(community.id)}>
              {community.joined ? 'Joined' : 'Join'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default CommunityList;
