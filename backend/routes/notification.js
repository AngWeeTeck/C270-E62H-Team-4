const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Notification = require('../models/Notification'); // Imports your new recipe

// 1. GET: Fetch all notifications for a specific user
// URL Example: http://127.0.0.1:5000/api/notifications/Faris
router.get('/:recipient', async (req, res) => {
  try {
    const { recipient } = req.params;
    
    // Find notifications in MongoDB matching this username, newest first
    const notifications = await Notification.find({ recipient })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST: Create a notification (Perfect for testing your frontend independently!)
// URL Example: http://127.0.0.1:5000/api/notifications
router.post('/', async (req, res) => {
  try {
    const { recipient, sender, type, message } = req.body;

    // Validation to make sure data is clean
    if (!recipient || !sender || !type || !message) {
      return res.status(400).json({ error: 'Missing required notification fields' });
    }

    // Create a new document using your Mongoose model
    const newNotification = new Notification({
      id: uuidv4(),
      recipient,
      sender,
      type,
      message
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

