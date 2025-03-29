const express = require('express');
const router = express.Router();
const { getPageMarkdown, extractPageId } = require('../services/notionService');

/**
 * @route   GET /api/notion/page
 * @desc    Get a Notion page content in Markdown format
 * @access  Public
 * @param   {string} url - URL of the Notion page
 */
router.get('/page', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a Notion page URL',
      });
    }

    try {
      // Validate URL by checking if a page ID can be extracted
      extractPageId(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    const pageData = await getPageMarkdown(url);

    res.json({
      success: true,
      data: pageData,
    });
  } catch (error) {
    console.error('Notion page error:', error.message);

    // Notion API error handling
    if (error.message.includes('API') || error.message.includes('Unauthorized') || error.message.includes('Access')) {
      return res.status(403).json({
        success: false,
        error: 'Error accessing the Notion page. Please check your API key and page permissions.',
      });
    }

    res.status(500).json({
      success: false,
      error: `Error retrieving Notion page: ${error.message}`,
    });
  }
});

module.exports = router;
