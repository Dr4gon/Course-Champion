const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple test route that doesn't require authentication
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend server is running successfully!',
    timestamp: new Date().toISOString(),
    status: 'success',
  });
});

// Home route
app.get('/', (req, res) => {
  // Redirect to the test HTML page
  res.redirect('/test.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/`);
  console.log(`API Test URL: http://localhost:${PORT}/api/test`);
});

module.exports = app;
