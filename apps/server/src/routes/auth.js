/**
 * Authentication Routes (Stub for Stage 2)
 *
 * TODO(stage-2): Implement user login, bcrypt password verification, JWT issuance,
 * and current user profile retrieval.
 */

const express = require('express');
const { loginSchema } = require('@festpass/shared');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    // TODO(stage-2): Query users table, verify bcrypt hash, sign JWT token
    res.status(200).json({
      success: true,
      message: 'TODO(stage-2): User login endpoint',
      token: 'stub-jwt-token',
      user: {
        id: 'stub-user-id',
        email: validated.email,
        name: 'Stage 2 User',
        role: 'admin',
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  // TODO(stage-2): Return authenticated user from req.user
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
