const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   POST /api/users/new
 * @desc    Register a new user
 * @access  Public
 */
router.post('/new', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Create user
    const user = await User.create(name, email, password);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    // Handle duplicate email
    if (error.message === 'User with this email already exists') {
      return res.status(400).json({
        success: false,
        error: 'Email is already registered',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (for testing purposes)
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const users = User.findAll();
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

module.exports = router;
