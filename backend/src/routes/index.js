const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.routes");
const courseRoutes = require("./course.routes");
const userRoutes = require("./user.routes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);

// API health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});

module.exports = router;
