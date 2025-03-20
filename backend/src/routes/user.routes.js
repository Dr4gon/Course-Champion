const express = require("express");
const router = express.Router();

// Get current user (mock implementation)
router.get("/me", (req, res) => {
  // This would normally verify the JWT token and return the user
  res.json({
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "instructor",
  });
});

// Update current user
router.put("/me", (req, res) => {
  // This would normally update the user in the database
  res.json({
    id: 1,
    name: req.body.name || "Test User",
    email: req.body.email || "test@example.com",
    role: "instructor",
  });
});

module.exports = router;
