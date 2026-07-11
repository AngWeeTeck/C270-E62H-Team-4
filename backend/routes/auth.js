const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken, requireAuth, sanitizeUser } = require('../middleware/auth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(body) {
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const confirmPassword = String(body.confirmPassword || '');

  if (!username || !email || !password || !confirmPassword) {
    return { error: 'Username, email, password, and confirm password are required.' };
  }

  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }

  if (!emailPattern.test(email)) {
    return { error: 'Enter a valid email address.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  return { username, email, password };
}

router.post('/register', async (req, res) => {
  try {
    const validation = validateRegistration(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: validation.username },
        { email: validation.email }
      ]
    });

    if (existingUser?.username === validation.username) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    if (existingUser?.email === validation.email) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(validation.password, 12);
    const user = await User.create({
      username: validation.username,
      email: validation.email,
      passwordHash
    });

    res.status(201).json({
      message: 'Account created successfully.',
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username or email is already registered.' });
    }

    res.status(500).json({ error: 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const login = String(req.body.login || '').trim();
    const password = String(req.body.password || '');

    if (!login || !password) {
      return res.status(400).json({ error: 'Email or username and password are required.' });
    }

    const normalizedLogin = login.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalizedLogin },
        { username: login }
      ]
    });

    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    res.json({
      message: 'Login successful.',
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to login.' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = router;
