const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'development-only-change-me';
}

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email
    },
    getJwtSecret(),
    { expiresIn: '1d' }
  );
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  };
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Login is required.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Login is required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Login is required.' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (user) {
      req.user = user;
    }
  } catch (error) {
    req.user = null;
  }

  next();
}

module.exports = {
  createToken,
  optionalAuth,
  requireAuth,
  sanitizeUser
};
