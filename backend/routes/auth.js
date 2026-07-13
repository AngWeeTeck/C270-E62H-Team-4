const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken, requireAuth, sanitizeUser } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/email');

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

    const passwordMatches = user?.passwordHash
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

router.post('/forgot-password', async (req, res) => {
  const message = 'If that email belongs to an account, a reset link has been sent.';

  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = emailPattern.test(email)
      ? await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt')
      : null;

    if (!user) return res.json({ message });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const resetUrl = new URL('/', appUrl);
    resetUrl.searchParams.set('resetToken', token);
    const delivery = await sendPasswordResetEmail({
      email: user.email,
      username: user.username,
      resetUrl: resetUrl.toString()
    });

    res.json({ message, ...delivery });
  } catch (error) {
    console.error('Unable to send password reset:', error.message);
    res.json({ message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() }
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    if (!user) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to reset the password.' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = router;
