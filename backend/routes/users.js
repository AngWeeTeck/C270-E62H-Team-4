const express = require('express');
const router = express.Router();

// Mock database for Social & Community Features
let users = [
  {
    id: "1",
    username: "WeeTeck",
    school: "SOI",
    diploma: "Diploma in Information Technology",
    year: "Year 2",
    bio: "Building the core forum thread system! Let me know if you hit bugs.",
    followers: [],
    following: []
  },
  {
    id: "2",
    username: "Janelle",
    school: "SOI",
    diploma: "Diploma in Financial Technology",
    year: "Year 2",
    bio: "Working on the voting system functionality. Upvote quality content!",
    followers: [],
    following: []
  },
  {
    id: "3",
    username: "Faris",
    school: "SOI",
    diploma: "Common ICT Programme",
    year: "Year 2",
    bio: "Building the notifications and social engine. Switch profiles to test my follow button!",
    followers: [],
    following: []
  }
];

// 1. Get all users (Perfect for populating your profile switcher UI)
router.get('/', (req, res) => {
  res.json(users);
});

// 2. Get a single user's profile info (Acceptance Criteria: View others' profiles)
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// 3. Toggle Follow / Unfollow (Acceptance Criteria: Users can follow/unfollow)
router.post('/:id/follow', (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.body.currentUserId; // Sent from frontend based on who is logged in

  if (!currentUserId) {
    return res.status(400).json({ error: "Current User ID is required to follow someone." });
  }
  if (targetId === currentUserId) {
    return res.status(400).json({ error: "You cannot follow yourself." });
  }

  const targetUser = users.find(u => u.id === targetId);
  const currentUser = users.find(u => u.id === currentUserId);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Check if current user is already following the target user
  const isFollowing = currentUser.following.includes(targetId);

  if (isFollowing) {
    // Unfollow logic
    currentUser.following = currentUser.following.filter(id => id !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
    res.json({ 
      message: `Unfollowed ${targetUser.username}`, 
      currentUserFollowing: currentUser.following,
      targetUserFollowers: targetUser.followers 
    });
  } else {
    // Follow logic
    currentUser.following.push(targetId);
    targetUser.followers.push(currentUserId);
    res.json({ 
      message: `Followed ${targetUser.username}`, 
      currentUserFollowing: currentUser.following,
      targetUserFollowers: targetUser.followers 
    });
  }
});

module.exports = router;