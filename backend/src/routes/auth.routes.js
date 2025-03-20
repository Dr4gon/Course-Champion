const express = require("express");
const router = express.Router();

// This will be implemented with actual controllers later
router.post("/login", (req, res) => {
  // Temporary mock response
  res.json({
    success: true,
    token: "mock-jwt-token",
    user: {
      id: 1,
      name: "Test User",
      email: req.body.email,
    },
  });
});

router.post("/register", (req, res) => {
  // Temporary mock response
  res.json({
    success: true,
    message: "User registered successfully",
    user: {
      id: 1,
      name: req.body.name,
      email: req.body.email,
    },
  });
});

module.exports = router;
