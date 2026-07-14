const express = require('express');
const router = express.Router();
<<<<<<< HEAD
=======
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');
>>>>>>> 61fc4fa (Transfer Faris demo notification/social changes to Faris-Clean)

// Mock database for Social & Community Features
let users = [
  {
    id: "1",
<<<<<<< HEAD
    username: "WeeTeck",
    school: "SOI",
    diploma: "Diploma in Information Technology",
    year: "Year 2",
    bio: "Building the core forum thread system! Let me know if you hit bugs.",
=======
    username: "User 1",
    school: "SOI",
    diploma: "Diploma in Information Technology",
    year: "Year 2",
    bio: "Building the core forum thread system! Test account 1.",
>>>>>>> 61fc4fa (Transfer Faris demo notification/social changes to Faris-Clean)
    followers: [],
    following: []
  },
  {
    id: "2",
<<<<<<< HEAD
    username: "Janelle",
    school: "SOI",
    diploma: "Diploma in Financial Technology",
    year: "Year 2",
    bio: "Working on the voting system functionality. Upvote quality content!",
=======
    username: "User 2",
    school: "SOI",
    diploma: "Diploma in Financial Technology",
    year: "Year 2",
    bio: "Working on the voting system functionality. Test account 2.",
>>>>>>> 61fc4fa (Transfer Faris demo notification/social changes to Faris-Clean)
    followers: [],
    following: []
  },
  {
    id: "3",
<<<<<<< HEAD
    username: "Faris",
    school: "SOI",
    diploma: "Common ICT Programme",
    year: "Year 2",
    bio: "Building the notifications and social engine. Switch profiles to test my follow button!",
=======
    username: "User 3",
    school: "SOI",
    diploma: "Common ICT Programme",
    year: "Year 2",
    bio: "Building the notifications and social engine. Test account 3.",
>>>>>>> 61fc4fa (Transfer Faris demo notification/social changes to Faris-Clean)
    followers: [],
    following: []
  }
];

// 1. Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// 2. Get a single user's profile info
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// 3. Toggle Follow / Unfollow
router.post('/:id/follow', (req, res) => {
  const targetId = req.params.id;
  const currentUserId = req.body.currentUserId;

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

  const isFollowing = currentUser.following.includes(targetId);

  if (isFollowing) {
    currentUser.following = currentUser.following.filter(id => id !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
    res.json({ 
      message: `Unfollowed ${targetUser.username}`, 
      currentUserFollowing: currentUser.following,
      targetUserFollowers: targetUser.followers 
    });
  } else {
    currentUser.following.push(targetId);
    targetUser.followers.push(currentUserId);
<<<<<<< HEAD
=======

    // Save a notification in MongoDB for the followed user
    const newNotif = new Notification({
      id: uuidv4(),
      recipient: targetUser.username, // e.g. "User 3"
      sender: currentUser.username,  // e.g. "User 1"
      type: "Follow",
      message: `${currentUser.username} followed your profile!`
    });
    newNotif.save()
      .then(() => console.log('Follow notification saved!'))
      .catch(err => console.error('Error saving follow notification:', err));

>>>>>>> 61fc4fa (Transfer Faris demo notification/social changes to Faris-Clean)
    res.json({ 
      message: `Followed ${targetUser.username}`, 
      currentUserFollowing: currentUser.following,
      targetUserFollowers: targetUser.followers 
    });
  }
});

module.exports = router;